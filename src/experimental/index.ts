// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type ToSmartAccountReturnType,
  toSmartAccount,
} from './erc4337/accounts/toSmartAccount.js'
export {
  type SoladyImplementation,
  type SoladyImplementationParameters,
  type SoladyImplementationReturnType,
  solady,
} from './erc4337/accounts/implementations/solady.js'
export {
  type GetSupportedEntryPointsErrorType,
  type GetSupportedEntryPointsReturnType,
  getSupportedEntryPoints,
} from './erc4337/actions/getSupportedEntryPoints.js'
export {
  type BundlerClient,
  type BundlerClientConfig,
  type CreateBundlerClientErrorType,
  createBundlerClient,
} from './erc4337/clients/createBundlerClient.js'
export {
  type BundlerActions,
  bundlerActions,
} from './erc4337/clients/decorators/bundler.js'
export type { BundlerRpcSchema } from './erc4337/types/eip1193.js'
export type {
  RpcEstimateUserOperationGasReturnType,
  RpcGetUserOperationByHashReturnType,
  RpcUserOperation,
  RpcUserOperationReceipt,
} from './erc4337/types/rpc.js'
export type {
  EstimateUserOperationGasReturnType,
  GetUserOperationByHashReturnType,
  PackedUserOperation,
  UserOperation,
  UserOperationReceipt,
} from './erc4337/types/userOperation.js'

export {
  type GetCapabilitiesParameters,
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
  type WriteContractFunctionParameters,
  writeContracts,
} from './eip5792/actions/writeContracts.js'
export {
  type WalletActionsEip5792,
  walletActionsEip5792,
} from './eip5792/decorators/eip5792.js'

export {
  /** @deprecated This is no longer experimental – use `import type { ParseErc6492SignatureErrorType } from 'viem'` instead. */
  type ParseErc6492SignatureErrorType,
  /** @deprecated This is no longer experimental – use `import type { ParseErc6492SignatureParameters } from 'viem'` instead. */
  type ParseErc6492SignatureParameters,
  /** @deprecated This is no longer experimental – use `import type { ParseErc6492SignatureReturnType } from 'viem'` instead. */
  type ParseErc6492SignatureReturnType,
  /** @deprecated This is no longer experimental – use `import { parseErc6492Signature } from 'viem'` instead. */
  parseErc6492Signature,
} from '../utils/signature/parseErc6492Signature.js'
export {
  /** @deprecated This is no longer experimental – use `import type { IsErc6492SignatureErrorType } from 'viem'` instead. */
  type IsErc6492SignatureErrorType,
  /** @deprecated This is no longer experimental – use `import type { IsErc6492SignatureParameters } from 'viem'` instead. */
  type IsErc6492SignatureParameters,
  /** @deprecated This is no longer experimental – use `import type { IsErc6492SignatureReturnType } from 'viem'` instead. */
  type IsErc6492SignatureReturnType,
  /** @deprecated This is no longer experimental – use `import { isErc6492Signature } from 'viem'` instead. */
  isErc6492Signature,
} from '../utils/signature/isErc6492Signature.js'
export {
  /** @deprecated This is no longer experimental – use `import type { SerializeErc6492SignatureErrorType } from 'viem'` instead. */
  type SerializeErc6492SignatureErrorType,
  /** @deprecated This is no longer experimental – use `import type { SerializeErc6492SignatureParameters } from 'viem'` instead. */
  type SerializeErc6492SignatureParameters,
  /** @deprecated This is no longer experimental – use `import type { SerializeErc6492SignatureReturnType } from 'viem'` instead. */
  type SerializeErc6492SignatureReturnType,
  /** @deprecated This is no longer experimental – use `import { serializeErc6492Signature } from 'viem'` instead. */
  serializeErc6492Signature,
} from '../utils/signature/serializeErc6492Signature.js'

export {
  type GrantPermissionsParameters,
  type GrantPermissionsReturnType,
  grantPermissions,
} from './erc7715/actions/grantPermissions.js'
export {
  type WalletActionsErc7715,
  walletActionsErc7715,
} from './erc7715/decorators/erc7715.js'

export {
  type SoladyActions,
  type SoladyActionsParameters,
  soladyActions,
} from './solady/decorators/solady.js'
