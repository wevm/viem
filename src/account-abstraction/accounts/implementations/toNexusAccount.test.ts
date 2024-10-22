import { beforeAll, describe, expect, test } from 'vitest'

import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { type ToNexusSmartAccountReturnType, toNexusAccount } from './toNexusAccount.js'
import { baseSepolia } from '../../../chains/index.js'
import { accounts } from '~test/src/constants.js'
import { http } from '~viem/clients/transports/http.js'

const owner = privateKeyToAccount(accounts[0].privateKey)

let account: ToNexusSmartAccountReturnType

beforeAll(async () => {
  account = await toNexusAccount({
    signer: owner,
    chain: baseSepolia,
    transport: http(),
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
    const signature = account.signMessage({message: 'hello world'});
    expect(signature).toBeDefined();
  })
})