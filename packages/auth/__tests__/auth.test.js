'use strict';

const auth = require('..');
const assert = require('assert').strict;

assert.strictEqual(auth(), 'Hello from auth');
console.info('auth tests passed');
