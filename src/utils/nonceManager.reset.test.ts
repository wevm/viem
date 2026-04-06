import { expect, test } from 'vitest'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { createNonceManager } from './nonceManager.js'

const account = privateKeyToAccount(generatePrivateKey())

const args = {
  address: account.address,
  chainId: 1,
  // mock client — only used by jsonRpc() source, not our mock source below
  client: {} as any,
}

test('reset clears stale cached nonce', async () => {
  const nonce = 5
  const nonceManager = createNonceManager({
    source: {
      get: () => nonce,
      set: () => {},
    },
  })

  // Consume nonce 5, which caches it internally
  expect(await nonceManager.consume(args)).toBe(5)

  // Transaction fails and chain nonce does not advance.
  // Reset to signal the failure.
  nonceManager.reset(args)

  // Next get should return 5 (fresh from source), not 6 (stale cache incremented)
  expect(await nonceManager.get(args)).toBe(5)
})
