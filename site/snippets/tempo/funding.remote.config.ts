// [!region setup]
import { http } from 'viem'
import { Account, createClient } from 'viem/tempo'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
  transport: http('https://relay.example.com/rpc'),
})
// [!endregion setup]
