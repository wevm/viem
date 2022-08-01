import { WalletProvider } from '../createWalletProvider'
import { ConnectedRequests } from '../../../types/ethereum-provider'

export type AccountProviderConfig = {
  address: string
}

export type AccountProvider = {
  address: string
  request: ConnectedRequests['request']
  type: 'accountProvider'
}

// TODO: add jsdoc w/ 'A "Wallet Provider" gives you access to an "Account Provider" when you connect'

export function accountProvider(
  provider: WalletProvider,
  { address }: AccountProviderConfig,
): AccountProvider {
  return {
    // TODO: checksum address
    address,
    request: <any>provider.request,
    type: 'accountProvider',
  }
}
