'use strict';

const createRemixBreeze = require('..');
const assert = require('assert').strict;

assert.strictEqual(createRemixBreeze(), 'Hello from createRemixBreeze');
console.info('createRemixBreeze tests passed');
