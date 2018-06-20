import dbModel from './model';
import queries from './queries';
import mutations from './mutations';
import { constructIds } from './util/idManipulation';
import { authenticate } from './util/auth';
import graphQLError from './util/errors';

const { makeExecutableSchema } = require('graphql-tools');
const lambdaPlayground = require('graphql-playground-middleware-lambda').default;
const { graphqlLambda } = require('apollo-server-lambda');
const middy = require('middy');
const { cors } = require('middy/middlewares');

const awsXRay = require('aws-xray-sdk');
const awsSdk = awsXRay.captureAWS(require('aws-sdk'));

const { deal, contract } = process.env; // retrieve all environmental varas in serverless.yml

// This contains all the type definitions for the models used
// as well as the input fields allowed for queries and mutations & their output types
const typeDefs = `

  type DealType {
    id: String,
    name: String,
    address: String,
    contracts: [ContractType],
    updatedAt: String,
    createdAt: String
  }

  type ContractType {
    id: String,
    name: String,
    term: Float,
    deal: DealType
  }

  type UserType {
    role: String,
    id: String
  }

  type Query {
    deal(id: String): DealType,
    dealByName(name: String): DealType,
    deals: [DealType],
    contract(id: String): ContractType,
    contractByName(name: String, dealName: String): ContractType,
    contracts(dealId: String): [ContractType],
    hello(name: String): String!,
    me: UserType
  }

  type Mutation {
    createDeal(
      name: String,
      address: String
    ): DealType,
    createContract(
      term: Float,
      name: String,
      deal: String
    ): ContractType
  }
`;

const resolvers = {
  // query and mutation resolvers fetch data and resolve first and then based on the return type
  // these custom types such as DealType, will resolve after the base resolution to fill in
  // one-one, one-many, many-many relationships automatically
  // i.e. deal query only fetches deal info-
  // then based on contracts function, we populate contracts
  DealType: { contracts: ({ id }, args, { db }) => queries.findMany(db.Contents, contract, id) },
  ContractType: {
    deal: ({ id }, args, { db }) => {
      const { dealId } = constructIds(id);
      return db.Contents.get({ type: deal, id: dealId });
    }
  },
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
    deal: (_, { id }, { db }) => db.Contents.get({ type: deal, id }),
    dealByName: (_, { name }, { db }) => queries.dealByName(db.Contents, name),
    deals: (_, args, { db }) => queries.findManyParent(db.Contents, deal),
    contract: (_, { id }, { db }) => db.Contents.get({ type: contract, id }),
    contractByName: (_, { name, dealName }, { db }) =>
      queries.contractByName(db.Contents, name, dealName),
    contracts: (_, { dealId }, { db }) => queries.findMany(db.Contents, contract, dealId),
    me: (_, args, { user }) => user
  },
  Mutation: {
    createDeal: (_, args, { db }) => mutations.create({ rest: args, type: deal, db }),
    createContract: (_, { deal, ...rest }, { db }) =>
      mutations.create({ base: deal, rest, type: contract, db })
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

export const server = middy(async (event, lambdaContext, callback) => {
  switch (event.httpMethod) {
    case 'GET':
      return lambdaPlayground({ endpoint: '/' })(event, lambdaContext, callback);

    case 'OPTIONS':
      return callback(null, {
        headers: {
          'access-control-allow-headers': 'Authorization,content-type',
          'access-control-allow-methods': 'GET,POST',
          'access-control-allow-origin': '*'
        },
        statusCode: 204
      });

    default: {
      return graphqlLambda({
        tracing: true,
        cacheControl: true,
        schema,
        context: await authenticate(event.headers.Authorization)
          .then(user => ({
            db: dbModel,
            user,
            callback
          }))
          .catch(() => graphQLError({ context: { callback }, message: '[401] Unauthorized' }))
      })(event, lambdaContext, callback);
    }
  }
}).use(cors());
