import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { slice } from '../../../utils/data/slice.js'
import { recoverMessageAddress } from '../../../utils/signature/recoverMessageAddress.js'
import { accountConfigurationAbi } from '../abis.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type { AaActor } from '../types/transaction.js'
import { computeAddress } from '../utils/computeAddress.js'
import { erc1167Bytecode } from '../utils/proxy.js'
import { toSmartAccount } from './toSmartAccount.js'

// Offline stub transports. `client` reports the account as counterfactual
// (not deployed); `deployedClient` reports it as deployed (so signatures are
// not ERC-6492 wrapped).
function stubClient(code: '0x' | '0x01') {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method }: { method: string }) {
        if (method === 'eth_chainId') return '0x1'
        if (method === 'eth_getCode') return code
        throw new Error(`unexpected RPC call: ${method}`)
      },
    }),
  })
}
const client = stubClient('0x')
const deployedClient = stubClient('0x01')
const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const implementation = '0x00000000000000000000000000000000000000Ec' as const
const actor: AaActor = {
  actorId: '0x0000000000000000000000000000000000000000000000000000000000000001',
  authenticator: ecrecoverAuthenticator,
}
const base = {
  client,
  owner,
  userSalt:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  initialActors: [actor],
  implementation,
} as const

describe('toSmartAccount', () => {
  test('getAddress matches computeAddress', async () => {
    const account = await toSmartAccount(base)
    expect(await account.getAddress()).toBe(
      computeAddress({
        userSalt: base.userSalt,
        code: erc1167Bytecode(implementation),
        initialActors: base.initialActors,
      }),
    )
  })

  test('getFactoryArgs -> AccountConfiguration.createAccount', async () => {
    const account = await toSmartAccount(base)
    const { factory, factoryData } = await account.getFactoryArgs()
    expect(factory).toMatch(/^0x[0-9a-fA-F]{40}$/)
    const decoded = decodeFunctionData({
      abi: accountConfigurationAbi,
      data: factoryData!,
    })
    expect(decoded.functionName).toBe('createAccount')
    expect(decoded.args[0]).toBe(base.userSalt)
    expect(decoded.args[1]).toBe(erc1167Bytecode(implementation).toLowerCase())
  })

  test('encodeCalls/decodeCalls round-trip via executeBatch', async () => {
    const account = await toSmartAccount(base)
    const calls = [
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 1n,
        data: '0x',
      },
      { to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', data: '0xdeadbeef' },
    ] as const
    const encoded = await account.encodeCalls(calls as any)
    const decoded = await account.decodeCalls!(encoded)
    expect(decoded).toEqual([
      {
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        value: 1n,
        data: '0x',
      },
      {
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        value: 0n,
        data: '0xdeadbeef',
      },
    ])
  })

  test('getStubSignature is authenticator-prefixed', async () => {
    const account = await toSmartAccount(base)
    const stub = await account.getStubSignature()
    expect(slice(stub, 0, 20).toLowerCase()).toBe(
      ecrecoverAuthenticator.toLowerCase(),
    )
  })

  test('signMessage = authenticator || recoverable ECDSA', async () => {
    const account = await toSmartAccount({
      ...base,
      client: deployedClient,
    })
    const message = 'hello 8130'
    const sig = await account.signMessage({ message })
    expect(slice(sig, 0, 20).toLowerCase()).toBe(
      ecrecoverAuthenticator.toLowerCase(),
    )
    const recovered = await recoverMessageAddress({
      message,
      signature: slice(sig, 20),
    })
    expect(recovered).toBe(owner.address)
  })

  test('throws without identity inputs when deriving factory args', async () => {
    const account = await toSmartAccount({
      client,
      owner,
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    })
    expect(await account.getAddress()).toBe(
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    )
    await expect(account.getFactoryArgs()).rejects.toThrow()
  })
})
