const { fileExact } = require('./fileExact.js');
const path = require('path');

let status = false;

fileExact(path.resolve(__dirname, './fileExact.js'), status);