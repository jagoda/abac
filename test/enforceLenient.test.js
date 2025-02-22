'use strict';

import {enforceLenient} from '../dist';
import test from 'ava';

test('Partially evaluated policy should enforce properly', t => {
  const policy = {
    rules: {
      accessAdmin: true,
      readData: true,
      deleteData: [
        {
          'resource.dataset': {
            comparison: 'equals',
            value: 'project'
          }
        }
      ],
      updateData: [
        {
          'resource.ownerId': {
            comparison: 'equals',
            target: 'user.id'
          }
        }
      ]
    }
  };

  t.true(enforceLenient('accessAdmin', policy));
  t.true(enforceLenient('readData', policy));
  t.falsy(enforceLenient('billingAdmin', policy));

  // updateData and deleteData are allowed, because
  // the rules allow them for some attributes, so
  // in the absence of the full attribute set
  // the best we can do is allow it. This is why
  // enforceLenient shouldn't be used for actually
  // securing access, but is fine for a client application.
  t.true(enforceLenient('updateData', policy));
  t.true(enforceLenient('deleteData', policy));

  // Given full information enforceLenient does give correct answers:
  t.falsy(enforceLenient('updateData', policy, {resource: {ownerId: 'john'}, user: {id: 'jane'}}));
  t.true(enforceLenient('deleteData', policy, {resource: {dataset: 'project'}}));
  t.falsy(enforceLenient('deleteData', policy, {resource: {dataset: 'project2'}}));
});

test('returns false for invalid operation names', t => {
  t.false(enforceLenient('not-an-operation', {rules: {}}));
});
