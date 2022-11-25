import {
  ConnectedRequests,
  PublicRequests,
} from '../../types/ethereum-provider'
import { uid } from '../../utils/uid'
import { BaseProvider } from '../createBaseProvider'
import { WalletProvider } from '../wallet/createWalletProvider'

export type AccountProviderRequests = PublicRequests & ConnectedRequests

export type AccountProvider = Omit<
  BaseProvider<AccountProviderRequests>,
  'chains'
> & {
  address: string
  type: 'accountProvider'
  walletProvider: WalletProvider
}

export type AccountProviderConfig = {
  /** The address of the connected user. */
  address: string
  /** An key for the account provider */
  key?: string
  /** Polling frequency. */
  pollingInterval?: number
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
    pollingInterval = 4_000,
    name = `Account ${address}`,
  }: AccountProviderConfig,
): AccountProvider {
  return {
    address,
    key,
    name,
    pollingInterval,
    request: <any>provider.request,
    type: 'accountProvider',
    uid: uid(),
    walletProvider: provider,
  }
}
