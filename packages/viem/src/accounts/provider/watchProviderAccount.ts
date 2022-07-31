import { WalletProvider } from '../../providers/wallet/createWalletProvider'
import { ProviderAccount, getProviderAccount } from './getProviderAccount'

type WatchProviderAccountListener = ({
  providerAccount,
}: {
  providerAccount: ProviderAccount
}) => void

export async function watchProviderAccount(
  provider: WalletProvider,
  listener: WatchProviderAccountListener,
) {
  const handleAccountsChanged = async (addresses: string[]) =>
    listener({
      providerAccount: getProviderAccount(provider, {
        // TODO: checksum addresses
        address: addresses[0],
      }),
    })
  provider.on('accountsChanged', handleAccountsChanged)
  return () => provider.removeListener('accountsChanged', handleAccountsChanged)
}
