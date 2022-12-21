import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

export async function buildGateway(port) {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        {
          name: 'a',
          url: 'http://localhost:4001/graphql',
        },
        {
          name: 'b',
          url: 'http://localhost:4002/graphql',
        },
      ],
    }),
  });

  const server = new ApolloServer({
    gateway,
  });

  const serverPort = port ?? process.env.PORT;
  const { url } = await startStandaloneServer(server, {
    listen: { port: serverPort }
  });
  console.log(`Gateway running at ${url}`);
}
