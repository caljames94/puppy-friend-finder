import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import db from './config/connection.js'
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './utils/auth.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

const startApolloServer = async () => {
  try {
    await server.start();
    await db();

    const PORT = process.env.PORT || 3001;
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/graphql', expressMiddleware(server, {
       // context: async () => ({ user: null }) // Uncomment for basic authentication for testing//
      context: async ({ req }) => ({ user: await authenticateToken({ req }) })
    }));
      

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../../client/dist')));

      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
      });
    }

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  };
};

startApolloServer();