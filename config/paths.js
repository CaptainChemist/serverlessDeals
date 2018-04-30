// ----------------------
// IMPORTS

const path = require('path');

// ----------------------

// Parent folder = project root
const root = path.join(__dirname, '..');

module.exports = {
  root,
  src: path.join(root, 'src'),
  config: path.join(root, 'src', 'config'),
  model: path.join(root, 'src', 'model'),
  mutations: path.join(root, 'src', 'mutations'),
  queries: path.join(root, 'src', 'queries'),
  resources: path.join(root, 'src', 'resources'),
  util: path.join(root, 'src', 'util')
};
