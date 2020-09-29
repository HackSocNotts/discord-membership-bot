import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('https://graphql.fauna.com/graphql');
client.setHeader('Authorization', `Bearer ${process.env.faunaDbToken}`);

export default client;
