import type { ErrorType } from '../../../errors/utils.js'
import { type AssertRequestErrorType, assertRequest } from '../../../index.js'
import type { SendTransactionParameters } from '../actions/sendTransaction.js'
import type { zkSync } from '../chains.js'
import { InvalidEip712TransactionError } from '../errors/transaction.js'
import { isEIP712Transaction } from './isEip712Transaction.js'

export type AssertEip712RequestParameters = Partial<
  SendTransactionParameters<typeof zkSync>
>

export type AssertEip712RequestErrorType = AssertRequestErrorType | ErrorType

export function assertEip712Request(args: AssertEip712RequestParameters) {
  if (!isEIP712Transaction(args as any))
    throw new InvalidEip712TransactionError()
  assertRequest(args as any)
}
