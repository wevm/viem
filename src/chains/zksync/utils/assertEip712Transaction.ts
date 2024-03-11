import { InvalidAddressError } from '../../../errors/address.js'
import { BaseError } from '../../../errors/base.js'
import { InvalidChainIdError } from '../../../errors/chain.js'
import { isAddress } from '../../../utils/address/isAddress.js'
import { InvalidEip712TransactionError } from '../errors/transaction.js'
import type {
  ZkSyncTransactionSerializable,
  ZkSyncTransactionSerializableEIP712,
} from '../types/transaction.js'
import { isEIP712Transaction } from './isEip712Transaction.js'

export function assertEip712Transaction(
  transaction: Partial<ZkSyncTransactionSerializable>,
) {
  const { chainId, to, from, paymaster, paymasterInput } =
    transaction as ZkSyncTransactionSerializableEIP712

  if (!isEIP712Transaction(transaction))
    throw new InvalidEip712TransactionError()
  if (!chainId || chainId <= 0) throw new InvalidChainIdError({ chainId })
  if (to && !isAddress(to)) throw new InvalidAddressError({ address: to })
  if (from && !isAddress(from)) throw new InvalidAddressError({ address: from })
  if (paymaster && !isAddress(paymaster))
    throw new InvalidAddressError({ address: paymaster })
  if (paymaster && !paymasterInput) {
    throw new BaseError(
      '`paymasterInput` must be provided when `paymaster` is defined',
    )
  }
  if (!paymaster && paymasterInput) {
    throw new BaseError(
      '`paymaster` must be provided when `paymasterInput` is defined',
    )
  }
}
