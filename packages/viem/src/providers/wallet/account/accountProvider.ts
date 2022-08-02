import { WalletProvider } from '../createWalletProvider'
import { ConnectedRequests } from '../../../types/ethereum-provider'
import { BaseProvider, createBaseProvider } from '../../createBaseProvider'
import { Chain } from '../../../chains'

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
  /** An identifier for the account provider */
  id?: string
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
    id = 'account',
    name = `Account ${address}`,
  }: AccountProviderConfig,
): AccountProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { chains, ...baseProvider } = createBaseProvider<
    Chain,
    AccountProviderRequestFn
  >({
    chains: provider.chains,
    id,
    name,
    request: <any>provider.request,
  })
  return {
    ...baseProvider,
    address,
    request: <any>provider.request,
    type: 'accountProvider',
  }
}
