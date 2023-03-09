import { Address, Hash } from '../types'
import { getAccount as getAccount_, toBytes } from '../utils'

type BigNumberish = string | number | bigint
type BytesLike = string | Uint8Array

type TypedDataDomain = {
  name?: string
  version?: string
  chainId?: BigNumberish
  verifyingContract?: string
  salt?: BytesLike
}
type TypedDataField = {
  name: string
  type: string
}

type EthersWallet = {
  address: string
  signMessage(message: Uint8Array): Promise<string>
  signTransaction(txn: any): Promise<string>
  signTypedData(
    domain: TypedDataDomain,
    types: Record<string, TypedDataField[]>,
    value: Record<string, any>,
  ): Promise<string>
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
    async signTypedData({ domain, types, message }) {
      return (await wallet.signTypedData(
        domain ?? {},
        types as Record<string, TypedDataField[]>,
        message,
      )) as Hash
    },
  })
