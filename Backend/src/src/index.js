const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const { authMiddleware } = require('./middleware/auth');
require('dotenv').config();

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(authMiddleware); // attaches req.user

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Make user available in resolvers
      return { user: req.user };
    }
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(err => console.error(err));