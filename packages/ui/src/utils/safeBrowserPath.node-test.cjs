'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, 'safeBrowserPath.js'), 'utf8');
const exported = {};
const wrapped = src
    .replace(/export function (\w+)/g, 'function $1')
    .concat('\nmodule.exports = { isUsableBrowserPath, isMissingFlowPath, assignLocationIfUsable, replaceMissingFlowPath };\n');
const mod = { exports: {} };
vm.runInNewContext(wrapped, { module: mod, exports: mod.exports });
const { assignLocationIfUsable, isUsableBrowserPath, replaceMissingFlowPath } = mod.exports;

test('rejects JS holes that would navigate to /undefined', () => {
    assert.equal(isUsableBrowserPath(undefined), false);
    assert.equal(isUsableBrowserPath(null), false);
    assert.equal(isUsableBrowserPath('undefined'), false);
    assert.equal(isUsableBrowserPath('/undefined'), false);
    assert.equal(isUsableBrowserPath('/v2/agentcanvas/undefined'), false);
    assert.equal(isUsableBrowserPath('/canvas-island/undefined'), false);
    assert.equal(isUsableBrowserPath(''), false);
});

test('accepts real Flowise routes and UUIDs', () => {
    assert.equal(isUsableBrowserPath('/'), true);
    assert.equal(isUsableBrowserPath('/signin'), true);
    assert.equal(isUsableBrowserPath('/v2/agentcanvas'), true);
    assert.equal(isUsableBrowserPath('/v2/agentcanvas/40c7ee5e-e191-4547-83f1-4c5dcc8d9356'), true);
    assert.equal(isUsableBrowserPath('/canvas/40c7ee5e-e191-4547-83f1-4c5dcc8d9356?x=1'), true);
});

test('never assigns location.href when redirectUrl is missing', () => {
    const locationRef = { href: '/login' };
    assert.equal(assignLocationIfUsable(undefined, locationRef), false);
    assert.equal(assignLocationIfUsable({ redirectUrl: '/' }, locationRef), false);
    assert.equal(locationRef.href, '/login');
    assert.equal(assignLocationIfUsable('/', locationRef), true);
    assert.equal(locationRef.href, '/');
});

test('replaceState drops a literal undefined path back to /', () => {
    const locationRef = { pathname: '/undefined' };
    let called;
    const historyRef = { replaceState: (...args) => { called = args; } };
    assert.equal(replaceMissingFlowPath(locationRef, historyRef), true);
    assert.deepEqual(called, [null, '', '/']);
    assert.equal(replaceMissingFlowPath({ pathname: '/v2/agentcanvas/abc' }, historyRef), false);
});
