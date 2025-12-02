import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { kzg } from '~test/src/kzg.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as getBlock from '../../actions/public/getBlock.js'
import { mine } from '../../actions/test/mine.js'
import { setBalance } from '../../actions/test/setBalance.js'
import { setNextBlockBaseFeePerGas } from '../../actions/test/setNextBlockBaseFeePerGas.js'
import {
  BaseError,
  createClient,
  http,
  MethodNotFoundRpcError,
  toBlobs,
} from '../../index.js'
import { defineChain, nonceManager } from '../../utils/index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import * as fillTransaction from '../public/fillTransaction.js'
import {
  defaultParameters,
  eip1559NetworkCache,
  prepareTransactionRequest,
  supportsFillTransaction,
} from './prepareTransactionRequest.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setBalance(client, {
    address: sourceAccount.address,
    value: sourceAccount.balance,
  })
  await setBalance(client, {
    address: targetAccount.address,
    value: targetAccount.balance,
  })
  await setNextBlockBaseFeePerGas(client, {
    baseFeePerGas: parseGwei('10'),
  })
  await mine(client, { blocks: 1 })
}

describe('without `eth_fillTransaction`', () => {
  beforeEach(() => {
    vi.spyOn(fillTransaction, 'fillTransaction').mockRejectedValue(
      new BaseError('Method not found', {
        cause: new MethodNotFoundRpcError(new Error('Method not found')),
      }),
    )
  })

  afterEach(() => {
    vi.spyOn(fillTransaction, 'fillTransaction').mockRestore()
  })

  test('default', async () => {
    await setup()

    const block = await getBlock.getBlock(client)
    const {
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce: _nonce,
      ...rest
    } = await prepareTransactionRequest(client, {
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + maxPriorityFeePerGas!,
    )
    expect(rest).toMatchInlineSnapshot(`
        {
          "chainId": 1,
          "gas": 21000n,
          "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "type": "eip1559",
          "value": 1000000000000000000n,
        }
      `)
  })

  test('legacy fees', async () => {
    await setup()

    eip1559NetworkCache.clear()

    vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    const { nonce: _nonce, ...request } = await prepareTransactionRequest(
      client,
      {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
      },
    )
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 11700000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "legacy",
        "value": 1000000000000000000n,
      }
    `)

    eip1559NetworkCache.clear()
  })

  test('args: account', async () => {
    await setup()

    const {
      maxFeePerGas: _maxFeePerGas,
      nonce: _nonce,
      ...rest
    } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: chain', async () => {
    await setup()

    const {
      maxFeePerGas: _maxFeePerGas,
      nonce: _nonce,
      ...rest
    } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: chainId', async () => {
    await setup()

    const {
      maxFeePerGas: _maxFeePerGas,
      nonce: _nonce,
      ...rest
    } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chainId: 69,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 69,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: nonce', async () => {
    await setup()

    const { maxFeePerGas: _maxFeePerGas, ...rest } =
      await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        nonce: 5,
        value: parseEther('1'),
      })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 5,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice', async () => {
    await setup()

    const { nonce: _nonce, ...request } = await prepareTransactionRequest(
      client,
      {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        gasPrice: parseGwei('10'),
        value: parseEther('1'),
      },
    )
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 10000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "legacy",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice (on chain w/ block.baseFeePerGas)', async () => {
    await setup()

    const { nonce: _nonce, ...request } = await prepareTransactionRequest(
      client,
      {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        gasPrice: parseGwei('10'),
        value: parseEther('1'),
      },
    )
    expect(request).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 10000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "legacy",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxFeePerGas: parseGwei('100'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 100000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxFeePerGas (under default tip)', async () => {
    await setup()

    await expect(() =>
      prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('0.1'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [MaxFeePerGasTooLowError: \`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (1 gwei).

      Version: viem@x.y.z]
    `)
  })

  test('args: maxFeePerGas (on legacy)', async () => {
    await setup()

    vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    await expect(() =>
      prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('10'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

      Version: viem@x.y.z]
    `)
  })

  test('args: maxPriorityFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 17000000000n,
        "maxPriorityFeePerGas": 5000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxPriorityFeePerGas === 0', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxPriorityFeePerGas: 0n,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 12000000000n,
        "maxPriorityFeePerGas": 0n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxPriorityFeePerGas (on legacy)', async () => {
    await setup()

    vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({
      baseFeePerGas: undefined,
    } as any)

    await expect(() =>
      prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        maxFeePerGas: parseGwei('5'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

      Version: viem@x.y.z]
    `)
  })

  test('args: maxFeePerGas + maxPriorityFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 10000000000n,
        "maxPriorityFeePerGas": 5000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice + maxPriorityFeePerGas', async () => {
    await setup()

    await expect(() =>
      // @ts-expect-error
      prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        gasPrice: parseGwei('10'),
        maxPriorityFeePerGas: parseGwei('20'),
        type: 'legacy',
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

      Version: viem@x.y.z]
    `)
  })

  test('args: type', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      type: 'eip1559',
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 13000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: blobs', async () => {
    await setup()

    const {
      blobs: _blobs,
      nonce: _nonce,
      ...rest
    } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      maxFeePerBlobGas: parseGwei('20'),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "blobVersionedHashes": [
          "0x01d34d7bd213433308d1f63023dc70fd585064cd108ee69be0637a09f4028ea3",
        ],
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 53001n,
        "kzg": {
          "blobToKzgCommitment": [Function],
          "computeBlobKzgProof": [Function],
        },
        "maxFeePerBlobGas": 20000000000n,
        "maxFeePerGas": 13000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip4844",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: parameters', async () => {
    await setup()

    const result = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)

    const result2 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas', 'fees'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result2).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 13000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const result3 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas', 'fees', 'nonce'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result3).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 13000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const result4 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas', 'fees', 'nonce', 'type'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result4).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "maxFeePerGas": 13000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const {
      blobs: _blobs,
      sidecars,
      ...result5
    } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      maxFeePerBlobGas: parseGwei('20'),
      parameters: ['sidecars'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(
      sidecars.map(({ blob: _blob, ...rest }) => rest),
    ).toMatchInlineSnapshot(`
        [
          {
            "commitment": "0xae5f688fc774ce26be308660c003c9c528a85410ce7f3138e37f424b7a31f61afaff45d74996ac5a5d83d061857b8006",
            "proof": "0xb0bab7126f83bd4ad1ae36a51f64fdef1bd198174c1a355660bf462b98075546960d33101ae778128a7693a2b110d218",
          },
        ]
      `)
    expect(result5).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "kzg": {
          "blobToKzgCommitment": [Function],
          "computeBlobKzgProof": [Function],
        },
        "maxFeePerBlobGas": 20000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('behavior: chain default priority fee', async () => {
    await setup()

    const block = await getBlock.getBlock(client)

    // client chain
    const client_1 = createClient({
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: () => parseGwei('69'),
        },
      },
      transport: http(),
    })
    const request_1 = await prepareTransactionRequest(client_1, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_1.maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('69'),
    )

    // client chain (async)
    const client_2 = createClient({
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: async () => parseGwei('69'),
        },
      },
      transport: http(),
    })
    const request_2 = await prepareTransactionRequest(client_2, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_2.maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('69'),
    )

    // client chain (bigint)
    const client_3 = createClient({
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: parseGwei('69'),
        },
      },
      transport: http(),
    })
    const request_3 = await prepareTransactionRequest(client_3, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_3.maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('69'),
    )

    // chain override (bigint)
    const request_4 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: () => parseGwei('69'),
        },
      },
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_4.maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('69'),
    )

    // chain override (async)
    const request_5 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: async () => parseGwei('69'),
        },
      },
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_5.maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('69'),
    )

    // chain override (bigint)
    const request_6 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: parseGwei('69'),
        },
      },
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_6.maxFeePerGas).toEqual(
      (block.baseFeePerGas! * 120n) / 100n + parseGwei('69'),
    )

    // chain override (bigint zero base fee)
    const request_7 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: 0n,
        },
      },
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_7.maxPriorityFeePerGas).toEqual(0n)

    // chain override (async zero base fee)
    const request_8 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: {
        ...anvilMainnet.chain,
        fees: {
          defaultPriorityFee: async () => 0n,
        },
      },
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(request_8.maxPriorityFeePerGas).toEqual(0n)
  })

  describe('behavior: chain.prepareTransactionRequest', () => {
    test('chain override with prepareTransactionRequest', async () => {
      await setup()

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args) {
            return {
              ...args,
              data: '0xdeadbeef',
            }
          },
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })
      expect(request.data).toEqual('0xdeadbeef')
    })

    test('chain override modifying gas', async () => {
      await setup()

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args) {
            return {
              ...args,
              gas: 50000n,
            }
          },
        }),
        parameters: ['fees', 'nonce', 'type'],
        to: targetAccount.address,
        value: parseEther('1'),
      })
      expect(request.gas).toEqual(50000n)
    })

    test('client chain with prepareTransactionRequest', async () => {
      await setup()

      const client_1 = createClient({
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args) {
            return {
              ...args,
              data: '0xcafebabe',
            }
          },
        }),
        transport: http(),
      })
      const request = await prepareTransactionRequest(client_1, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
      })
      expect(request.data).toEqual('0xcafebabe')
    })

    test('runAt: beforeFillTransaction (default)', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args, options) {
            phases.push(options?.phase ?? 'beforeFillTransaction')
            return {
              ...args,
              data: '0xdeadbeef',
            }
          },
        }),
        gas: 100000n,
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect(request.data).toEqual('0xdeadbeef')
      expect(phases).toEqual(['beforeFillTransaction'])
    })

    test('runAt: beforeFillParameters', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              phases.push(options?.phase ?? 'unknown')
              return {
                ...args,
                data: '0xdeadbeef',
              }
            },
            { runAt: ['beforeFillParameters'] },
          ],
        }),
        gas: 100000n,
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect(request.data).toEqual('0xdeadbeef')
      expect(phases).toEqual(['beforeFillParameters'])
    })

    test('runAt: afterFillParameters', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              phases.push(options?.phase ?? 'unknown')
              return {
                ...args,
                data: '0xdeadbeef',
              }
            },
            { runAt: ['afterFillParameters'] },
          ],
        }),
        gas: 100000n,
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect(request.data).toEqual('0xdeadbeef')
      expect(phases).toEqual(['afterFillParameters'])
    })

    test('runAt: multiple phases', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              phases.push(options?.phase ?? 'unknown')
              return {
                ...args,
                data:
                  options?.phase === 'beforeFillParameters'
                    ? '0xdead'
                    : '0xbeef',
              }
            },
            { runAt: ['beforeFillParameters', 'afterFillParameters'] },
          ],
        }),
        gas: 100000n,
        to: targetAccount.address,
        value: parseEther('1'),
      })

      // Final data should be from the last phase
      expect(request.data).toEqual('0xbeef')
      expect(phases).toEqual(['beforeFillParameters', 'afterFillParameters'])
    })

    test('runAt: can access filled parameters in afterFillParameters', async () => {
      await setup()

      let capturedGas: bigint | undefined

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              if (options?.phase === 'afterFillParameters') {
                capturedGas = args.gas
              }
              return args
            },
            { runAt: ['afterFillParameters'] },
          ],
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })

      // Gas should have been filled before afterFillParameters runs
      expect(capturedGas).toBeDefined()
      expect(capturedGas).toEqual(request.gas)
    })
  })

  test('behavior: fetches chainId from RPC when not provided', async () => {
    await setup()

    // Create a client without a chain to force chainId to be fetched from RPC
    const clientWithoutChain = createClient({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const request = await prepareTransactionRequest(clientWithoutChain, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: null,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // chainId should be fetched from the RPC (mainnet = 1)
    expect(request.chainId).toEqual(1)
  })

  test('behavior: nonce manager', async () => {
    await setup()

    const account = privateKeyToAccount(sourceAccount.privateKey, {
      nonceManager,
    })

    const args = {
      account,
      nonceManager: account.nonceManager,
      to: targetAccount.address,
      value: parseEther('1'),
      parameters: ['nonce'],
    } as const

    const request_1 = await prepareTransactionRequest(client, args)
    expect(request_1.nonce).toBe(953)

    const request_2 = await prepareTransactionRequest(client, args)
    expect(request_2.nonce).toBe(954)

    const [request_3, request_4, request_5] = await Promise.all([
      prepareTransactionRequest(client, args),
      prepareTransactionRequest(client, args),
      prepareTransactionRequest(client, args),
    ])

    expect(request_3.nonce).toBe(955)
    expect(request_4.nonce).toBe(956)
    expect(request_5.nonce).toBe(957)
  })
})

describe('with `eth_fillTransaction`', () => {
  beforeEach(() => {
    supportsFillTransaction.clear()
  })

  test('default', async () => {
    await setup()

    const transactionRequest = await prepareTransactionRequest(client, {
      parameters: defaultParameters,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(transactionRequest).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: account', async () => {
    await setup()

    const transaction = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: chain', async () => {
    await setup()

    const transaction = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: nonce', async () => {
    await setup()

    const transaction = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      nonce: 5,
      value: parseEther('1'),
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 5,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice', async () => {
    await setup()

    const transaction = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      gasPrice: parseGwei('10'),
      value: parseEther('1'),
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 10000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "legacy",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice (on chain w/ block.baseFeePerGas)', async () => {
    await setup()

    const transaction = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      gasPrice: parseGwei('10'),
      value: parseEther('1'),
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 10000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "legacy",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxFeePerGas', async () => {
    await setup()

    const transaction = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      maxFeePerGas: parseGwei('100'),
      value: parseEther('1'),
    })
    expect(transaction).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 120000000000n,
        "maxFeePerGas": 100000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxFeePerGas (under default tip)', async () => {
    await setup()

    await expect(() =>
      prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        parameters: defaultParameters,
        to: targetAccount.address,
        maxFeePerGas: parseGwei('0.1'),
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 1 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 0.1 gwei).

      Version: viem@x.y.z]
    `)
  })

  test('args: maxPriorityFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 17700000000n,
        "maxFeePerGas": 17700000000n,
        "maxPriorityFeePerGas": 5000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxPriorityFeePerGas === 0', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      maxPriorityFeePerGas: 0n,
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 11700000000n,
        "maxFeePerGas": 11700000000n,
        "maxPriorityFeePerGas": 0n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: maxFeePerGas + maxPriorityFeePerGas', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      maxFeePerGas: parseGwei('10'),
      maxPriorityFeePerGas: parseGwei('5'),
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12000000000n,
        "maxFeePerGas": 10000000000n,
        "maxPriorityFeePerGas": 5000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: gasPrice + maxPriorityFeePerGas', async () => {
    await setup()

    await expect(() =>
      // @ts-expect-error
      prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        parameters: defaultParameters,
        to: targetAccount.address,
        gasPrice: parseGwei('10'),
        maxPriorityFeePerGas: parseGwei('20'),
        type: 'legacy',
        value: parseEther('1'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Eip1559FeesNotSupportedError: Chain does not support EIP-1559 fees.

      Version: viem@x.y.z]
    `)
  })

  test('args: type', async () => {
    await setup()

    const { nonce: _nonce, ...rest } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: defaultParameters,
      to: targetAccount.address,
      type: 'eip1559',
      value: parseEther('1'),
    })
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)
  })

  test('args: parameters', async () => {
    await setup()

    const result = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const result2 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas', 'fees'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result2).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const result3 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas', 'fees', 'nonce'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result3).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const result4 = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['gas', 'fees', 'nonce', 'type'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(result4).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "chainId": 1,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "gas": 21000n,
        "gasPrice": 12900000000n,
        "maxFeePerGas": 12900000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 953,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "type": "eip1559",
        "value": 1000000000000000000n,
      }
    `)

    const {
      blobs: _blobs,
      sidecars,
      ...result5
    } = await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      maxFeePerBlobGas: parseGwei('20'),
      parameters: ['sidecars'],
      to: targetAccount.address,
      value: parseEther('1'),
    })
    expect(
      sidecars.map(({ blob: _blob, ...rest }) => rest),
    ).toMatchInlineSnapshot(`
        [
          {
            "commitment": "0xae5f688fc774ce26be308660c003c9c528a85410ce7f3138e37f424b7a31f61afaff45d74996ac5a5d83d061857b8006",
            "proof": "0xb0bab7126f83bd4ad1ae36a51f64fdef1bd198174c1a355660bf462b98075546960d33101ae778128a7693a2b110d218",
          },
        ]
      `)
    expect(result5).toMatchInlineSnapshot(`
      {
        "account": {
          "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "nonceManager": undefined,
          "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
          "sign": [Function],
          "signAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "source": "privateKey",
          "type": "local",
        },
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "kzg": {
          "blobToKzgCommitment": [Function],
          "computeBlobKzgProof": [Function],
        },
        "maxFeePerBlobGas": 20000000000n,
        "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
        "value": 1000000000000000000n,
      }
    `)
  })

  describe('behavior: chain.prepareTransactionRequest', () => {
    test('chain override with prepareTransactionRequest', async () => {
      await setup()

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args) {
            return {
              ...args,
              data: '0xdeadbeef',
            }
          },
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })
      expect(request.data).toEqual('0xdeadbeef')
    })

    test('chain override modifying gas', async () => {
      await setup()

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args) {
            return {
              ...args,
              gas: 50000n,
            }
          },
        }),
        parameters: ['fees', 'nonce', 'type'],
        to: targetAccount.address,
        value: parseEther('1'),
      })
      expect(request.gas).toEqual(50000n)
    })

    test('client chain with prepareTransactionRequest', async () => {
      await setup()

      const client_1 = createClient({
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args) {
            return {
              ...args,
              data: '0xcafebabe',
            }
          },
        }),
        transport: http(),
      })
      const request = await prepareTransactionRequest(client_1, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        to: targetAccount.address,
        value: parseEther('1'),
      })
      expect(request.data).toEqual('0xcafebabe')
    })

    test('runAt: beforeFillTransaction (default)', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          async prepareTransactionRequest(args, options) {
            phases.push(options?.phase ?? 'beforeFillTransaction')
            return {
              ...args,
              data: '0xdeadbeef',
            }
          },
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect(request.data).toEqual('0xdeadbeef')
      expect(phases).toEqual(['beforeFillTransaction'])
    })

    test('runAt: beforeFillParameters', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              phases.push(options?.phase ?? 'unknown')
              return {
                ...args,
                data: '0xdeadbeef',
              }
            },
            { runAt: ['beforeFillParameters'] },
          ],
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect(request.data).toEqual('0xdeadbeef')
      expect(phases).toEqual(['beforeFillParameters'])
    })

    test('runAt: afterFillParameters', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              phases.push(options?.phase ?? 'unknown')
              return {
                ...args,
                data: '0xdeadbeef',
              }
            },
            { runAt: ['afterFillParameters'] },
          ],
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })

      expect(request.data).toEqual('0xdeadbeef')
      expect(phases).toEqual(['afterFillParameters'])
    })

    test('runAt: multiple phases', async () => {
      await setup()

      const phases: string[] = []

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              phases.push(options?.phase ?? 'unknown')
              return {
                ...args,
                data:
                  options?.phase === 'beforeFillParameters'
                    ? '0xdead'
                    : '0xbeef',
              }
            },
            { runAt: ['beforeFillParameters', 'afterFillParameters'] },
          ],
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })

      // Final data should be from the last phase
      expect(request.data).toEqual('0xbeef')
      expect(phases).toEqual(['beforeFillParameters', 'afterFillParameters'])
    })

    test('runAt: can access filled parameters in afterFillParameters', async () => {
      await setup()

      let capturedGas: bigint | undefined

      const request = await prepareTransactionRequest(client, {
        account: privateKeyToAccount(sourceAccount.privateKey),
        chain: defineChain({
          ...anvilMainnet.chain,
          prepareTransactionRequest: [
            async (args, options) => {
              if (options?.phase === 'afterFillParameters') {
                capturedGas = args.gas
              }
              return args
            },
            { runAt: ['afterFillParameters'] },
          ],
        }),
        to: targetAccount.address,
        value: parseEther('1'),
      })

      // Gas should have been filled before afterFillParameters runs
      expect(capturedGas).toBeDefined()
      expect(capturedGas).toEqual(request.gas)
    })
  })

  test('behavior: fetches chainId from RPC when not provided', async () => {
    await setup()

    // Create a client without a chain to force chainId to be fetched from RPC
    const clientWithoutChain = createClient({
      transport: http(anvilMainnet.rpcUrl.http),
    })

    const request = await prepareTransactionRequest(clientWithoutChain, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chain: null,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // chainId should be fetched from the RPC (mainnet = 1)
    expect(request.chainId).toEqual(1)
  })

  test('behavior: nonce manager', async () => {
    await setup()

    const account = privateKeyToAccount(sourceAccount.privateKey, {
      nonceManager,
    })

    const args = {
      account,
      nonceManager: account.nonceManager,
      to: targetAccount.address,
      value: parseEther('1'),
      parameters: defaultParameters,
    } as const

    const request_1 = await prepareTransactionRequest(client, args)
    expect(request_1.nonce).toBe(958)

    const request_2 = await prepareTransactionRequest(client, args)
    expect(request_2.nonce).toBe(959)

    const [request_3, request_4, request_5] = await Promise.all([
      prepareTransactionRequest(client, args),
      prepareTransactionRequest(client, args),
      prepareTransactionRequest(client, args),
    ])

    expect(request_3.nonce).toBe(960)
    expect(request_4.nonce).toBe(961)
    expect(request_5.nonce).toBe(962)
  })
})

describe('behavior: attemptFill', () => {
  beforeEach(() => {
    supportsFillTransaction.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('behavior: do not attempt fill when supportsFillTransaction is false', async () => {
    await setup()

    supportsFillTransaction.set(client.uid, false)

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      value: parseEther('1'),
    })

    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when all parameters are already provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chainId: 1,
      gas: 21000n,
      maxFeePerGas: parseGwei('100'),
      maxPriorityFeePerGas: parseGwei('5'),
      nonce: 5,
      to: targetAccount.address,
      value: parseEther('1'),
    })

    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when parameters do not include fees or gas', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['nonce', 'chainId', 'type'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when chainId is already provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      chainId: 1,
      parameters: ['chainId'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because chainId is already a number
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when nonce is already provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      nonce: 5,
      parameters: ['nonce'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because nonce is already a number
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when gasPrice is provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      gasPrice: parseGwei('10'),
      parameters: ['fees'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because gasPrice is already provided
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when maxFeePerGas and maxPriorityFeePerGas are provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      maxFeePerGas: parseGwei('100'),
      maxPriorityFeePerGas: parseGwei('5'),
      parameters: ['fees'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because fee params are already provided
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: attempt fill when maxFeePerGas is provided but maxPriorityFeePerGas is not', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      maxFeePerGas: parseGwei('100'),
      parameters: ['fees'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should be called because maxPriorityFeePerGas is missing
    expect(fillTransactionSpy).toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when gas is provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      gas: 21000n,
      maxFeePerGas: parseGwei('100'),
      maxPriorityFeePerGas: parseGwei('5'),
      parameters: ['gas'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because gas is already provided
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: attempt fill when gas is not provided', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      maxFeePerGas: parseGwei('100'),
      maxPriorityFeePerGas: parseGwei('5'),
      parameters: ['gas'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should be called because gas needs to be estimated
    expect(fillTransactionSpy).toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when blobs and kzg are provided with blobVersionedHashes parameter', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      maxFeePerBlobGas: parseGwei('20'),
      parameters: ['blobVersionedHashes', 'gas'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because blobs and kzg are provided with blobVersionedHashes parameter
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when blobs and kzg are provided with sidecars parameter', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      gas: 21000n,
      maxFeePerBlobGas: parseGwei('20'),
      parameters: ['gas', 'sidecars'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because blobs and kzg are provided with sidecars parameter
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: do not attempt fill when blobVersionedHashes parameter is set but blobs or kzg are missing', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      maxFeePerGas: parseGwei('100'),
      maxPriorityFeePerGas: parseGwei('5'),
      gas: 21000n,
      parameters: ['blobVersionedHashes', 'fees'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction should not be called because:
    // 1. fees check passes (maxFeePerGas and maxPriorityFeePerGas are provided)
    // 2. blob check returns false (blobs/kzg are missing)
    expect(fillTransactionSpy).not.toHaveBeenCalled()
  })

  test('behavior: attempt fill when only blobVersionedHashes parameter is set without blobs/kzg but gas is missing', async () => {
    await setup()

    const fillTransactionSpy = vi.spyOn(fillTransaction, 'fillTransaction')

    await prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      parameters: ['blobVersionedHashes', 'gas'],
      to: targetAccount.address,
      value: parseEther('1'),
    })

    // fillTransaction will be called because 'gas' is in parameters and gas is not provided
    expect(fillTransactionSpy).toHaveBeenCalled()
  })
})
