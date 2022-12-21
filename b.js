import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';

export async function buildSubgraph(port) {
  const typeDefs = gql`
    extend schema
      @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@external", "@requires", "@shareable"])

    union FeedItem = ItemA

    type ItemA @shareable {
      activity: Activity @external
    }

    type Activity @key(fields: "id") {
      id: ID!
      name: String @external
    }

    type A @key(fields: "id") {
      id: ID!
      feed: [FeedItem!]! @external
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
