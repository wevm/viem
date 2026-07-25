import { Actions, Client, Errors, http, RpcError } from 'viem'
import { mainnet } from 'viem/chains'
import { AbiFunction, type Address } from 'viem/utils'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const transfer = AbiFunction.from(
  'function transfer(address to, uint256 amount) returns (bool)',
)

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

async function wouldTransferSucceed(options: {
  amount: bigint
  from: Address.Address
}): Promise<boolean> {
  const { amount, from } = options
  try {
    await Actions.call(client, {
      account: from,
      data: AbiFunction.encodeData(transfer, [recipient, amount]),
      to: usdc,
    })
    return true
  } catch (error) {
    if (
      error instanceof Errors.BaseError &&
      error.walk((cause) => cause instanceof RpcError.ExecutionRevertedError)
    )
      return false
    throw error
  }
}

export async function example() {
  const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
  return {
    empty: await wouldTransferSucceed({
      amount: 1_000_000n,
      from: '0xa1484a31504c80e30ce0a25c8f94dbaee9cde6bc',
    }),
    overBalance: await wouldTransferSucceed({
      amount: 40_000_000_000n,
      from: whale,
    }),
    small: await wouldTransferSucceed({ amount: 1_000_000n, from: whale }),
  }
}
