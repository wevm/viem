import { WalletProvider } from '../providers/wallet/createWalletProvider'
import { Signer, createSigner } from '../signers/createSigner'

type WatchSignerListener = ({ signer }: { signer: Signer }) => void

export async function watchSigner(
  provider: WalletProvider,
  listener: WatchSignerListener,
) {
  const handleAccountsChanged = async (addresses: string[]) =>
    listener({
      signer: createSigner(provider, {
        // TODO: checksum addresses
        address: addresses[0],
      }),
    })
  provider.on('accountsChanged', handleAccountsChanged)
  return () => provider.removeListener('accountsChanged', handleAccountsChanged)
}
