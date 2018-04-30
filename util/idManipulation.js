export const constructIds = id => {
  const splitArgs = id.split('#');

  switch (splitArgs.length) {
    case 1:
      return { dealId: splitArgs[0] };
    case 2:
      return {
        dealId: splitArgs[0],
        contractId: `${splitArgs[0]}#${splitArgs[1]}`
      };
    default:
      throw new Error('createIds: the input id has no length or is too big');
  }
};
