import { WalletProvider } from '../../providers/wallet/createWalletProvider'
import { ConnectedRequests } from '../../types/ethereum-provider'

export type GetProviderAccountConfig = {
  address: string
}

export type ProviderAccount = {
  address: string
  request: ConnectedRequests['request']
  type: 'providerAccount'
}

export function getProviderAccount(
  provider: WalletProvider,
  { address }: GetProviderAccountConfig,
): ProviderAccount {
  return {
    // TODO: checksum address
    address,
    request: <any>provider.request,
    type: 'providerAccount',
  }
}
