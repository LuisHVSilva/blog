import assert from 'node:assert/strict';
import test from 'node:test';
import {safelyLog} from '../../src/infrastructures/logging/safely-log';

test('Safe logging invokes the writer immediately and contains synchronous and asynchronous failures', async () => {
    let calls = 0;
    assert.doesNotThrow(() => safelyLog(() => {
        calls++;
        throw new Error('Synchronous log failure');
    }));
    assert.equal(calls, 1);
    assert.equal(safelyLog(() => {
        calls++;
        return Promise.reject(new Error('Asynchronous log failure'));
    }), undefined);
    assert.equal(calls, 2);
    await new Promise<void>((resolve) => setImmediate(resolve));
});

test('Safe logging never waits for a pending writer', () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    assert.equal(safelyLog(() => pending), undefined);
    release();
});
