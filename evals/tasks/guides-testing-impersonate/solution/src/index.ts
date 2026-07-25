import { Account, Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'

const client = Client.create({
  account: Account.from(whale),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

export async function example() {
  await Actions.address.impersonate(client, { address: whale })
  try {
    const hash = await Actions.token.transfer(client, {
      amount: 12_345_678n,
      to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      token,
    })
    await Actions.transaction.waitForReceipt(client, { hash }).receipt
    return hash
  } finally {
    await Actions.address.stopImpersonating(client, { address: whale })
  }
}
