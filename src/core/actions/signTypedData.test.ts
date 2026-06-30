import { expect, test } from 'vitest'
import { Account, Actions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const client = anvil.getWalletClient(anvil.mainnet)
const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
const jsonRpcAccount = constants.accounts[0].address

test('local account: basic', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.basic,
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"`,
  )
})

test('json-rpc account: basic', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.basic,
      account: jsonRpcAccount,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"`,
  )
})

test('inferred account', async () => {
  const client = anvil.getWalletClient(anvil.mainnet, {
    account: jsonRpcAccount,
  })
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.basic,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"`,
  )
})

test('minimal: local account', async () => {
  expect(
    await Actions.signTypedData(client, {
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {},
      account,
    }),
  ).toMatchInlineSnapshot(
    `"0xda87197eb020923476a6d0149ca90bc1c894251cc30b38e0dd2cdd48567e12386d3ed40a509397410a4fd2d66e1300a39ac42f828f8a5a2cb948b35c22cf29e81c"`,
  )
})

test('minimal: json-rpc account', async () => {
  expect(
    await Actions.signTypedData(client, {
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {},
      // @ts-expect-error
      message: {},
      account: jsonRpcAccount,
    }),
  ).toMatchInlineSnapshot(
    `"0xda87197eb020923476a6d0149ca90bc1c894251cc30b38e0dd2cdd48567e12386d3ed40a509397410a4fd2d66e1300a39ac42f828f8a5a2cb948b35c22cf29e81c"`,
  )
})

test('complex: local account', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c"`,
  )
})

test('complex: json-rpc account', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      account: jsonRpcAccount,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c"`,
  )
})

test('args: domain: empty', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: undefined,
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x47d36c0110609e0c61169b221edfcd988455a67a0af965285c9c32bcc5df791f180b8e9a539e6a12e7af164f1de5879b09e4c1ef3032980bc7aea167198255eb1c"`,
  )
})

test('args: domain: zeroish chainId', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: { chainId: 0 },
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x0ab57c83d3eebb0015ea5382d70aae9a5724a35fb9904f52c505bf783c10364639c126471a542ac6a1b5dcd8f1dc2dc5b1ce346f063ff6104750d53029a7c8cb1c"`,
  )
})

test('args: domain: chainId', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: { chainId: 1 },
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c"`,
  )
})

test('args: domain: empty name', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: { name: '' },
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x270eb0f0209a0d43d328327dad9b04bf1ec67dc1fca3fb3235385b7b4a64410621fea5d2d64d3ef41266b17fffda854bc03083ba7ce8e9b740d643ac9dc98e911c"`,
  )
})

test('args: domain: name', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: { name: 'Ether!' },
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0xb2b9704a23b0e5a5e728623113ab57e93a9de055b53c15d5d0f1a6485932efc503d77c0cfc2eca82cd9b4ecd2b39355457e4dd390ccb6d5c4457a2631b53baa21b"`,
  )
})

test('args: domain: verifyingContract', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: {
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0xa74d8aa1ff14231fedeaf7a929e86ac55d80256bee24e1f8ebba9bd092a9351651b6669da7f5d0a7209243f8dee1026b018ed03dd5ce01b7ecb75a8880deeeb01b"`,
  )
})

test('args: domain: salt', async () => {
  expect(
    await Actions.signTypedData(client, {
      ...constants.typedData.complex,
      domain: {
        salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
      },
      account,
      primaryType: 'Mail',
    }),
  ).toMatchInlineSnapshot(
    `"0x4b193383278fd3dcaa084952ea282cb9c8889c26c6caaa3f48aca7bde78c6e72028bd98c0328e40d067dbbab53733f99f241d8cf91a32580883f65264c2b72581b"`,
  )
})

test('error: no account', async () => {
  await expect(
    Actions.signTypedData(client, {
      ...constants.typedData.basic,
      primaryType: 'Mail',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Account.NotFoundError: Could not find an Account to execute with this Action.

    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@2.52.1]
  `)
})
