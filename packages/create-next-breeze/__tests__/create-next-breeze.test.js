'use strict';

const createNextBreeze = require('..');
const assert = require('assert').strict;

assert.strictEqual(createNextBreeze(), 'Hello from createNextBreeze');
console.info('createNextBreeze tests passed');
