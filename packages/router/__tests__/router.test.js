'use strict';

const router = require('..');
const assert = require('assert').strict;

assert.strictEqual(router(), 'Hello from router');
console.info('router tests passed');
