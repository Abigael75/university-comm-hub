const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    fullName: String
    roles: [Role!]!
  }

  type Role {
    id: ID!
    name: String!
  }

  type Course {
    id: ID!
    code: String!
    title: String!
    lecturer: User
    materials: [Material!]!
    enrollments: [Enrollment!]!
  }

  type Enrollment {
    student: User!
    course: Course!
    grade: Float
  }

  type Material {
    id: ID!
    title: String!
    fileUrl: String!
    uploadedBy: User!
    createdAt: String!
  }

  type StudentQuery {
    id: ID!
    student: User!
    course: Course!
    message: String!
    reply: String
    status: String!
    createdAt: String!
  }

  type Announcement {
    id: ID!
    title: String!
    content: String!
    postedBy: User!
    targetRole: String
    createdAt: String!
  }

  type SystemAlert {
    id: ID!
    message: String!
    severity: String!
    createdAt: String!
  }

  type Query {
    myCourses: [Course!]!
    myGrades: [Enrollment!]!
    announcements(role: String): [Announcement!]!
    myQueries: [StudentQuery!]!
    myClasses: [Course!]!
    studentQueries(courseId: ID): [StudentQuery!]!
    courseMaterials(courseId: ID!): [Material!]!
    courseAnalytics(courseId: ID!): Analytics!
    allUsers(role: String): [User!]!
    allSystemAlerts: [SystemAlert!]!
    campusWideComms: [Announcement!]!
    systemReports: Reports!
  }

  type Analytics {
    totalStudents: Int!
    averageGrade: Float!
    materialCount: Int!
  }

  type Reports {
    totalUsers: Int!
    totalCourses: Int!
    activeQueries: Int!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    submitQuery(courseId: ID!, message: String!): StudentQuery!
    uploadResource(courseId: ID!, title: String!, fileUrl: String!): Material!
    replyToQuery(queryId: ID!, reply: String!): StudentQuery!
    assignGrade(studentId: ID!, courseId: ID!, grade: Float!): Enrollment!
    createUser(email: String!, password: String!, fullName: String!, roleNames: [String!]!): User!
    updateUserRole(userId: ID!, roleNames: [String!]!): User!
    deleteUser(userId: ID!): Boolean!
    createSystemAlert(message: String!, severity: String!): SystemAlert!
    broadcastAnnouncement(title: String!, content: String!, targetRole: String): Announcement!
    createCourse(code: String!, title: String!, lecturerId: ID!): Course!
    deleteCourse(courseId: ID!): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

module.exports = typeDefs;
