import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { keccak256 } from '../../../utils/index.js'
import { signAuthMessage } from './signAuthMessage.js'
import { verifyAuthMessage } from './verifyAuthMessage.js'

test('default', async () => {
  const parameters = {
    chainId: 1,
    commit: keccak256('0x1234'),
    invokerAddress: '0x0000000000000000000000000000000000000000',
    nonce: 69,
  } as const
  const signature = await signAuthMessage({
    ...parameters,
    privateKey: accounts[0].privateKey,
  })
  expect(
    await verifyAuthMessage({
      ...parameters,
      address: accounts[0].address,
      signature,
    }),
  ).toBeTruthy()
})
