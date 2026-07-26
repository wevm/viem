import { Actions, Client, Errors, http, RpcError } from 'viem'
import { mainnet } from 'viem/chains'
import { AbiFunction, Abis, type Address } from 'viem/utils'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  async function wouldTransferSucceed(options: {
    account: Address.Address
    amount: bigint
  }) {
    try {
      await Actions.call(client, {
        account: options.account,
        data: AbiFunction.encodeData(Abis.erc20, 'transfer', [
          recipient,
          options.amount,
        ]),
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

  const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
  const [empty, overBalance, small] = await Promise.all([
    wouldTransferSucceed({
      account: '0xa1484a31504c80e30ce0a25c8f94dbaee9cde6bc',
      amount: 1_000_000n,
    }),
    wouldTransferSucceed({
      account: whale,
      amount: 40_000_000_000n,
    }),
    wouldTransferSucceed({ account: whale, amount: 1_000_000n }),
  ])
  return { empty, overBalance, small }
}
