export {
  type SignAuthMessageErrorType,
  type SignAuthMessageParameters,
  type SignAuthMessageReturnType,
  signAuthMessage,
} from './eip3074/actions/signAuthMessage.js'
export {
  type RecoverAuthMessageAddressParameters,
  type RecoverAuthMessageAddressReturnType,
  type RecoverAuthMessageAddressErrorType,
  recoverAuthMessageAddress,
} from './eip3074/utils/recoverAuthMessageAddress.js'
export {
  type VerifyAuthMessageParameters,
  type VerifyAuthMessageReturnType,
  type VerifyAuthMessageErrorType,
  verifyAuthMessage,
} from './eip3074/utils/verifyAuthMessage.js'
export {
  type WalletActionsEip3074,
  walletActionsEip3074,
} from './eip3074/decorators/eip3074.js'

export {
  type GetCapabilitiesErrorType,
  type GetCapabilitiesReturnType,
  getCapabilities,
} from './eip5792/actions/getCapabilities.js'
export {
  type SendCallsErrorType,
  type SendCallsParameters,
  type SendCallsReturnType,
  sendCalls,
} from './eip5792/actions/sendCalls.js'
export {
  type GetCallsStatusErrorType,
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  getCallsStatus,
} from './eip5792/actions/getCallsStatus.js'
export {
  type ShowCallsStatusErrorType,
  type ShowCallsStatusParameters,
  type ShowCallsStatusReturnType,
  showCallsStatus,
} from './eip5792/actions/showCallsStatus.js'
export {
  type WriteContractsErrorType,
  type WriteContractsParameters,
  type WriteContractsReturnType,
  writeContracts,
} from './eip5792/actions/writeContracts.js'
export {
  type WalletActionsEip5792,
  walletActionsEip5792,
} from './eip5792/decorators/eip5792.js'
