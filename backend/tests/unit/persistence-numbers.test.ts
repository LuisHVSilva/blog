import assert from 'node:assert/strict';
import test from 'node:test';
import {PersistenceNumbers} from '../../src/infrastructures/persistence/utils/persistence-numbers';

test('Persistence counts retain zero and the full safe integer range', () => {
    for (const [input, expected] of [
        ['0', 0], ['10', 10], [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER],
        ['', 0], [' 10 ', 10], ['1e2', 100], ['0x10', 16]
    ] as const) {
        assert.equal(PersistenceNumbers.count(input), expected);
    }
    assert.ok(Object.is(PersistenceNumbers.count('-0'), -0));
});

test('Persistence counts reject negatives, non-integers, invalid values and overflow with the existing message', () => {
    for (const input of ['-1', 'invalid', '1.5', 'Infinity', '9007199254740992', '9007199254740993']) {
        assert.throws(() => PersistenceNumbers.count(input), {
            name: 'Error',
            message: 'Public count exceeds the supported integer range.'
        });
    }
});
