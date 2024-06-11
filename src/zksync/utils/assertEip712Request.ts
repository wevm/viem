import type { ErrorType } from '../../errors/utils.js'
import type { ExactPartial } from '../../types/utils.js'
import {
  type AssertRequestErrorType,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import type { zkSync } from '../../zksync/chains.js'
import type { SendTransactionParameters } from '../actions/sendTransaction.js'
import {
  InvalidEip712TransactionError,
  type InvalidEip712TransactionErrorType,
} from '../errors/transaction.js'
import { isEIP712Transaction } from './isEip712Transaction.js'

export type AssertEip712RequestParameters = ExactPartial<
  SendTransactionParameters<typeof zkSync>
>

/** @internal */
export type AssertEip712RequestErrorType =
  | InvalidEip712TransactionErrorType
  | AssertRequestErrorType
  | ErrorType

export function assertEip712Request(args: AssertEip712RequestParameters) {
  if (!isEIP712Transaction(args as any))
    throw new InvalidEip712TransactionError()
  assertRequest(args as any)
}
