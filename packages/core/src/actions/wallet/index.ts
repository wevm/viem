export { addChain } from './addChain'

export { getAccounts } from './getAccounts'

export { requestAccounts } from './requestAccounts'

export { InvalidGasArgumentsError, sendTransaction } from './sendTransaction'
export type {
  FormattedTransactionRequest,
  SendTransactionArgs,
  SendTransactionResponse,
} from './sendTransaction'

export { signMessage } from './signMessage'
export type { SignMessageArgs, SignMessageResponse } from './signMessage'

export { switchChain } from './switchChain'
export type { SwitchChainArgs } from './switchChain'

export { watchAsset } from './watchAsset'
export type { WatchAssetArgs, WatchAssetResponse } from './watchAsset'
