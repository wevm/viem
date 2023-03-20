import { describe, expect, test } from 'vitest'
import { getAccount } from '../../utils'
import {
  walletClientWithAccount,
  accounts,
  getLocalAccount,
  walletClient,
} from '../../_test'

import { signTypedData, validateTypedData } from './signTypedData'

const localAccount = getLocalAccount(accounts[0].privateKey)
const jsonRpcAccount = accounts[0].address

const basic = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  },
  types: {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
} as const

const complex = {
  domain: {
    name: 'Ether Mail 🥵',
    version: '1.1.1',
    chainId: 1,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  },
  types: {
    Name: [
      { name: 'first', type: 'string' },
      { name: 'last', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'Name' },
      { name: 'wallet', type: 'address' },
      { name: 'favoriteColors', type: 'string[3]' },
      { name: 'foo', type: 'uint256' },
      { name: 'age', type: 'uint8' },
      { name: 'isCool', type: 'bool' },
    ],
    Mail: [
      { name: 'timestamp', type: 'uint256' },
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
      { name: 'hash', type: 'bytes' },
    ],
  },
  message: {
    timestamp: 1234567890n,
    contents: 'Hello, Bob! 🖤',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    from: {
      name: {
        first: 'Cow',
        last: 'Burns',
      },
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      age: 69,
      foo: 123123123123123123n,
      favoriteColors: ['red', 'green', 'blue'],
      isCool: false,
    },
    to: {
      name: { first: 'Bob', last: 'Builder' },
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      age: 70,
      foo: 123123123123123123n,
      favoriteColors: ['orange', 'yellow', 'green'],
      isCool: true,
    },
  },
} as const

describe('default', async () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...basic,
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...basic,
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
    )
  })
})

test('inferred account', async () => {
  expect(
    await signTypedData(walletClientWithAccount, {
      ...basic,
      primaryType: 'Mail',
    }),
  ).toEqual(
    '0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b',
  )
})

describe('minimal', () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        types: {
          EIP712Domain: [],
        },
        primaryType: 'EIP712Domain',
        domain: {},
        message: {},
        account: jsonRpcAccount,
      }),
    ).toEqual(
      '0xda87197eb020923476a6d0149ca90bc1c894251cc30b38e0dd2cdd48567e12386d3ed40a509397410a4fd2d66e1300a39ac42f828f8a5a2cb948b35c22cf29e81c',
    )
  })

  // TODO: Unskip this once we have own wallet implementation that follows EIP-712.
  // Ethers.js Wallets do not honor the most minimal valid typed data schema.
  test.skip('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        types: {
          EIP712Domain: [],
        },
        primaryType: 'EIP712Domain',
        domain: {},
        message: {},
        account: localAccount,
      }),
    ).toEqual(
      '0xda87197eb020923476a6d0149ca90bc1c894251cc30b38e0dd2cdd48567e12386d3ed40a509397410a4fd2d66e1300a39ac42f828f8a5a2cb948b35c22cf29e81c',
    )
  })
})

describe('complex', async () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xc4d8bcda762d35ea79d9542b23200f46c2c1899db15bf929bbacaf609581db0831538374a01206517edd934e474212a0f1e2d62e9a01cd64f1cf94ea2e0988491c',
    )
  })
})

describe('args: domain: empty', () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: undefined,
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x47d36c0110609e0c61169b221edfcd988455a67a0af965285c9c32bcc5df791f180b8e9a539e6a12e7af164f1de5879b09e4c1ef3032980bc7aea167198255eb1c',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: undefined,
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x47d36c0110609e0c61169b221edfcd988455a67a0af965285c9c32bcc5df791f180b8e9a539e6a12e7af164f1de5879b09e4c1ef3032980bc7aea167198255eb1c',
    )
  })
})

describe('args: domain: chainId', () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          chainId: 1,
        },
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          chainId: 1,
        },
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c',
    )
  })
})

describe('args: domain: name', () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          name: 'Ether!',
        },
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xb2b9704a23b0e5a5e728623113ab57e93a9de055b53c15d5d0f1a6485932efc503d77c0cfc2eca82cd9b4ecd2b39355457e4dd390ccb6d5c4457a2631b53baa21b',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          name: 'Ether!',
        },
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xb2b9704a23b0e5a5e728623113ab57e93a9de055b53c15d5d0f1a6485932efc503d77c0cfc2eca82cd9b4ecd2b39355457e4dd390ccb6d5c4457a2631b53baa21b',
    )
  })
})

describe('args: domain: verifyingContract', () => {
  test('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xa74d8aa1ff14231fedeaf7a929e86ac55d80256bee24e1f8ebba9bd092a9351651b6669da7f5d0a7209243f8dee1026b018ed03dd5ce01b7ecb75a8880deeeb01b',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xa74d8aa1ff14231fedeaf7a929e86ac55d80256bee24e1f8ebba9bd092a9351651b6669da7f5d0a7209243f8dee1026b018ed03dd5ce01b7ecb75a8880deeeb01b',
    )
  })
})

describe('args: domain: salt', () => {
  // TODO: Anvil has issues with hex bytes.
  test.skip('json-rpc account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
        },
        account: jsonRpcAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0xa74d8aa1ff14231fedeaf7a929e86ac55d80256bee24e1f8ebba9bd092a9351651b6669da7f5d0a7209243f8dee1026b018ed03dd5ce01b7ecb75a8880deeeb01b',
    )
  })

  test('local account', async () => {
    expect(
      await signTypedData(walletClient, {
        ...complex,
        domain: {
          salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
        },
        account: localAccount,
        primaryType: 'Mail',
      }),
    ).toEqual(
      '0x4b193383278fd3dcaa084952ea282cb9c8889c26c6caaa3f48aca7bde78c6e72028bd98c0328e40d067dbbab53733f99f241d8cf91a32580883f65264c2b72581b',
    )
  })
})

describe('validateTypedData', () => {
  test('default', () => {
    validateTypedData({
      domain: {
        name: 'Ether!',
        version: '1',
        chainId: 1,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    })
  })

  test('negative uint', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'favouriteNumber', type: 'uint8' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            favouriteNumber: -1,
          },
          to: {
            name: 'Bob',
            favouriteNumber: -50,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Number \\"-1\\" is not in safe 8-bit unsigned integer range (0 to 255)

      Version: viem@1.0.2"
    `)
  })

  test('uint overflow', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'favouriteNumber', type: 'uint8' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            favouriteNumber: 256,
          },
          to: {
            name: 'Bob',
            favouriteNumber: 0,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Number \\"256\\" is not in safe 8-bit unsigned integer range (0 to 255)

      Version: viem@1.0.2"
    `)
  })

  test('int underflow', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'favouriteNumber', type: 'int8' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            favouriteNumber: -129,
          },
          to: {
            name: 'Bob',
            favouriteNumber: 0,
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Number \\"-129\\" is not in safe 8-bit signed integer range (-128 to 127)

      Version: viem@1.0.2"
    `)
  })

  test('invalid address', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            wallet: '0x0000000000000000000000000000000000000000',
          },
          to: {
            name: 'Bob',
            wallet: '0x000000000000000000000000000000000000z',
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Address \\"0x000000000000000000000000000000000000z\\" is invalid.

      Version: viem@1.0.2"
    `)
  })

  test('bytes size mismatch', () => {
    expect(() =>
      validateTypedData({
        types: {
          EIP712Domain: [],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'hash', type: 'bytes32' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            hash: '0x0000000000000000000000000000000000000000',
          },
          to: {
            name: 'Bob',
            hash: '0x0000000000000000000000000000000000000000',
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Expected bytes32, got bytes20.

      Version: viem@1.0.2"
    `)
  })

  test('domain: invalid chainId', () => {
    expect(() =>
      validateTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          chainId: -1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Number \\"-1\\" is not in safe 256-bit unsigned integer range (0 to 115792089237316195423570985008687907853269984665640564039457584007913129639935)

      Version: viem@1.0.2"
    `)
  })

  test('domain: invalid contract', () => {
    expect(() =>
      validateTypedData({
        domain: {
          name: 'Ether!',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCczCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Address \\"0xCczCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC\\" is invalid.

      Version: viem@1.0.2"
    `)
  })
})

test('no account', async () => {
  await expect(() =>
    // @ts-expect-error
    signTypedData(walletClient, {
      ...basic,
      primaryType: 'Mail',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

    Docs: https://viem.sh/docs/actions/wallet/signTypedData.html#account
    Version: viem@1.0.2"
  `)
})
