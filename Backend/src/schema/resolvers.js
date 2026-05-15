const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/mysql');

async function getUserRoles(userId) {
  const [rows] = await db.query(
    `SELECT r.name FROM roles r
     JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [userId]
  );
  return rows.map(r => r.name);
}

function requireAuth(user) {
  if (!user) throw new Error('Authentication required');
}

function requireRole(user, allowedRoles) {
  requireAuth(user);
  const userRoles = user.roles || [];
  const hasRole = allowedRoles.some(role => userRoles.includes(role));
  if (!hasRole) throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
}

const resolvers = {
  Query: {
    myCourses: async (_, args, { user }) => {
      requireRole(user, ['student']);
      const [rows] = await db.query(
        `SELECT c.* FROM courses c
         JOIN enrollments e ON e.course_id = c.id
         WHERE e.student_id = ?`,
        [user.id]
      );
      return rows;
    },
    myGrades: async (_, args, { user }) => {
      requireRole(user, ['student']);
      const [rows] = await db.query(
        `SELECT e.grade, c.id as courseId, c.title, c.code
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id = ?`,
        [user.id]
      );
      return rows.map(row => ({
        student: { id: user.id },
        course: { id: row.courseId, title: row.title, code: row.code },
        grade: row.grade
      }));
    },
    announcements: async (_, { role }, { user }) => {
      const [rows] = await db.query(
        `SELECT * FROM announcements WHERE targetRole IN ('all', ?) OR targetRole IS NULL`,
        [role || 'all']
      );
      return rows;
    },
    myQueries: async (_, args, { user }) => {
      requireRole(user, ['student']);
      const [rows] = await db.query(
        `SELECT q.*, c.title as courseTitle FROM student_queries q
         JOIN courses c ON q.course_id = c.id
         WHERE q.student_id = ?`,
        [user.id]
      );
      return rows;
    },
    myClasses: async (_, args, { user }) => {
      requireRole(user, ['lecturer']);
      const [rows] = await db.query(
        `SELECT * FROM courses WHERE lecturer_id = ?`,
        [user.id]
      );
      return rows;
    },
    studentQueries: async (_, { courseId }, { user }) => {
      requireRole(user, ['lecturer']);
      let query = `SELECT q.*, u.full_name as studentName FROM student_queries q
                   JOIN users u ON q.student_id = u.id
                   JOIN courses c ON q.course_id = c.id
                   WHERE c.lecturer_id = ?`;
      const params = [user.id];
      if (courseId) {
        query += ` AND q.course_id = ?`;
        params.push(courseId);
      }
      const [rows] = await db.query(query, params);
      return rows;
    },
    courseMaterials: async (_, { courseId }, { user }) => {
      requireRole(user, ['lecturer', 'student']);
      const [rows] = await db.query(
        `SELECT m.*, u.full_name as uploadedByName FROM materials m
         JOIN users u ON m.uploaded_by = u.id
         WHERE m.course_id = ?`,
        [courseId]
      );
      return rows;
    },
    courseAnalytics: async (_, { courseId }, { user }) => {
      requireRole(user, ['lecturer']);
      const [course] = await db.query(`SELECT lecturer_id FROM courses WHERE id = ?`, [courseId]);
      if (course.length === 0 || course[0].lecturer_id !== user.id)
        throw new Error('Not authorized for this course');
      
      const [stats] = await db.query(
        `SELECT COUNT(DISTINCT student_id) as totalStudents,
                AVG(grade) as avgGrade,
                (SELECT COUNT(*) FROM materials WHERE course_id = ?) as materialCount
         FROM enrollments WHERE course_id = ?`,
        [courseId, courseId]
      );
      return {
        totalStudents: stats[0].totalStudents || 0,
        averageGrade: stats[0].avgGrade || 0,
        materialCount: stats[0].materialCount || 0
      };
    },
    allUsers: async (_, { role }, { user }) => {
      requireRole(user, ['admin']);
      let query = `SELECT u.*, GROUP_CONCAT(r.name) as roleNames
                   FROM users u
                   JOIN user_roles ur ON u.id = ur.user_id
                   JOIN roles r ON ur.role_id = r.id`;
      const params = [];
      if (role) {
        query += ` WHERE r.name = ?`;
        params.push(role);
      }
      query += ` GROUP BY u.id`;
      const [rows] = await db.query(query, params);
      return rows.map(row => ({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        roles: row.roleNames.split(',').map(name => ({ name }))
      }));
    },
    allSystemAlerts: async (_, args, { user }) => {
      requireRole(user, ['admin']);
      const [rows] = await db.query(`SELECT * FROM system_alerts ORDER BY created_at DESC`);
      return rows;
    },
    campusWideComms: async (_, args, { user }) => {
      requireRole(user, ['admin']);
      const [rows] = await db.query(`SELECT * FROM announcements WHERE targetRole = 'all' OR targetRole IS NULL`);
      return rows;
    },
    systemReports: async (_, args, { user }) => {
      requireRole(user, ['admin']);
      const [totalUsers] = await db.query(`SELECT COUNT(*) as count FROM users`);
      const [totalCourses] = await db.query(`SELECT COUNT(*) as count FROM courses`);
      const [activeQueries] = await db.query(`SELECT COUNT(*) as count FROM student_queries WHERE status = 'pending'`);
      return {
        totalUsers: totalUsers[0].count,
        totalCourses: totalCourses[0].count,
        activeQueries: activeQueries[0].count
      };
    }
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const [users] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
      if (users.length === 0) throw new Error('Invalid credentials');
      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) throw new Error('Invalid credentials');
      const roles = await getUserRoles(user.id);
      const token = jwt.sign(
        { id: user.id, email: user.email, roles },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return { token, user: { ...user, roles: roles.map(r => ({ name: r })) } };
    },
    submitQuery: async (_, { courseId, message }, { user }) => {
      requireRole(user, ['student']);
      const [result] = await db.query(
        `INSERT INTO student_queries (student_id, course_id, message, status)
         VALUES (?, ?, ?, 'pending')`,
        [user.id, courseId, message]
      );
      const [newQuery] = await db.query(`SELECT * FROM student_queries WHERE id = ?`, [result.insertId]);
      return newQuery[0];
    },
    uploadResource: async (_, { courseId, title, fileUrl }, { user }) => {
      requireRole(user, ['lecturer']);
      const [course] = await db.query(`SELECT lecturer_id FROM courses WHERE id = ?`, [courseId]);
      if (course.length === 0 || course[0].lecturer_id !== user.id)
        throw new Error('You can only upload to your own courses');
      const [result] = await db.query(
        `INSERT INTO materials (course_id, title, file_url, uploaded_by) VALUES (?, ?, ?, ?)`,
        [courseId, title, fileUrl, user.id]
      );
      const [material] = await db.query(`SELECT * FROM materials WHERE id = ?`, [result.insertId]);
      return material[0];
    },
    replyToQuery: async (_, { queryId, reply }, { user }) => {
      requireRole(user, ['lecturer']);
      const [query] = await db.query(
        `SELECT q.id FROM student_queries q
         JOIN courses c ON q.course_id = c.id
         WHERE q.id = ? AND c.lecturer_id = ?`,
        [queryId, user.id]
      );
      if (query.length === 0) throw new Error('Query not found or not yours');
      await db.query(
        `UPDATE student_queries SET reply = ?, status = 'replied' WHERE id = ?`,
        [reply, queryId]
      );
      const [updated] = await db.query(`SELECT * FROM student_queries WHERE id = ?`, [queryId]);
      return updated[0];
    },
    assignGrade: async (_, { studentId, courseId, grade }, { user }) => {
      requireRole(user, ['lecturer']);
      const [course] = await db.query(`SELECT lecturer_id FROM courses WHERE id = ?`, [courseId]);
      if (course.length === 0 || course[0].lecturer_id !== user.id)
        throw new Error('Not authorized for this course');
      await db.query(
        `UPDATE enrollments SET grade = ? WHERE student_id = ? AND course_id = ?`,
        [grade, studentId, courseId]
      );
      const [updated] = await db.query(
        `SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?`,
        [studentId, courseId]
      );
      return updated[0];
    },
    createUser: async (_, { email, password, fullName, roleNames }, { user }) => {
      requireRole(user, ['admin']);
      const hash = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        `INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
        [email, hash, fullName]
      );
      const userId = result.insertId;
      for (let roleName of roleNames) {
        const [role] = await db.query(`SELECT id FROM roles WHERE name = ?`, [roleName]);
        if (role.length) {
          await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, role[0].id]);
        }
      }
      const newUser = { id: userId, email, fullName, roles: roleNames.map(r => ({ name: r })) };
      return newUser;
    },
    updateUserRole: async (_, { userId, roleNames }, { user }) => {
      requireRole(user, ['admin']);
      await db.query(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);
      for (let roleName of roleNames) {
        const [role] = await db.query(`SELECT id FROM roles WHERE name = ?`, [roleName]);
        if (role.length) {
          await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, role[0].id]);
        }
      }
      const [updatedUser] = await db.query(`SELECT * FROM users WHERE id = ?`, [userId]);
      const roles = await getUserRoles(userId);
      return { ...updatedUser[0], roles: roles.map(r => ({ name: r })) };
    },
    deleteUser: async (_, { userId }, { user }) => {
      requireRole(user, ['admin']);
      await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
      return true;
    },
    createSystemAlert: async (_, { message, severity }, { user }) => {
      requireRole(user, ['admin']);
      const [result] = await db.query(
        `INSERT INTO system_alerts (message, severity) VALUES (?, ?)`,
        [message, severity]
      );
      const [alert] = await db.query(`SELECT * FROM system_alerts WHERE id = ?`, [result.insertId]);
      return alert[0];
    },
    broadcastAnnouncement: async (_, { title, content, targetRole }, { user }) => {
      requireRole(user, ['admin']);
      const [result] = await db.query(
        `INSERT INTO announcements (title, content, posted_by, target_role) VALUES (?, ?, ?, ?)`,
        [title, content, user.id, targetRole || 'all']
      );
      const [ann] = await db.query(`SELECT * FROM announcements WHERE id = ?`, [result.insertId]);
      return ann[0];
    },
    createCourse: async (_, { code, title, lecturerId }, { user }) => {
      requireRole(user, ['admin']);
      const [result] = await db.query(
        `INSERT INTO courses (code, title, lecturer_id) VALUES (?, ?, ?)`,
        [code, title, lecturerId]
      );
      const [course] = await db.query(`SELECT * FROM courses WHERE id = ?`, [result.insertId]);
      return course[0];
    },
    deleteCourse: async (_, { courseId }, { user }) => {
      requireRole(user, ['admin']);
      await db.query(`DELETE FROM courses WHERE id = ?`, [courseId]);
      return true;
    }
  }
};

module.exports = resolvers;