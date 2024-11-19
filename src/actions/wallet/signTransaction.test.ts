import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { celo, mainnet } from '../../chains/index.js'
import {
  http,
  type TransactionRequestBase,
  type TransactionRequestEIP1559,
  type TransactionRequestEIP2930,
  type TransactionRequestLegacy,
  createWalletClient,
  getAddress,
  parseGwei,
  recoverTransactionAddress,
  stringToHex,
} from '../../index.js'
import type {
  TransactionRequestEIP4844,
  TransactionRequestEIP7702,
} from '../../types/transaction.js'
import { toBlobs } from '../../utils/blob/toBlobs.js'
import { mine } from '../index.js'
import { prepareTransactionRequest } from './prepareTransactionRequest.js'
import { signTransaction } from './signTransaction.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]

const base = {
  from: '0x0000000000000000000000000000000000000000',
  gas: 21000n,
  nonce: 785,
} satisfies TransactionRequestBase

describe('eip7702', async () => {
  const authority = privateKeyToAccount(accounts[1].privateKey)
  const authorization = await authority.experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 420,
  })

  const baseEip7702 = {
    ...base,
    authorizationList: [authorization],
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip7702',
  } as const satisfies TransactionRequestEIP7702

  // TODO: Anvil does not support sign 7702 over JSON-RPC yet.
  test.todo('default: json-rpc')

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip7702,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  test('w/ prepareTransactionRequest', async () => {
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip7702,
    })
    const signature = await signTransaction(client, request)
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })
})

describe('eip4844', () => {
  const baseEip4844 = {
    ...base,
    blobs: toBlobs({ data: stringToHex(blobData) }),
    kzg,
    maxFeePerBlobGas: parseGwei('20'),
    to: '0x0000000000000000000000000000000000000000',
    type: 'eip4844',
  } as const satisfies TransactionRequestEIP4844

  test.todo('default: json-rpc')

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip4844,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  test('w/ prepareTransactionRequest', async () => {
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip4844,
    })
    const signature = await signTransaction(client, request)
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })
})

describe('eip1559', () => {
  const baseEip1559 = {
    ...base,
    type: 'eip1559',
  } as const satisfies TransactionRequestEIP1559

  test('default: json-rpc', async () => {
    const signature = await signTransaction(client, {
      account: sourceAccount.address,
      ...baseEip1559,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip1559,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  test('w/ prepareTransactionRequest', async () => {
    await mine(client, { blocks: 1 })

    const request_1 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      value: 1n,
    })
    const signature_1 = await signTransaction(client, request_1)
    expect(signature_1.match(/^0x02/)).toBeTruthy()

    await mine(client, { blocks: 1 })

    const request_2 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      maxFeePerGas: parseGwei('30'),
      value: 1n,
    })
    const signature_2 = await signTransaction(client, request_2)
    expect(signature_2.match(/^0x02/)).toBeTruthy()
  })

  describe('minimal', () => {
    test('default (local)', async () => {
      {
        const signature = await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          type: 'eip1559',
        })
        expect(
          await recoverTransactionAddress({
            serializedTransaction: signature,
          }),
        ).toEqual(getAddress(sourceAccount.address))
      }

      {
        const signature = await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          chain: mainnet,
          type: 'eip1559',
        })
        expect(
          await recoverTransactionAddress({
            serializedTransaction: signature,
          }),
        ).toEqual(getAddress(sourceAccount.address))
      }
    })

    test('w/ maxFeePerGas (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        maxFeePerGas: parseGwei('2'),
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })

    test('w/ type (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        type: 'eip1559',
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })
  })

  describe('args', () => {
    test('accessList (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseEip1559,
        accessList: [
          {
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            storageKeys: [
              '0x0000000000000000000000000000000000000000000000000000000000000001',
              '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
            ],
          },
        ],
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })

    test('data (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseEip1559,
        data: '0x1234',
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })

    test('maxFeePerGas/maxPriorityFeePerGas', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseEip1559,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('2'),
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })
  })
})

describe('eip2930', () => {
  const baseEip2930 = {
    ...base,
    type: 'eip2930',
  } as const satisfies TransactionRequestEIP2930

  test.skip('default: json-rpc', async () => {
    const signature = await signTransaction(client, {
      account: sourceAccount.address,
      ...baseEip2930,
    })
    expect(signature).toMatchInlineSnapshot(
      '"0x01f84f0182031180825208808080c080a089cebce5c7f728febd1060b55837c894ec2a79dd7854350abce252fc2de96b5da039f2782c70b92f4b1916aa8db91453c7229f33458bd091b3e10a40f9a7e443d2"',
    )
  })

  test('default: local', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseEip2930,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  test('w/ prepareTransactionRequest', async () => {
    await mine(client, { blocks: 1 })
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      value: 1n,
      type: 'eip2930',
    })

    const signature = await signTransaction(client, request)
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  describe('minimal', () => {
    test('w/ type (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        type: 'eip2930',
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })
  })

  describe('args', () => {
    test('accessList (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseEip2930,
        accessList: [
          {
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            storageKeys: [
              '0x0000000000000000000000000000000000000000000000000000000000000001',
              '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
            ],
          },
        ],
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })

    test('data (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseEip2930,
        data: '0x1234',
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })

    test('gasPrice (local)', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        ...baseEip2930,
        gasPrice: parseGwei('20'),
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })
  })
})

describe('legacy', () => {
  const baseLegacy = {
    ...base,
    gasPrice: parseGwei('2'),
    type: 'legacy',
  } as const satisfies TransactionRequestLegacy

  test('default', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      ...baseLegacy,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  test('w/ prepareTransactionRequest', async () => {
    await mine(client, { blocks: 1 })
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      value: 1n,
      type: 'legacy',
    })
    const signature = await signTransaction(client, request)
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(sourceAccount.address))
  })

  describe('minimal', () => {
    test('w/ type', async () => {
      const signature = await signTransaction(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        type: 'legacy',
      })
      expect(
        await recoverTransactionAddress({
          serializedTransaction: signature,
        }),
      ).toEqual(getAddress(sourceAccount.address))
    })

    describe('args', () => {
      test('data', async () => {
        const signature = await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseLegacy,
          data: '0x1234',
        })
        expect(
          await recoverTransactionAddress({
            serializedTransaction: signature,
          }),
        ).toEqual(getAddress(sourceAccount.address))
      })

      test('gas', async () => {
        const signature = await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseLegacy,
          gas: 21000n,
        })
        expect(
          await recoverTransactionAddress({
            serializedTransaction: signature,
          }),
        ).toEqual(getAddress(sourceAccount.address))
      })

      test('gasPrice', async () => {
        const signature = await signTransaction(client, {
          account: privateKeyToAccount(sourceAccount.privateKey),
          ...baseLegacy,
          gasPrice: parseGwei('20'),
        })
        expect(
          await recoverTransactionAddress({
            serializedTransaction: signature,
          }),
        ).toEqual(getAddress(sourceAccount.address))
      })
    })
  })
})

describe('custom (cip64)', () => {
  const client = createWalletClient({
    chain: celo,
    transport: http(anvilMainnet.rpcUrl.http),
  })

  test('default', async () => {
    const signature = await signTransaction(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: null,
      ...base,
      feeCurrency: '0x765de816845861e75a25fca122bb6898b8b1282a',
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('2'),
    })
    expect(signature.startsWith('0x7b')).toBeTruthy()
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      // @ts-expect-error
      signTransaction(client, {
        type: 'eip1559',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/signTransaction
      Version: viem@x.y.z]
    `)
  })
})
