import { expect, test } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { keccak256 } from '../../../utils/index.js'
import { signAuthMessage } from './signAuthMessage.js'

const account = privateKeyToAccount(accounts[0].privateKey)

test('default', async () => {
  const client = createClient({
    chain: mainnet,
    transport: http(),
  })
  expect(
    await signAuthMessage(client, {
      account,
      chainId: 1,
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
      nonce: 69,
    }),
  ).toMatchInlineSnapshot(
    `"0xfcd6431fe0dadb937bf232178cf20663c4704ba2a545775723d6c9267d5e40162f2264c10f76c6df7608ab02c453721c841b03525a30b0bc99ebdbdb0e160f351c"`,
  )
})

test('hoisted account', async () => {
  const client = createClient({
    account,
    chain: mainnet,
    transport: http(),
  })
  expect(
    await signAuthMessage(client, {
      chainId: 1,
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
      nonce: 69,
    }),
  ).toMatchInlineSnapshot(
    `"0xfcd6431fe0dadb937bf232178cf20663c4704ba2a545775723d6c9267d5e40162f2264c10f76c6df7608ab02c453721c841b03525a30b0bc99ebdbdb0e160f351c"`,
  )
})
