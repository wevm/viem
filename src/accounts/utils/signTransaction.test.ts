import { assertType, describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { blobData, kzg } from '../../../test/src/kzg.js'
import { prepareTransactionRequest } from '../../actions/index.js'
import {
  concatHex,
  getAddress,
  recoverTransactionAddress,
  stringToHex,
  toHex,
  toRlp,
} from '../../index.js'
import type {
  TransactionSerializable,
  TransactionSerializableBase,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableGeneric,
  TransactionSerializableLegacy,
  TransactionSerializedLegacy,
} from '../../types/transaction.js'
import { sidecarsToVersionedHashes } from '../../utils/blob/sidecarsToVersionedHashes.js'
import { toBlobSidecars } from '../../utils/blob/toBlobSidecars.js'
import { toBlobs } from '../../utils/blob/toBlobs.js'
import type { SerializeTransactionFn } from '../../utils/transaction/serializeTransaction.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { privateKeyToAccount } from '../privateKeyToAccount.js'
import { signTransaction } from './signTransaction.js'

const client = anvilMainnet.getClient()

const base = {
  gas: 21000n,
  nonce: 785,
} satisfies TransactionSerializableBase

describe('eip7702', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const signedAuthorization_1 = await account.experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 1,
    nonce: 420,
  })
  const signedAuthorization_2 = await account.experimental_signAuthorization({
    contractAddress: wagmiContractConfig.address,
    chainId: 10,
    nonce: 69,
  })

  const baseEip7702 = {
    ...base,
    authorizationList: [signedAuthorization_1, signedAuthorization_2],
    chainId: 1,
    type: 'eip7702',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseEip7702,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })
})

describe('eip4844', async () => {
  const sidecars = toBlobSidecars({ data: stringToHex('abcd'), kzg })
  const blobVersionedHashes = sidecarsToVersionedHashes({ sidecars })

  const baseEip4844 = {
    ...base,
    blobVersionedHashes,
    chainId: 1,
    sidecars,
    type: 'eip4844',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseEip4844,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: blobs + kzg', async () => {
    const blobs = toBlobs({ data: stringToHex(blobData) })
    const signature = await signTransaction({
      transaction: { ...base, blobs, chainId: 1, kzg, type: 'eip4844' },
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('w/ prepareTransactionRequest', async () => {
    const blobs = toBlobs({ data: stringToHex(blobData) })
    const request = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(accounts[0].privateKey),
      blobs: blobs,
      kzg,
      maxFeePerBlobGas: parseGwei('20'),
      to: '0x0000000000000000000000000000000000000000',
    })
    await signTransaction({
      transaction: request,
      privateKey: accounts[0].privateKey,
    })
  })
})

describe('eip1559', () => {
  const baseEip1559 = {
    ...base,
    chainId: 1,
    type: 'eip1559',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseEip1559,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('minimal (w/ maxFeePerGas)', async () => {
    const args = {
      chainId: 1,
      maxFeePerGas: 1n,
    }
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('minimal (w/ type)', async () => {
    const args = {
      chainId: 1,
      type: 'eip1559',
    } as const
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: accessList', async () => {
    const args = {
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
    } satisfies TransactionSerializableEIP1559
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: data', async () => {
    const args = {
      ...baseEip1559,
      data: '0x1234',
    } satisfies TransactionSerializableEIP1559
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: maxFeePerGas/maxPriorityFeePerGas', async () => {
    const args = {
      ...baseEip1559,
      maxFeePerGas: parseGwei('20'),
      maxPriorityFeePerGas: parseGwei('2'),
    } satisfies TransactionSerializableEIP1559
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })
})

describe('eip2930', () => {
  const baseEip2930 = {
    ...base,
    chainId: 1,
    type: 'eip2930',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseEip2930,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('minimal (w/ accessList & gasPrice)', async () => {
    const args = {
      chainId: 1,
      accessList: [
        {
          address: '0x0000000000000000000000000000000000000000',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        },
      ],
      gasPrice: parseGwei('2'),
    } as TransactionSerializableEIP2930
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('minimal (w/ type)', async () => {
    const args = {
      chainId: 1,
      type: 'eip2930',
    } as const
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: accessList', async () => {
    const args = {
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
    } satisfies TransactionSerializableEIP2930
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: data', async () => {
    const args = {
      ...baseEip2930,
      data: '0x1234',
    } satisfies TransactionSerializableEIP2930
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: gasPrice', async () => {
    const args = {
      ...baseEip2930,
      gasPrice: parseGwei('20'),
    } satisfies TransactionSerializableEIP2930
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })
})

describe('with custom EIP2718 serializer', () => {
  type ExampleTransaction = Omit<TransactionSerializableGeneric, 'type'> & {
    type: 'cip64'
    chainId: number
    additionalField: `0x${string}`
  }

  test('default', async () => {
    const exampleSerializer: SerializeTransactionFn<ExampleTransaction> = vi.fn(
      (transaction) => {
        const {
          chainId,
          nonce,
          gas,
          to,
          value,
          additionalField,
          maxFeePerGas,
          maxPriorityFeePerGas,
          data,
        } = transaction

        const serializedTransaction = [
          chainId ? toHex(chainId) : '0x',
          nonce ? toHex(nonce) : '0x',
          maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
          maxFeePerGas ? toHex(maxFeePerGas) : '0x',
          gas ? toHex(gas) : '0x',
          additionalField ?? '0x',
          to ?? '0x',
          value ? toHex(value) : '0x',
          data ?? '0x',
          [],
        ]

        return concatHex(['0x08', toRlp(serializedTransaction)])
      },
    )

    const example2718Transaction: ExampleTransaction = {
      ...base,
      type: 'cip64',
      additionalField: '0x0000',
      chainId: 42240,
    }

    const signature = await signTransaction({
      transaction: example2718Transaction,
      privateKey: accounts[0].privateKey,
      serializer: exampleSerializer,
    })
    expect(signature).toBeDefined()
    expect(exampleSerializer).toHaveBeenCalledWith(example2718Transaction)
  })
})

describe('legacy', () => {
  const baseLegacy = {
    ...base,
    gasPrice: parseGwei('2'),
    type: 'legacy',
  } as const satisfies TransactionSerializable

  test('default', async () => {
    const signature = await signTransaction({
      transaction: baseLegacy,
      privateKey: accounts[0].privateKey,
    })
    assertType<TransactionSerializedLegacy>(signature)
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('minimal (w/ gasPrice)', async () => {
    const args = {
      gasPrice: parseGwei('2'),
    } as TransactionSerializableEIP2930
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('minimal (w/ type)', async () => {
    const args = {
      type: 'legacy',
    } as const
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: data', async () => {
    const args = {
      ...baseLegacy,
      data: '0x1234',
    } satisfies TransactionSerializableLegacy
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: gas', async () => {
    const args = {
      ...baseLegacy,
      gas: 21000n,
    } satisfies TransactionSerializableLegacy
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: gasPrice', async () => {
    const args = {
      ...baseLegacy,
      gasPrice: parseGwei('20'),
    } satisfies TransactionSerializableLegacy
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })

  test('args: chainId', async () => {
    const args = {
      ...baseLegacy,
      chainId: 1,
    } satisfies TransactionSerializableLegacy
    const signature = await signTransaction({
      transaction: args,
      privateKey: accounts[0].privateKey,
    })
    expect(
      await recoverTransactionAddress({
        serializedTransaction: signature,
      }),
    ).toEqual(getAddress(accounts[0].address))
  })
})
