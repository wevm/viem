import { describe, expect, test } from 'vitest'

import { accounts, typedData } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { recoverTypedDataAddress } from '../../utils/signature/recoverTypedDataAddress.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { signTypedData } from './signTypedData.js'

const localAccount = privateKeyToAccount(accounts[0].privateKey)
const jsonRpcAccount = accounts[0].address

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({
  account: jsonRpcAccount,
})

describe('default', async () => {
  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.basic,
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.basic,
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.basic,
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.basic,
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

test('inferred account', async () => {
  const signature = await signTypedData(clientWithAccount, {
    ...typedData.basic,
    primaryType: 'Mail',
  })
  expect(
    await recoverTypedDataAddress({
      ...typedData.basic,
      primaryType: 'Mail',
      signature,
    }),
  ).toEqual(getAddress(clientWithAccount.account.address))
})

describe('minimal', () => {
  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {},
      // @ts-expect-error
      message: {},
      account: jsonRpcAccount,
    })
    expect(
      await recoverTypedDataAddress({
        types: {
          EIP712Domain: [],
        },
        primaryType: 'EIP712Domain',
        domain: {},
        // @ts-expect-error
        message: {},
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {},
      account: localAccount,
    })
    expect(
      await recoverTypedDataAddress({
        types: {
          EIP712Domain: [],
        },
        primaryType: 'EIP712Domain',
        domain: {},
        // @ts-expect-error
        message: {},
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

describe('complex', async () => {
  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

describe('args: domain: empty', () => {
  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: undefined,
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: undefined,
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: undefined,
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: undefined,
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

describe('args: domain: chainId', () => {
  test('zeroish chainId', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        chainId: 0,
      },
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          chainId: 0,
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        chainId: 1,
      },
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          chainId: 1,
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        chainId: 1,
      },
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          chainId: 1,
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

describe('args: domain: name', () => {
  test('empty name', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        name: '',
      },
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          name: '',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        name: 'Ether!',
      },
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          name: 'Ether!',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        name: 'Ether!',
      },
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          name: 'Ether!',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

describe('args: domain: verifyingContract', () => {
  test('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(localAccount.address))
  })
})

describe('args: domain: salt', () => {
  // TODO: Anvil has issues with hex bytes.
  test.skip('json-rpc account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
      },
      account: jsonRpcAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })

  test('local account', async () => {
    const signature = await signTypedData(client, {
      ...typedData.complex,
      domain: {
        salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
      },
      account: localAccount,
      primaryType: 'Mail',
    })
    expect(
      await recoverTypedDataAddress({
        ...typedData.complex,
        domain: {
          salt: '0x123512315aaaa1231313b1231b23b13b123aa12312211b1b1b111bbbb1affafa',
        },
        primaryType: 'Mail',
        signature,
      }),
    ).toEqual(getAddress(jsonRpcAccount))
  })
})

test('no account', async () => {
  await expect(() =>
    // @ts-expect-error
    signTypedData(client, {
      ...typedData.basic,
      primaryType: 'Mail',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Docs: https://viem.sh/docs/actions/wallet/signTypedData
    Version: viem@x.y.z]
  `)
})
