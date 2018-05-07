import shortid from 'shortid';

export default {
  create: ({ base = '', type, rest, db: { Contents } }) => {
    const filler = base === '' ? '' : '#';
    return new Contents({
      id: `${base}${filler}${shortid.generate()}`,
      type,
      ...rest
    }).save();
  }
};
