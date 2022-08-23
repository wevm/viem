import { Chain } from '../../../chains'
import { ConnectedRequests } from '../../types/ethereum-provider'
import { BaseProvider } from '../createBaseProvider'
import { WalletProvider } from '../wallet/createWalletProvider'

export type AccountProviderRequestFn = ConnectedRequests['request']

export type AccountProvider = Omit<
  BaseProvider<Chain, AccountProviderRequestFn>,
  'chains'
> & {
  address: string
  type: 'accountProvider'
}

export type AccountProviderConfig = {
  /** The address of the connected user. */
  address: string
  /** An key for the account provider */
  key?: string
  /** A name for the account provider */
  name?: string
}

/**
 * @description Creates an account provider that can perform signing & transaction
 * requests to a wallet. By creating an account provider, viem assumes that the user
 * is connected to the wallet. It is your responsibility to manage this state.
 */
export function accountProvider(
  provider: WalletProvider,
  {
    address,
    key = 'account',
    name = `Account ${address}`,
  }: AccountProviderConfig,
): AccountProvider {
  return {
    address,
    key,
    name,
    request: <any>provider.request,
    type: 'accountProvider',
    uniqueId: `${key}.${provider.uniqueId}.${address}`,
  }
}
