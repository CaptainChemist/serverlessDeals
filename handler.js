import { GraphQLServerLambda } from 'graphql-yoga';
import dbModel from './model';
import queries from './queries';
import mutations from './mutations';
import { constructIds } from './util/idManipulation';
import { authenticate } from './util/auth';

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

// This is the main server object. There is essentially express going on under the hood
const lambda = new GraphQLServerLambda({
  typeDefs,
  context: ({ event, context }) =>
    authenticate(event.headers.Authorization, context) 
      .then(user => ({ 
        db: mainDb, 
        user 
      })) 
      .catch(e => { 
        throw new Error('[401] Unauthorized'); 
      }),
  resolvers: {
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
  }
});

exports.server = (event, context, callback) => { 
  const modifiedCallback = (error, output) => { 
    if (output.body.includes('401')) { 
      callback(null, { 
        statusCode: 401, 
        headers: { 'Content-Type': 'application/javascript' }, 
        body: JSON.stringify({ message: 'Unauthorized' }) 
      }); 
    } else { 
      callback(error, output); 
    } 
  }; 
  return lambda.graphqlHandler(event, context, modifiedCallback); 
}; 

exports.playground = lambda.playgroundHandler;
