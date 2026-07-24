import { Actions, type Client } from 'viem'
import type { Address } from 'viem/utils'

export async function delegateAccount(
  client: Client.Client,
  options: delegateAccount.Options,
): Promise<Address.Address | undefined> {
  const account = client.account
  if (!account) throw new Error('client account required')

  const authorization = await Actions.wallet.signAuthorization(client, {
    address: options.contractAddress,
    executor: 'self',
  })

  await Actions.transaction.sendSync(client, {
    authorizationList: [authorization],
    to: account.address,
    type: 'eip7702',
  })

  return Actions.address.getDelegation(client, { address: account.address })
}

export declare namespace delegateAccount {
  type Options = {
    contractAddress: Address.Address
  }
}
