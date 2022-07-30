import { ConnectedRequests } from '../types/ethereum-provider'
import { buildRequest } from '../utils/buildRequest'

export type ProviderSigner = {
  address: string
  request: ConnectedRequests['request']
}

export function createProviderSigner({
  address,
  request,
}: ProviderSigner): ProviderSigner {
  return {
    address,
    request: buildRequest(request),
  }
}
