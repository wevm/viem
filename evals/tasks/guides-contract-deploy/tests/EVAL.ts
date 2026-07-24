import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { deploy } from '../src/index.ts'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

// Erc1271Account artifact from viem's contracts/generated.ts:
// constructor(address _owner) stores the owner, readable via owner().
const abi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isValidSignature',
    inputs: [
      {
        name: 'hash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'signature',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
] as const

const bytecode =
  '0x608060405234801561000f575f5ffd5b506040516106b03803806106b0833981810160405281019061003191906100d4565b805f5f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550506100ff565b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100a38261007a565b9050919050565b6100b381610099565b81146100bd575f5ffd5b50565b5f815190506100ce816100aa565b92915050565b5f602082840312156100e9576100e8610076565b5b5f6100f6848285016100c0565b91505092915050565b6105a48061010c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c80631626ba7e146100385780638da5cb5b14610068575b5f5ffd5b610052600480360381019061004d91906102b5565b610086565b60405161005f919061034c565b60405180910390f35b610070610105565b60405161007d91906103a4565b60405180910390f35b5f5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166100c9858585610129565b73ffffffffffffffffffffffffffffffffffffffff16036100f357631626ba7e60e01b90506100fe565b63ffffffff60e01b90505b9392505050565b5f5f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f6041838390501461013d575f9050610212565b5f83835f90602092610151939291906103c5565b9061015c9190610415565b90505f8484602090604092610173939291906103c5565b9061017e9190610415565b90505f8585604081811061019557610194610473565b5b9050013560f81c60f81b60f81c9050601b8160ff1610156101c057601b816101bd91906104d9565b90505b6001878285856040515f81526020016040526040516101e2949392919061052b565b6020604051602081039080840390855afa158015610202573d5f5f3e3d5ffd5b5050506020604051035193505050505b9392505050565b5f5ffd5b5f5ffd5b5f819050919050565b61023381610221565b811461023d575f5ffd5b50565b5f8135905061024e8161022a565b92915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f84011261027557610274610254565b5b8235905067ffffffffffffffff81111561029257610291610258565b5b6020830191508360018202830111156102ae576102ad61025c565b5b9250929050565b5f5f5f604084860312156102cc576102cb610219565b5b5f6102d986828701610240565b935050602084013567ffffffffffffffff8111156102fa576102f961021d565b5b61030686828701610260565b92509250509250925092565b5f7fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b61034681610312565b82525050565b5f60208201905061035f5f83018461033d565b92915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61038e82610365565b9050919050565b61039e81610384565b82525050565b5f6020820190506103b75f830184610395565b92915050565b5f5ffd5b5f5ffd5b5f5f858511156103d8576103d76103bd565b5b838611156103e9576103e86103c1565b5b6001850283019150848603905094509492505050565b5f82905092915050565b5f82821b905092915050565b5f61042083836103ff565b8261042b8135610221565b9250602082101561046b576104667fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff83602003600802610409565b831692505b505092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b5f60ff82169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6104e3826104a0565b91506104ee836104a0565b9250828201905060ff811115610507576105066104ac565b5b92915050565b61051681610221565b82525050565b610525816104a0565b82525050565b5f60808201905061053e5f83018761050d565b61054b602083018661051c565b610558604083018561050d565b610565606083018461050d565b9594505050505056fea26469706673582212203df2102fed9bf421c659e4f8e40a568a0f3c04b39de210248a35fadd1694a5b164736f6c63430008230033' as const

const ownerSelector = '0x8da5cb5b' // owner()

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

test.skip('derives constructor arguments from the ABI', () => {
  // @ts-expect-error Constructor arguments are required by the ABI.
  deploy(client, { abi, bytecode })
  deploy(client, {
    abi,
    // @ts-expect-error Constructor arguments are derived from the ABI.
    args: [1n],
    bytecode,
  })
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('deploys the contract and returns its address', async () => {
  const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const address = await deploy(client, { abi, args: [owner], bytecode })
  expectTypeOf(address).toEqualTypeOf<`0x${string}`>()
  expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/)
  const code = await rpc('eth_getCode', [address, 'latest'])
  expect(code.length).toBeGreaterThan(2)
  const stored = await rpc('eth_call', [
    { to: address, data: ownerSelector },
    'latest',
  ])
  expect(BigInt(stored)).toBe(BigInt(owner))
}, 60_000)

test('encodes constructor arguments per deployment', async () => {
  const owner = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  const address = await deploy(client, { abi, args: [owner], bytecode })
  const stored = await rpc('eth_call', [
    { to: address, data: ownerSelector },
    'latest',
  ])
  expect(BigInt(stored)).toBe(BigInt(owner))
}, 60_000)
