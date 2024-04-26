import { expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import type { Hex } from '../../types/misc.js'
import { toSmartAccount } from '../accounts/toSmartAccount.js'
import { isSmartAccount } from './isSmartAccount.js'

test('true', () => {
  const smartAccount = toSmartAccount({
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    sign: async (payload: Hex) => {
      return payload
    },
  })
  expect(isSmartAccount(smartAccount)).toBe(true)
})

test('false', async () => {
  expect(isSmartAccount(privateKeyToAccount(accounts[0].privateKey))).toBe(
    false,
  )
})
