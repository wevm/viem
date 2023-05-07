import type { Address } from 'abitype'

import { toAccount } from '../accounts/toAccount.js'
import type { Hash } from '../types/misc.js'
import { toBytes } from '../utils/encoding/toBytes.js'

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
      // ethers type mappings
      // https://github.com/ethers-io/ethers.js/blob/0802b70a724321f56d4c170e4c8a46b7804dfb48/src.ts/transaction/transaction.ts#L394
      let type = null
      if (txn.type === 'legacy') {
        type = 0
      } else if (txn.type === 'eip1559') {
        type = 2
      } else if (txn.type === 'eip2930') {
        type = 1
      }
      return (await wallet.signTransaction({
        // allowed fields for `ethers.TransactionRequest`
        chainId: txn.chainId,
        data: txn.data,
        gasLimit: txn.gas,
        gasPrice: txn.gasPrice,
        nonce: txn.nonce,
        to: txn.to,
        type,
        value: txn.value,
        // untyped transactions do not support accessList
        ...(txn.type && txn.accessList ? { accessList: txn.accessList } : {}),
        // eip1559 properties
        ...(txn.type === 'eip1559' && txn.maxPriorityFeePerGas
          ? { maxPriorityFeePerGas: txn.maxPriorityFeePerGas }
          : {}),
        ...(txn.type === 'eip1559' && txn.maxFeePerGas
          ? { maxFeePerGas: txn.maxFeePerGas }
          : {}),
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
