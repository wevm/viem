export {
  sendEip712Transaction,
  type SendEip712TransactionParameters,
  type SendEip712TransactionErrorType,
  type SendEip712TransactionReturnType,
} from './actions/sendEip712Transaction.js'

export {
  signEip712Transaction,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  type SignEip712TransactionErrorType,
} from './actions/signEip712Transaction.js'

export {
  writeEip712Contract,
  type WriteEip712ContractParameters,
  type WriteEip712ContractErrorType,
  type WriteEip712ContractReturnType,
} from './actions/writeEip712Contract.js'

export {
  prepareEip712TransactionRequest,
  type PrepareEip712TransactionRequestParameters,
  type PrepareEip712TransactionRequestErrorType,
  type PrepareEip712TransactionRequestReturnType,
} from './actions/prepareEip712TransactionRequest.js'

export { defineChain } from './utils/defineChain.js'

export { type TransactionRequestEIP712 } from './types/transaction.js'

export {
  zkSync,
  zkSyncTestnet,
} from './chains.js'

export { eip712Actions, type Eip712Actions } from './decorators/eip712.js'
