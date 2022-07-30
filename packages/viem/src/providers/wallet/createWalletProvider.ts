import { ProviderSigner } from '../../signers/createProviderSigner'
import { Chain, Events } from '../../types'
import {
  BaseProvider,
  BaseProviderRequestFn,
  createBaseProvider,
} from '../createBaseProvider'

export type WalletProvider<
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
> = BaseProvider<Chain, TRequestFn> & {
  connect: () => Promise<ProviderSigner>
  on: Events['on']
  removeListener: Events['removeListener']
}

export function createWalletProvider<TRequestFn extends BaseProviderRequestFn>({
  chains,
  connect,
  on,
  removeListener,
  request,
}: WalletProvider<TRequestFn>): WalletProvider<TRequestFn> {
  const baseProvider = createBaseProvider({
    chains,
    request,
  })
  return {
    ...baseProvider,
    connect,
    on,
    removeListener,
  }
}
