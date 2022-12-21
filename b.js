import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';

export async function buildSubgraph(port) {
  const typeDefs = gql`
    union FeedItem = ItemA

    type ItemA {
      activity: Activity
    }

    extend type Activity @key(fields: "id name") {
      id: ID! @external
      name: String @external
    }

    extend type A @key(fields: "id") {
      id: ID! @external
      feed: [FeedItem!]!
      bar: String @requires(fields: "feed { ... on ItemA { activity { id name }}}")
    }
  `;

  const resolvers = {
    A: {
      bar: (parent) => {
        const activity = parent.feed[0].activity;
        return activity.id + activity.name;
      },
    },
  };

  const schema = buildSubgraphSchema({ typeDefs, resolvers });
  const server = new ApolloServer({ schema });
  const serverPort = port ?? process.env.PORT;
  const { url } = await startStandaloneServer(server, {
    listen: { port: serverPort },
  });
  console.log(`Subgraph running at ${url}`);
}
