export { addChain } from './addChain'

export { deployContract } from './deployContract'
export type {
  DeployContractArgs,
  DeployContractResponse,
} from './deployContract'

export { getAccounts } from './getAccounts'

export { getPermissions } from './getPermissions'
export type { GetPermissionsResponse } from './getPermissions'

export { requestAccounts } from './requestAccounts'

export { requestPermissions } from './requestPermissions'
export type { RequestPermissionsResponse } from './requestPermissions'

export { sendTransaction } from './sendTransaction'
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

export { writeContract } from './writeContract'
export type { WriteContractArgs, WriteContractResponse } from './writeContract'
