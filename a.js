import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';

export async function buildSubgraph(port) {
  const typeDefs = gql`
    type Query {
      a: A
    }
    
    type Activity @key(fields: "id name") {
        id: ID!
        name: String
    }

    type A @key(fields: "id") {
      id: ID!
    }
  `;

  const resolvers = {
    Query: {
      a: () => ({}),
    },
    A: {
      id: () => 1
    },
    ItemA: {
      activity: () => ({})
    },
    Activity: {
      id: () => 1,
      name: () => 'Foo'
    }
  };

  const schema = buildSubgraphSchema({ typeDefs, resolvers });
  const server = new ApolloServer({ schema });
  const serverPort = port ?? process.env.PORT;
  const { url } = await startStandaloneServer(server, {
    listen: { port: serverPort },
  });
  console.log(`Subgraph running at ${url}`);
}
