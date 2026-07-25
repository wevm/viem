import { Account, Actions, Client, Errors, http, RpcError } from 'viem'
import { mainnet } from 'viem/chains'
import { Value } from 'viem/utils'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const poorAccount = Account.fromPrivateKey(
  '0x5eba0000000000000000000000000000000000000000000000000000000e0a15',
)

const richAccount = Account.fromPrivateKey(
  '0x5eba0000000000000000000000000000000000000000000000000000000f00d5',
)

export async function example() {
  async function sendPayment(
    account: Account.Account,
    amountEther: string,
  ): Promise<'insufficient-funds' | 'sent' | 'unknown'> {
    try {
      await Actions.transaction.send(client, {
        account,
        to: '0x4242424242424242424242424242424242424242',
        value: Value.fromEther(amountEther),
      })
      return 'sent'
    } catch (error) {
      if (
        error instanceof Errors.BaseError &&
        error.walk((cause) => cause instanceof RpcError.InsufficientFundsError)
      )
        return 'insufficient-funds'
      return 'unknown'
    }
  }

  return {
    insufficientFunds: await sendPayment(poorAccount, '1'),
    sent: await sendPayment(richAccount, '1'),
    unknown: await sendPayment(richAccount, 'not-an-amount'),
  }
}
