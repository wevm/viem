export {
  addChain,
  getAccounts,
  getPermissions,
  requestAccounts,
  requestPermissions,
  sendTransaction,
  signMessage,
  switchChain,
  watchAsset,
} from './actions/wallet'
export type {
  FormattedTransactionRequest,
  GetPermissionsResponse,
  RequestPermissionsResponse,
  SendTransactionArgs,
  SendTransactionResponse,
  SignMessageArgs,
  SignMessageResponse,
  SwitchChainArgs,
  WatchAssetArgs,
  WatchAssetResponse,
} from './actions/wallet'
