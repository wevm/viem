import { beforeAll, beforeEach, describe, test, expect, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { http } from '~viem/clients/transports/http.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { baseSepolia } from '../../../chains/index.js'
import {
  type ToNexusSmartAccountReturnType,
  toNexusAccount,
} from './toNexusAccount.js'
import { anvilBaseSepolia } from '../../../../test/src/anvil.js'
import { getCode, mine, sendTransaction } from '~viem/actions/index.js'
import { parseEther } from '~viem/utils/index.js'
import { prepareUserOperation } from '~viem/account-abstraction/actions/bundler/prepareUserOperation.js'
import { bundlerBaseSepolia } from '~test/src/bundler.js'
import { sendUserOperation } from '~viem/account-abstraction/actions/bundler/sendUserOperation.js'
import { estimateUserOperationGas } from '~viem/account-abstraction/actions/bundler/estimateUserOperationGas.js'

const owner = privateKeyToAccount(accounts[0].privateKey)
const client = anvilBaseSepolia.getClient({account: true})
const bundlerClient = bundlerBaseSepolia.getBundlerClient({ client })

let account: ToNexusSmartAccountReturnType

beforeAll(async () => {
  account = await toNexusAccount({
    signer: owner,
    chain: baseSepolia,
    transport: http(),
  })

  
})

describe('deployments', () => {
  test('it should be deployed', async () => {
    const k1Validator = "0x00000004171351c442B202678c48D8AB5B321E8f";
    const k1ValidatorFactory = "0x00000bb19a3579F4D779215dEf97AFbd0e30DB55";
    const k1ValidatorCode = await getCode(client, {address: k1Validator});
    const k1ValidatorFactoryCode = await getCode(client, {address: k1ValidatorFactory});
    expect(k1ValidatorCode).toBeDefined();
    expect(k1ValidatorFactoryCode).toBeDefined();
  })
})

describe('account properties', () => {
  test('address', async () => {
    expect(account.address).toBeDefined()
  })

  test('getNonce', async () => {
    const nonce = await account.getNonce()
    expect(nonce).toBeDefined()
  })

  test('getFactoryArgs', async () => {
    const factoryArgs = await account.getFactoryArgs()
    expect(factoryArgs).toBeDefined()
  })
})

describe('return value: userOperation.estimateGas', () => {
  test('default: private key', async () => {
    const request = await account.userOperation?.estimateGas?.({
      callData: '0xdeadbeef',
    })
    expect(request).toMatchInlineSnapshot('undefined')
  })
})

describe('signer type support', () => {
  test('default: viem LocalAccount', async () => {
    const account = await toNexusAccount({
      signer: owner,
      chain: baseSepolia,
      transport: http(),
    })
    const signature = account.signMessage({ message: 'hello world' })
    expect(signature).toBeDefined()
  })
})

describe('bundler client actions', async () => {

  const account = await toNexusAccount({
    signer: owner,
    chain: baseSepolia,
    transport: http(),
  })

  await sendTransaction(client, {
    account: accounts[9].address,
    to: account.address,
    value: parseEther('100'),
  })
  await mine(client, {
    blocks: 1,
  })

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))
    return () => {
      vi.useRealTimers()
    }
  })

  test('estimateUserOperationGas', async () => {
    const gas = await estimateUserOperationGas(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
        },
      ],
    })

    expect(gas).toMatchInlineSnapshot(`
      {
        "callGasLimit": 98000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 56751n,
        "verificationGasLimit": 396339n,
      }
    `)
  })

  test('prepare user operation', async () => {
    const hash = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: 1n,
        },
      ],
      callGasLimit: 80000n,
      verificationGasLimit: 369595n,
      preVerificationGas: 67100n,
      maxFeePerGas: 22785120848n,
      maxPriorityFeePerGas: 2000000000n,
    })
    console.log(hash, "HASH");
    expect(hash).toBeDefined()
  })

  test('send user operation', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: 1n,
        },
      ],
      callGasLimit: 80000n,
      verificationGasLimit: 369595n,
      preVerificationGas: 67100n,
      maxFeePerGas: 22785120848n,
      maxPriorityFeePerGas: 2000000000n,
    })
    console.log(hash, "HASH");
    expect(hash).toBeDefined()
    expect(hash).toMatchInlineSnapshot(
      `"0x3ecfa7dc9b70e00bfd24f983f45cddff10c831a8815df2e76946aa7230292333"`,
    )
  })
})
