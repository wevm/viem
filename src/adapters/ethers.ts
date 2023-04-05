import { toAccount } from '../accounts/toAccount.js'
import type { Address, Hash } from '../types/index.js'
import { toBytes } from '../utils/index.js'

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
} & (
  | {
      signTypedData(
        domain: TypedDataDomain,
        types: Record<string, TypedDataField[]>,
        value: Record<string, any>,
      ): Promise<string>
      _signTypedData?: never
    }
  | {
      signTypedData?: never
      _signTypedData(
        domain: TypedDataDomain,
        types: Record<string, TypedDataField[]>,
        value: Record<string, any>,
      ): Promise<string>
    }
)

export const ethersWalletToAccount = (wallet: EthersWallet) =>
  toAccount({
    address: wallet.address as Address,
    async signMessage({ message }) {
      return (await wallet.signMessage(toBytes(message))) as Hash
    },
    async signTransaction(txn) {
      return (await wallet.signTransaction({
        ...txn,
        gasLimit: txn.gas,
      })) as Hash
    },
    async signTypedData({ domain, types: types_, message }) {
      const { EIP712Domain: _, ...types } = types_ as any
      const signTypedData = wallet.signTypedData
        ? wallet.signTypedData.bind(wallet)
        : wallet._signTypedData.bind(wallet)
      return (await signTypedData(
        domain ?? {},
        types as Record<string, TypedDataField[]>,
        message,
      )) as Hash
    },
  })
