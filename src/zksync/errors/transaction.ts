import { BaseError } from '../../errors/base.js'

export type InvalidEip712TransactionErrorType =
  InvalidEip712TransactionError & {
    name: 'InvalidEip712TransactionError'
  }
export class InvalidEip712TransactionError extends BaseError {
  constructor() {
    super(
      [
        'Transaction is not an EIP712 transaction.',
        '',
        'Transaction must:',
        '  - include `type: "eip712"`',
        '  - include one of the following: `customSignature`, `paymaster`, `paymasterInput`, `gasPerPubdata`, `factoryDeps`',
      ].join('\n'),
      { name: 'InvalidEip712TransactionError' },
    )
  }
}
