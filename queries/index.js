import _ from 'lodash';
import { constructIds } from '../util/idManipulation';

const queries = {
  findMany: (model, type, id) =>
    model
      .query('type')
      .eq(type)
      .where('id')
      .beginsWith(id)
      .exec(),
  findOne: (model, type, id) => model.get({ type, id }),
  findManyParent: (model, type) =>
    model
      .query('type')
      .eq(type)
      .exec(),
  contractByName: async (model, name, dealName) => {
    const contracts = await model
      .query('type')
      .using('typeNameIndex')
      .eq('contract')
      .where('name')
      .eq(name)
      .exec();

    if (contracts.length > 1) {
      console.log('Backend Warning- two contracts with same name, looking up by deal name');

      await Promise.all(contracts.map(async contract => {
        const { dealId } = constructIds(contract.id);
        const deal = await model.get({ type: 'deal', id: dealId });
        contract.deal = deal;
      }));
      return _.filter(contracts, ['deal.name', dealName])[0];
    }
    return contracts[0];
  },
  dealByName: async (model, name) => {
    const deals = await model
      .query('type')
      .using('typeNameIndex')
      .eq('deal')
      .where('name')
      .eq(name)
      .exec();
    console.log(deals);
    if (deals.length > 1) {
      console.log('Backend Warning- two deals with same name');
    }
    return deals[0];
  }
};

export default queries;
