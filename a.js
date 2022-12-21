import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';

export async function buildSubgraph(port) {
  const typeDefs = gql`
    extend schema
      @link(url: "https://specs.apollo.dev/federation/v2.0",
        import: ["@key", "@shareable"])

    type Query {
      a: A
    }
    
    union FeedItem = ItemA
    
    type ItemA @shareable {
        activity: Activity
    }
    
    type Activity @key(fields: "id") {
        id: ID!
        name: String
    }

    type A @key(fields: "id") {
      id: ID!
      feed: [FeedItem!]!
    }
  `;

  const resolvers = {
    Query: {
      a: () => ({}),
    },
    A: {
      id: () => 1,
      feed: () => [{__typename: 'ItemA'}]
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
