'use strict';

const toast = require('..');
const assert = require('assert').strict;

assert.strictEqual(toast(), 'Hello from toast');
console.info('toast tests passed');
