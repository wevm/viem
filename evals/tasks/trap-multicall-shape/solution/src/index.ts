import { Actions, Client, ContractError, http } from 'viem'
import { mainnet } from 'viem/chains'
import { Abi, Abis } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

export async function example() {
  const { results: values } = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      {
        abi: Abis.erc20,
        args: [holder],
        functionName: 'balanceOf',
        to: token,
      },
      {
        abi: Abis.erc20,
        functionName: 'totalSupply',
        to: token,
      },
      {
        abi: Abis.erc20,
        functionName: 'decimals',
        to: token,
      },
    ],
  })

  const rejected = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      {
        abi: Abis.erc20,
        functionName: 'decimals',
        to: token,
      },
      {
        abi: Abi.from(['function doesNotExist() view returns (uint256)']),
        functionName: 'doesNotExist',
        to: token,
      },
    ],
  })
    .then(() => false)
    .catch((error: unknown) => {
      if (
        error instanceof ContractError.ContractFunctionExecutionError &&
        error.cause instanceof ContractError.ContractFunctionZeroDataError
      )
        return true
      throw error
    })

  return { rejected, values }
}
