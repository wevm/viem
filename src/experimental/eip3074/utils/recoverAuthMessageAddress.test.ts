import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { getAddress, keccak256 } from '../../../utils/index.js'
import { recoverAuthMessageAddress } from './recoverAuthMessageAddress.js'
import { signAuthMessage } from './signAuthMessage.js'

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
  expect(await recoverAuthMessageAddress({ ...parameters, signature })).toEqual(
    getAddress(accounts[0].address),
  )
})
