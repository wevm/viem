import { ConnectedRequests } from '../types/ethereum-provider'
import { buildRequest } from '../utils/buildRequest'

export type ProviderAccount = {
  address: string
  request: ConnectedRequests['request']
}

export function createProviderAccount({
  address,
  request,
}: ProviderAccount): ProviderAccount {
  return {
    address,
    request: buildRequest(request),
  }
}
