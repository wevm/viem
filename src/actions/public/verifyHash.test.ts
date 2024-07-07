import { describe, expect, test } from 'vitest'

import { Mock4337AccountFactory07 } from '~contracts/generated.js'
import { ensPublicResolverConfig, smartAccountConfig } from '~test/src/abis.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { accounts, address } from '~test/src/constants.js'
import { deployMock4337Account_07 } from '~test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { zkSync } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { serializeErc6492Signature } from '../../experimental/index.js'
import { signMessage as signMessageErc1271 } from '../../experimental/solady/actions/signMessage.js'
import type { Hex } from '../../types/misc.js'
import {
  encodeFunctionData,
  hashMessage,
  pad,
  toBytes,
} from '../../utils/index.js'
import { parseSignature } from '../../utils/signature/parseSignature.js'
import { mine } from '../test/mine.js'
import { signMessage } from '../wallet/signMessage.js'
import { writeContract } from '../wallet/writeContract.js'
import { simulateContract } from './simulateContract.js'
import { verifyHash } from './verifyHash.js'

const client = anvilMainnet.getClient()

const localAccount = privateKeyToAccount(accounts[0].privateKey)

describe('local account', async () => {
  test('hex', async () => {
    const signature = await signMessage(client, {
      account: localAccount,
      message: 'hello world',
    })

    expect(
      verifyHash(client, {
        address: localAccount.address,
        hash: hashMessage('hello world'),
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('bytes', async () => {
    const signature = await signMessage(client, {
      account: localAccount,
      message: 'hello world',
    })

    expect(
      verifyHash(client, {
        address: localAccount.address,
        hash: hashMessage('hello world'),
        signature: toBytes(signature),
      }),
    ).resolves.toBe(true)
  })

  test('object', async () => {
    const signature = await signMessage(client, {
      account: localAccount,
      message: 'hello world',
    })

    expect(
      verifyHash(client, {
        address: localAccount.address,
        hash: hashMessage('hello world'),
        signature: parseSignature(signature),
      }),
    ).resolves.toBe(true)
  })
})

describe('smart account', async () => {
  test('deployed', async () => {
    const { factoryAddress } = await deployMock4337Account_07()

    const { request, result: verifier } = await simulateContract(client, {
      account: localAccount,
      abi: Mock4337AccountFactory07.abi,
      address: factoryAddress,
      functionName: 'createAccount',
      args: [localAccount.address, pad('0x0')],
    })
    await writeContract(client, request)
    await mine(client, { blocks: 1 })

    const signature = await signMessageErc1271(client, {
      account: localAccount,
      message: 'hello world',
      verifier,
    })

    expect(
      verifyHash(client, {
        address: verifier,
        hash: hashMessage('hello world'),
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('undeployed', async () => {
    const { factoryAddress } = await deployMock4337Account_07()

    const { result: verifier } = await simulateContract(client, {
      account: localAccount,
      abi: Mock4337AccountFactory07.abi,
      address: factoryAddress,
      functionName: 'createAccount',
      args: [localAccount.address, pad('0x0')],
    })

    const factoryData = encodeFunctionData({
      abi: Mock4337AccountFactory07.abi,
      functionName: 'createAccount',
      args: [localAccount.address, pad('0x0')],
    })

    const signature = await signMessageErc1271(client, {
      account: localAccount,
      factory: factoryAddress,
      factoryData,
      message: 'hello world',
      verifier,
    })

    expect(
      verifyHash(client, {
        address: verifier,
        factory: factoryAddress,
        factoryData,
        hash: hashMessage('hello world'),
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('deployed w/ factory + factoryData', async () => {
    const { factoryAddress } = await deployMock4337Account_07()

    const { request, result: verifier } = await simulateContract(client, {
      account: localAccount,
      abi: Mock4337AccountFactory07.abi,
      address: factoryAddress,
      functionName: 'createAccount',
      args: [localAccount.address, pad('0x0')],
    })
    await writeContract(client, request)
    await mine(client, { blocks: 1 })

    const factoryData = encodeFunctionData({
      abi: Mock4337AccountFactory07.abi,
      functionName: 'createAccount',
      args: [localAccount.address, pad('0x0')],
    })

    const signature = await signMessageErc1271(client, {
      account: localAccount,
      factory: factoryAddress,
      factoryData,
      message: 'hello world',
      verifier,
    })

    expect(
      verifyHash(client, {
        address: verifier,
        factory: factoryAddress,
        factoryData,
        hash: hashMessage('hello world'),
        signature,
      }),
    ).resolves.toBe(true)
  })
})

test('signature already contains wrapper', async () => {
  const { factoryAddress } = await deployMock4337Account_07()

  const { result: verifier } = await simulateContract(client, {
    account: localAccount,
    abi: Mock4337AccountFactory07.abi,
    address: factoryAddress,
    functionName: 'createAccount',
    args: [localAccount.address, pad('0x0')],
  })

  const factoryData = encodeFunctionData({
    abi: Mock4337AccountFactory07.abi,
    functionName: 'createAccount',
    args: [localAccount.address, pad('0x0')],
  })

  const signature = await signMessageErc1271(client, {
    account: localAccount,
    factory: factoryAddress,
    factoryData,
    message: 'hello world',
    verifier,
  })

  expect(
    verifyHash(client, {
      address: verifier,
      factory: factoryAddress,
      factoryData,
      hash: hashMessage('hello world'),
      signature: serializeErc6492Signature({
        address: factoryAddress,
        data: factoryData,
        signature,
      }),
    }),
  ).resolves.toBe(true)
})

test.each([
  {
    _name: 'deployed, supports ERC1271, valid signature, plaintext',
    address: smartAccountConfig.address,
    hash: hashMessage('This is a test message for viem!'),
    signature:
      '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
    expectedResult: true,
  },
  {
    _name: 'deployed, supports ERC1271, valid signature, plaintext',
    address: smartAccountConfig.address,
    hash: hashMessage('This is a test message for viem!'),
    signature: parseSignature(
      '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c',
    ),
    expectedResult: true,
  },
  {
    _name: 'deployed, supports ERC1271, invalid signature',
    address: smartAccountConfig.address,
    hash: hashMessage('This is a test message for viem!'),
    signature: '0xdead',
    expectedResult: false,
  },
  {
    _name: 'deployed, does not support ERC1271',
    address: ensPublicResolverConfig.address,
    hash: hashMessage('0xdead'),
    signature: '0xdead',
    expectedResult: false,
  },
  {
    _name: 'undeployed, with correct signature',
    address: accounts[0].address,
    hash: hashMessage('hello world'),
    signature:
      '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    expectedResult: true,
  },
  {
    _name: 'undeployed, with correct signature',
    address: accounts[0].address,
    hash: hashMessage('hello world'),
    signature: parseSignature(
      '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
    ),
    expectedResult: true,
  },
  {
    _name: 'undeployed, with wrong signature',
    address: address.notDeployed,
    hash: hashMessage('0xdead'),
    signature: '0xdead',
    expectedResult: false,
  },
] as {
  _name: string
  address: Hex
  hash: Hex
  signature: Hex
  expectedResult: boolean
}[])('$_name', async ({ address, hash, signature, expectedResult }) => {
  expect(
    await verifyHash(client, {
      address,
      hash,
      signature,
    }),
  ).toBe(expectedResult)
})

test('unexpected errors still get thrown', async () => {
  await expect(
    verifyHash(client, {
      address: '0x0', // invalid address
      hash: hashMessage('0xdead'),
      signature: '0xdead',
    }),
  ).rejects.toThrow()
})

test('https://github.com/wevm/viem/issues/2484', async () => {
  const client = createClient({
    chain: zkSync,
    transport: http(),
  })

  const signature = await signMessage(client, {
    account: localAccount,
    message: 'hello world',
  })

  expect(
    verifyHash(client, {
      address: localAccount.address,
      hash: hashMessage('hello world'),
      signature,
    }),
  ).resolves.toBe(true)
})
