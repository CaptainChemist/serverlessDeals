const PATHS = require('./config/paths');

module.exports = {
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  rules: {
    // 0=off, 1=warn, 2=error
    'arrow-parens': 0,
    camelcase: 0, // keep off
    'comma-dangle': [2, 'never'],
    'import/prefer-default-export': 1, // keep 1 on commit
    'linebreak-style': 0,
    'no-console': [
      'error',
      { allow: ['log', 'dir', 'warn', 'time', 'timeEnd'] }
    ],
    'no-param-reassign': ['error', { props: false }], // allow company to be added to context
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': 0, // keep off
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        caughtErrors: 'all'
      }
    ],
    'object-curly-newline': ['error', { multiline: true }],
    'prefer-destructuring': ['error', { object: false, array: false }],
    'prefer-const': ['error', { ignoreReadBeforeAssign: true }]
  },
  settings: {
    'import/resolver': {
      node: {
        paths: [PATHS.root, 'node_modules']
      }
    }
  }
};
