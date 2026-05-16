const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Role {
    id: ID!
    name: String!
    description: String
  }

  type Course {
    id: ID!
    code: String!
    name: String!
    description: String
    lecturer: User!
    credits: Int!
    enrolledStudents: [User!]!
    materials: [Material!]!
    announcements: [Announcement!]!
    grades: [Grade!]!
  }

  type Material {
    id: ID!
    title: String!
    description: String
    fileUrl: String!
    course: Course!
    uploadedBy: User!
    uploadedAt: String!
  }

  type Announcement {
    id: ID!
    title: String!
    content: String!
    course: Course
    targetAudience: String!
    createdBy: User!
    createdAt: String!
    isPinned: Boolean!
  }

  type Grade {
    id: ID!
    student: User!
    course: Course!
    assignmentName: String!
    score: Float!
    maxScore: Float!
    percentage: Float!
    feedback: String
    gradedAt: String!
  }

  type StudentQuery {
    id: ID!
    student: User!
    course: Course!
    question: String!
    answer: String
    status: String!
    askedAt: String!
    answeredAt: String
  }

  type Analytics {
    totalStudents: Int!
    averageGrade: Float!
    courseCompletionRate: Float!
    activeQueries: Int!
    resourceUsage: ResourceAnalytics!
  }

  type ResourceAnalytics {
    totalUploads: Int!
    totalDownloads: Int!
    popularResources: [Material!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # Student queries
    myCourses: [Course!]!
    myMessages: [Announcement!]!
    myGrades: [Grade!]!
    myAnnouncements: [Announcement!]!
    
    # Lecturer queries
    myClasses: [Course!]!
    studentQueries(courseId: ID, status: String): [StudentQuery!]!
    courseAnalytics(courseId: ID!): Analytics!
    
    # Admin queries
    allUsers(role: String, isActive: Boolean): [User!]!
    systemAlerts: [Announcement!]!
    generateReports(type: String!, startDate: String!, endDate: String!): ReportData!
    
    # General queries
    user(id: ID!): User
    course(id: ID!): Course
  }

  type Mutation {
    # Authentication
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!, role: String!): AuthPayload!
    
    # Student mutations
    submitQuery(courseId: ID!, question: String!): StudentQuery!
    
    # Lecturer mutations
    uploadResource(courseId: ID!, title: String!, description: String, fileUrl: String!): Material!
    answerQuery(queryId: ID!, answer: String!): StudentQuery!
    postAnnouncement(title: String!, content: String!, targetAudience: String!, courseId: ID): Announcement!
    submitGrade(studentId: ID!, courseId: ID!, assignmentName: String!, score: Float!, maxScore: Float!, feedback: String): Grade!
    
    # Admin mutations
    manageUser(userId: ID!, isActive: Boolean, roleId: ID): User!
    createUser(email: String!, password: String!, name: String!, roleId: ID!): User!
    broadcastMessage(title: String!, content: String!, targetAudience: String!): Announcement!
    deleteUser(userId: ID!): Boolean!
    
    # General mutations
    updateProfile(name: String, email: String): User!
  }

  type ReportData {
    reportUrl: String!
    generatedAt: String!
    data: String!
  }

  # Input types
  input GradeInput {
    assignmentName: String!
    score: Float!
    maxScore: Float!
    feedback: String
  }
`;

module.exports = { typeDefs };