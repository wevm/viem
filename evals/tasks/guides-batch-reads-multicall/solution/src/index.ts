import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abis } from 'viem/utils'

const vault = '0x83F20F44975D03b1b09e64809B757c47f942BEeA'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  const { results } = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      { abi: Abis.erc4626, functionName: 'asset', to: vault },
      { abi: Abis.erc4626, functionName: 'totalAssets', to: vault },
      {
        abi: Abis.erc4626,
        args: [1_000_000_000_000_000_000n],
        functionName: 'convertToAssets',
        to: vault,
      },
    ],
  })
  const [asset, totalAssets, assetsPerShare] = results
  return { asset, assetsPerShare, totalAssets }
}
