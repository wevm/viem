import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { keccak256 } from '../../../utils/index.js'
import { signAuthMessage } from './signAuthMessage.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({ account })
const clientWithoutChain = anvilMainnet.getClient({ chain: false })

test('default', async () => {
  expect(
    await signAuthMessage(client, {
      account,
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(
    `"0x7d46f161b04dec4b71a566ef613e01caed7d8f9aa299229b4339e08de9697efa52e0badad53bfab07a71d39ba307298f6f312b52dd5c28a49875d55fbf6474711c"`,
  )
})

test('args: nonce', async () => {
  expect(
    await signAuthMessage(client, {
      account,
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
      nonce: 69,
    }),
  ).toMatchInlineSnapshot(
    `"0xfcd6431fe0dadb937bf232178cf20663c4704ba2a545775723d6c9267d5e40162f2264c10f76c6df7608ab02c453721c841b03525a30b0bc99ebdbdb0e160f351c"`,
  )
})

test('client with account', async () => {
  expect(
    await signAuthMessage(clientWithAccount, {
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(
    `"0x7d46f161b04dec4b71a566ef613e01caed7d8f9aa299229b4339e08de9697efa52e0badad53bfab07a71d39ba307298f6f312b52dd5c28a49875d55fbf6474711c"`,
  )
})

test('client without chain', async () => {
  expect(
    await signAuthMessage(clientWithoutChain, {
      account,
      chain: anvilMainnet.chain,
      commit: keccak256('0x1234'),
      invokerAddress: '0x0000000000000000000000000000000000000000',
    }),
  ).toMatchInlineSnapshot(
    `"0x7d46f161b04dec4b71a566ef613e01caed7d8f9aa299229b4339e08de9697efa52e0badad53bfab07a71d39ba307298f6f312b52dd5c28a49875d55fbf6474711c"`,
  )
})
