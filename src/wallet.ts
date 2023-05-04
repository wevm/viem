export { addChain, type AddChainParameters } from './actions/wallet/addChain.js'
export {
  getAddresses,
  type GetAddressesReturnType,
} from './actions/wallet/getAddresses.js'
export {
  getPermissions,
  type GetPermissionsReturnType,
} from './actions/wallet/getPermissions.js'
export {
  requestAddresses,
  type RequestAddressesReturnType,
} from './actions/wallet/requestAddresses.js'
export {
  requestPermissions,
  type RequestPermissionsReturnType,
} from './actions/wallet/requestPermissions.js'
export {
  sendTransaction,
  type FormattedTransactionRequest,
  type SendTransactionParameters,
  type SendTransactionReturnType,
} from './actions/wallet/sendTransaction.js'
export {
  signMessage,
  type SignMessageParameters,
  type SignMessageReturnType,
} from './actions/wallet/signMessage.js'
export {
  signTypedData,
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
} from './actions/wallet/signTypedData.js'
export {
  switchChain,
  type SwitchChainParameters,
} from './actions/wallet/switchChain.js'
export {
  watchAsset,
  type WatchAssetParameters,
  type WatchAssetReturnType,
} from './actions/wallet/watchAsset.js'
