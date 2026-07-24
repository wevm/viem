import { createPublicClient, getContract, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'name',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const

function tokenContract(token: `0x${string}`) {
  return getContract({ abi, address: token, client })
}

export async function getBalance(
  token: `0x${string}`,
  owner: `0x${string}`,
): Promise<bigint> {
  return tokenContract(token).read.balanceOf([owner])
}

export async function getMetadata(token: `0x${string}`): Promise<{
  decimals: number
  name: string
  symbol: string
  totalSupply: bigint
}> {
  const contract = tokenContract(token)
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.read.name(),
    contract.read.symbol(),
    contract.read.decimals(),
    contract.read.totalSupply(),
  ])
  return { decimals, name, symbol, totalSupply }
}

export async function getTransfers(
  token: `0x${string}`,
  range: { fromBlock: bigint; toBlock: bigint },
): Promise<{ from: `0x${string}`; to: `0x${string}`; value: bigint }[]> {
  const logs = await tokenContract(token).getEvents.Transfer(
    {},
    { fromBlock: range.fromBlock, strict: true, toBlock: range.toBlock },
  )
  return logs.map((log) => ({
    from: log.args.from,
    to: log.args.to,
    value: log.args.value,
  }))
}
