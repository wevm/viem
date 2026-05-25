// [!region setup]
import { createClient, http, publicActions, walletActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Chain, tempoActions } from 'viem/tempo'

export const client = createClient({
  account: privateKeyToAccount('0x...'),
  chain: Chain.testnet,
  transport: http(),
})
  .extend(publicActions)
  .extend(walletActions)
  .extend(tempoActions())

// [!endregion setup]

// [!region channelDescriptor]
import { ChannelDescriptor } from 'viem/tempo'

export const descriptor = ChannelDescriptor.from({
  expiringNonceHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
  payee: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb',
  payer: client.account.address,
  salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
  token: '0x20c0000000000000000000000000000000000001',
})

// [!endregion channelDescriptor]
