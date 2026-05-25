// [!region setup]
import { createClient, http, publicActions, walletActions } from 'viem'
import { Account, Chain, tempoActions } from 'viem/tempo'

export const client = createClient({
  account: Account.fromSecp256k1('0x...'),
  chain: Chain.testnet,
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)
  .extend(tempoActions())

// [!endregion setup]

// [!region channelDescriptor]
import { Channel } from 'viem/tempo'

export const descriptor = Channel.from({
  expiringNonceHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  payee: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
  payer: client.account.address,
  salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
  token: '0x20c0000000000000000000000000000000000001',
})

// [!endregion channelDescriptor]
