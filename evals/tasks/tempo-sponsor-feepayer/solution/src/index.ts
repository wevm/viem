import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const sponsor = Account.fromSecp256k1(
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
)

const client = Client.create({
  account: Account.fromSecp256k1(
    '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export function example() {
  return Actions.token.transferSync(client, {
    amount: Value.from('12.34', 6),
    feePayer: sponsor,
    to: '0x4545454545454545454545454545454545454545',
    token: Addresses.pathUsd,
  })
}
