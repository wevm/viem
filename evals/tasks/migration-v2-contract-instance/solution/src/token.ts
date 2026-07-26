import { Client, Contract, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function getBalance(
  token: `0x${string}`,
  owner: `0x${string}`,
): Promise<bigint> {
  const contract = Contract.from({ abi: Abis.erc20, address: token, client })
  return contract.read.balanceOf([owner])
}

export async function getMetadata(token: `0x${string}`): Promise<{
  decimals: number
  name: string
  symbol: string
  totalSupply: bigint
}> {
  const contract = Contract.from({ abi: Abis.erc20, address: token, client })
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
  const contract = Contract.from({ abi: Abis.erc20, address: token, client })
  const logs = await contract.getLogs.Transfer({
    fromBlock: range.fromBlock,
    strict: true,
    toBlock: range.toBlock,
  })
  return logs.map((log) => ({
    from: log.args.from,
    to: log.args.to,
    value: log.args.value,
  }))
}
