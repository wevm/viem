import { Events } from '../../types'
import {
  BaseProvider,
  BaseProviderRequestFn,
  createBaseProvider,
} from '../createBaseProvider'

export type WalletProviderConfig<
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
> = BaseProvider<TRequestFn> & {
  on: Events['on']
  removeListener: Events['removeListener']
}

export type WalletProvider<
  TRequestFn extends BaseProviderRequestFn = BaseProviderRequestFn,
> = WalletProviderConfig<TRequestFn> & {
  type: 'walletProvider'
}

export function createWalletProvider<TRequestFn extends BaseProviderRequestFn>({
  on,
  removeListener,
  request,
}: WalletProviderConfig<TRequestFn>): WalletProvider<TRequestFn> {
  const baseProvider = createBaseProvider({
    request,
  })
  return {
    ...baseProvider,
    on,
    removeListener,
    type: 'walletProvider',
  }
}
