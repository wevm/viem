import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi, type Address } from 'viem/utils'

const abi = Abi.from([
  'function feeGrowthGlobal0X128() view returns (uint256)',
  'function liquidity() view returns (uint128)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
])

export const client = Client.create({
  batch: { multicall: true },
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function getPoolState(
  client: Client.Client,
  options: getPoolState.Options,
) {
  const { pool } = options
  const [feeGrowthGlobal0X128, liquidity, slot0] = await Promise.all([
    Actions.contract.read(client, {
      abi,
      address: pool,
      functionName: 'feeGrowthGlobal0X128',
    }),
    Actions.contract.read(client, {
      abi,
      address: pool,
      functionName: 'liquidity',
    }),
    Actions.contract.read(client, {
      abi,
      address: pool,
      functionName: 'slot0',
    }),
  ])
  const { sqrtPriceX96, tick, unlocked } = slot0
  return { feeGrowthGlobal0X128, liquidity, sqrtPriceX96, tick, unlocked }
}

export declare namespace getPoolState {
  type Options = {
    pool: Address.Address
  }
}
