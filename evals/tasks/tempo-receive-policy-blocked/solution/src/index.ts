import { tempoLocalnet } from 'viem/chains'
import { Abis, Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { AbiEvent, Value } from 'viem/utils'

const recipient = Account.fromSecp256k1(
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
)
const sender = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account: sender,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const policy = await Actions.receivePolicy.setSync(client, {
    account: recipient,
    claimer: 'sender',
    senderPolicyId: 'reject-all',
  })
  const transfer = await Actions.token.transferSync(client, {
    amount: Value.from('12.5', 6),
    to: recipient.address,
    token: Addresses.pathUsd,
  })
  const [blocked] = AbiEvent.extractLogs(
    Abis.receivePolicyGuard,
    transfer.receipt.logs,
    { eventName: 'TransferBlocked', strict: true },
  )
  if (!blocked) throw new Error('transfer was not blocked')
  const claimReceipt = blocked.args.receipt
  const before = await Actions.receivePolicy.getBlockedBalance(client, {
    receipt: claimReceipt,
  })
  const claim = await Actions.receivePolicy.claimSync(client, {
    receipt: claimReceipt,
    to: '0x4545454545454545454545454545454545454545',
  })
  const after = await Actions.receivePolicy.getBlockedBalance(client, {
    receipt: claimReceipt,
  })
  return { after, before, claim, claimReceipt, policy, transfer }
}
