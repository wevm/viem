// biome-ignore lint/performance/noBarrelFile: entrypoint
export {
  type SignMessageErrorType,
  type SignMessageParameters,
  type SignMessageReturnType,
  signMessage,
} from './actions/signMessage.js'
export {
  type SignTypedDataErrorType,
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
  signTypedData,
} from './actions/signTypedData.js'
export {
  type Erc7739Actions,
  /** @deprecated Use `Erc7739Actions` instead. */
  type Erc7739Actions as SoladyActions,
  type Erc7739ActionsParameters,
  /** @deprecated Use `erc7739Actions` instead. */
  type Erc7739ActionsParameters as SoladyActionsParameters,
  erc7739Actions,
  /** @deprecated Use `erc7739Actions` instead. */
  erc7739Actions as soladyActions,
} from './decorators/erc7739.js'
export {
  type HashMessageErrorType,
  type HashMessageParameters,
  type HashMessageReturnType,
  hashMessage,
} from './utils/hashMessage.js'
export {
  type HashTypedDataErrorType,
  type HashTypedDataParameters,
  type HashTypedDataReturnType,
  hashTypedData,
} from './utils/hashTypedData.js'
export {
  type WrapTypedDataSignatureErrorType,
  type WrapTypedDataSignatureParameters,
  type WrapTypedDataSignatureReturnType,
  wrapTypedDataSignature,
} from './utils/wrapTypedDataSignature.js'
