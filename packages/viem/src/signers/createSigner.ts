import { WalletProvider } from '../providers/wallet/createWalletProvider'
import { ConnectedRequests } from '../types/ethereum-provider'
import { buildRequest } from '../utils/buildRequest'

export type CreateSignerConfig = {
  address: string
}

export type Signer = {
  address: string
  request: ConnectedRequests['request']
}

export function createSigner(
  provider: WalletProvider,
  { address }: CreateSignerConfig,
): Signer {
  return {
    // TODO: checksum address
    address,
    request: buildRequest(<any>provider.request),
  }
}
