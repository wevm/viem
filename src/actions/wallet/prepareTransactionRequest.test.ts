import { expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { kzg } from '~test/src/kzg.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as getBlock from '../../actions/public/getBlock.js'
import { mine } from '../../actions/test/mine.js'
import { setBalance } from '../../actions/test/setBalance.js'
import { setNextBlockBaseFeePerGas } from '../../actions/test/setNextBlockBaseFeePerGas.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { http, createClient, toBlobs } from '../../index.js'
import { nonceManager } from '../../utils/index.js'
import { prepareTransactionRequest } from './prepareTransactionRequest.js'

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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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

  vi.spyOn(getBlock, 'getBlock').mockResolvedValueOnce({} as any)

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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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

test('args: gasPrice + maxFeePerGas', async () => {
  await setup()

  await expect(() =>
    // @ts-expect-error
    prepareTransactionRequest(client, {
      account: privateKeyToAccount(sourceAccount.privateKey),
      to: targetAccount.address,
      gasPrice: parseGwei('10'),
      maxFeePerGas: parseGwei('20'),
      value: parseEther('1'),
    }),
  ).rejects.toThrowError(
    'Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.',
  )
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
      "nonce": 663,
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
      "nonce": 663,
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
        "experimental_signAuthorization": [Function],
        "nonceManager": undefined,
        "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
        "sign": [Function],
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
  expect(request_1.nonce).toBe(663)

  const request_2 = await prepareTransactionRequest(client, args)
  expect(request_2.nonce).toBe(664)

  const [request_3, request_4, request_5] = await Promise.all([
    prepareTransactionRequest(client, args),
    prepareTransactionRequest(client, args),
    prepareTransactionRequest(client, args),
  ])

  expect(request_3.nonce).toBe(665)
  expect(request_4.nonce).toBe(666)
  expect(request_5.nonce).toBe(667)
})
