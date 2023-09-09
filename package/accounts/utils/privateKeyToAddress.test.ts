import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAddress } from './privateKeyToAddress.js'

test('default', () => {
  expect(privateKeyToAddress(accounts[0].privateKey).toLowerCase()).toEqual(
    accounts[0].address,
  )
})
