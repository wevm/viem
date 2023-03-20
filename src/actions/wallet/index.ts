export { addChain } from './addChain'
export type { AddChainParameters } from './addChain'

export { deployContract } from './deployContract'
export type {
  DeployContractParameters,
  DeployContractReturnType,
} from './deployContract'

export { getAddresses } from './getAddresses'
export type { GetAddressesReturnType } from './getAddresses'

export { getChainId } from '../public/getChainId'
export type { GetChainIdReturnType } from '../public/getChainId'

export { getPermissions } from './getPermissions'
export type { GetPermissionsReturnType } from './getPermissions'

export { requestAddresses } from './requestAddresses'
export type { RequestAddressesReturnType } from './requestAddresses'

export { requestPermissions } from './requestPermissions'
export type {
  RequestPermissionsParameters,
  RequestPermissionsReturnType,
} from './requestPermissions'

export { sendTransaction } from './sendTransaction'
export type {
  FormattedTransactionRequest,
  SendTransactionParameters,
  SendTransactionReturnType,
} from './sendTransaction'

export { signMessage } from './signMessage'
export type {
  SignMessageParameters,
  SignMessageReturnType,
} from './signMessage'

export { signTypedData } from './signTypedData'
export type {
  SignTypedDataParameters,
  SignTypedDataReturnType,
} from './signTypedData'

export { switchChain } from './switchChain'
export type { SwitchChainParameters } from './switchChain'

export { watchAsset } from './watchAsset'
export type { WatchAssetParameters, WatchAssetReturnType } from './watchAsset'

export { writeContract } from './writeContract'
export type {
  WriteContractParameters,
  WriteContractReturnType,
} from './writeContract'
