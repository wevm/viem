import { expect, test } from 'vitest'

import { testClient } from '../../../test'

import { getAutomine } from './getAutomine'
import { setAutomine } from './setAutomine'

test('sets automine status', async () => {
  await setAutomine(testClient, true)
  expect(await getAutomine(testClient)).toEqual(true)
  await setAutomine(testClient, false)
  expect(await getAutomine(testClient)).toEqual(false)
})
