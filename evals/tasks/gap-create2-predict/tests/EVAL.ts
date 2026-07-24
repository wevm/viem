import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { deployDeterministic } from '../src/index.ts'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

// WriteExample artifact from viem's contracts/generated.ts (no constructor).
// foo(uint256 x, uint256 y) (selector 0x04bc52f8) returns x + y.
const bytecode =
  '0x6080604052348015600e575f5ffd5b5061025a8061001c5f395ff3fe60806040526004361061003e575f3560e01c806304bc52f8146100425780631b9265b81461007e5780632fbebd3814610088578063c2985578146100c4575b5f5ffd5b34801561004d575f5ffd5b5061006860048036038101906100639190610133565b6100da565b6040516100759190610180565b60405180910390f35b6100866100ef565b005b348015610093575f5ffd5b506100ae60048036038101906100a99190610199565b6100f1565b6040516100bb9190610180565b60405180910390f35b3480156100cf575f5ffd5b506100d86100fa565b005b5f81836100e791906101f1565b905092915050565b565b5f819050919050565b565b5f5ffd5b5f819050919050565b61011281610100565b811461011c575f5ffd5b50565b5f8135905061012d81610109565b92915050565b5f5f60408385031215610149576101486100fc565b5b5f6101568582860161011f565b92505060206101678582860161011f565b9150509250929050565b61017a81610100565b82525050565b5f6020820190506101935f830184610171565b92915050565b5f602082840312156101ae576101ad6100fc565b5b5f6101bb8482850161011f565b91505092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6101fb82610100565b915061020683610100565b925082820190508082111561021e5761021d6101c4565b5b9291505056fea264697066735822122068fe3f5a450cf16e55023331f7cb9313cd55ac08b1c395004a18901be8d0619564736f6c63430008230033' as const

// EIP-1014 addresses for the deterministic deployer at
// 0x4e59b44847b379578588920ca78fbf26c0b4956c, pinned per (bytecode, salt).
const saltA =
  '0x000000000000000000000000000000000000000000000000000000000000002a'
const expectedA = '0x41366dc93bfe63fbe8c8df63c88384cc658d4a1c'
const saltB =
  '0x7669656d2d6576616c732d637265617465322d70726564696374000000000000'
const expectedB = '0xeed6529f4c53348fa8f7afaf46d3c2bb1b934998'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('predicts the CREATE2 address and deploys code there', async () => {
  const { predicted, deployed } = await deployDeterministic(client, {
    bytecode,
    salt: saltA,
  })
  expect(predicted.toLowerCase()).toBe(expectedA)
  expect(deployed.toLowerCase()).toBe(expectedA)
  const code = await rpc('eth_getCode', [expectedA, 'latest'])
  expect(code.length).toBeGreaterThan(2)
  const sum = await rpc('eth_call', [
    {
      to: expectedA,
      data: '0x04bc52f8' + '01'.padStart(64, '0') + '02'.padStart(64, '0'),
    },
    'latest',
  ])
  expect(BigInt(sum)).toBe(3n)
}, 60_000)

test('a different salt yields a different deterministic address', async () => {
  const { predicted, deployed } = await deployDeterministic(client, {
    bytecode,
    salt: saltB,
  })
  expect(predicted.toLowerCase()).toBe(expectedB)
  expect(deployed.toLowerCase()).toBe(expectedB)
  const code = await rpc('eth_getCode', [expectedB, 'latest'])
  expect(code.length).toBeGreaterThan(2)
}, 60_000)
