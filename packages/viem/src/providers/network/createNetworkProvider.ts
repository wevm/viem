import { BaseProvider, createBaseProvider } from '../createBaseProvider'

export type NetworkProviderConfig = BaseProvider

export type NetworkProvider = BaseProvider & {
  type: 'networkProvider'
}

export function createNetworkProvider({
  request,
}: NetworkProviderConfig): NetworkProvider {
  return {
    ...createBaseProvider({
      request,
    }),
    type: 'networkProvider',
  }
}
