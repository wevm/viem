import { Address, Hash } from '../types'
import { getAccount as getAccount_, toBytes } from '../utils'

type EthersWallet = {
  address: string
  signMessage(message: Uint8Array): Promise<string>
  signTransaction(txn: any): Promise<string>
}

export const getAccount = (wallet: EthersWallet) =>
  getAccount_({
    address: wallet.address as Address,
    async signMessage(message) {
      return (await wallet.signMessage(toBytes(message))) as Hash
    },
    async signTransaction(txn) {
      return (await wallet.signTransaction({
        ...txn,
        gasLimit: txn.gas,
      })) as Hash
    },
  })
