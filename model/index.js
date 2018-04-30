import dynamoose from 'dynamoose';
import _ from 'lodash';

dynamoose.AWS.config.update({ region: 'us-east-1' });

const Deals = {
  id: { type: String, rangeKey: true },
  type: { type: String, hashKey: true },
  name: { type: String },
  address: { type: String }
};

const Contracts = {
  id: { type: String, rangeKey: true },
  type: {
    type: String,
    hashKey: true,
    index: {
      global: true,
      rangeKey: 'name',
      name: 'typeNameIndex',
      project: false,
      throughput: 1
    }
  },
  name: { type: String },
  term: { type: Number }
};

const Contents = dynamoose.model(
  process.env.CONTENT_TABLE,
  new dynamoose.Schema(_.assign({}, Deals, Contracts), { timestamps: true }),
  { update: true }
);

const db = { Contents };

export default db;
