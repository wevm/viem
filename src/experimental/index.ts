// biome-ignore lint/performance/noBarrelFile: entrypoint module
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
  type WaitForCallsStatusErrorType,
  type WaitForCallsStatusParameters,
  type WaitForCallsStatusReturnType,
  type WaitForCallsStatusTimeoutErrorType,
  WaitForCallsStatusTimeoutError,
  waitForCallsStatus,
} from './eip5792/actions/waitForCallsStatus.js'
export {
  type WriteContractsErrorType,
  type WriteContractsParameters,
  type WriteContractsReturnType,
  type WriteContractFunctionParameters,
  writeContracts,
} from './eip5792/actions/writeContracts.js'
export {
  type Eip5792Actions,
  eip5792Actions,
} from './eip5792/decorators/eip5792.js'

export {
  /** @deprecated This is no longer experimental – use `import type { WalletActions } from 'viem'` instead. */
  type WalletActions as Eip7702Actions,
  /** @deprecated This is no longer experimental – use `import { createWalletClient } from 'viem'` or `import { walletActions } from 'viem'` instead. */
  walletActions as eip7702Actions,
} from '../clients/decorators/wallet.js'
export {
  /** @deprecated This is no longer experimental – use `import type { PrepareAuthorizationParameters } from 'viem/actions'` instead. */
  type PrepareAuthorizationParameters,
  /** @deprecated This is no longer experimental – use `import type { PrepareAuthorizationReturnType } from 'viem/actions'` instead. */
  type PrepareAuthorizationReturnType,
  /** @deprecated This is no longer experimental – use `import type { PrepareAuthorizationErrorType } from 'viem/actions'` instead. */
  type PrepareAuthorizationErrorType,
  /** @deprecated This is no longer experimental – use `import { prepareAuthorization } from 'viem/actions'` instead. */
  prepareAuthorization,
} from '../actions/wallet/prepareAuthorization.js'
export {
  /** @deprecated This is no longer experimental – use `import type { SignAuthorizationParameters } from 'viem/actions'` instead. */
  type SignAuthorizationParameters,
  /** @deprecated This is no longer experimental – use `import type { SignAuthorizationReturnType } from 'viem/actions'` instead. */
  type SignAuthorizationReturnType,
  /** @deprecated This is no longer experimental – use `import type { SignAuthorizationErrorType } from 'viem/actions'` instead. */
  type SignAuthorizationErrorType,
  /** @deprecated This is no longer experimental – use `import { signAuthorization } from 'viem/actions'` instead. */
  signAuthorization,
} from '../actions/wallet/signAuthorization.js'
export type {
  /** @deprecated This is no longer experimental – use `import type { Authorization } from 'viem'` instead. */
  Authorization,
  /** @deprecated This is no longer experimental – use `import type { SignedAuthorization } from 'viem'` instead. */
  SignedAuthorization,
  /** @deprecated This is no longer experimental – use `import type { AuthorizationList } from 'viem'` instead. */
  AuthorizationList,
  /** @deprecated This is no longer experimental – use `import type { SignedAuthorizationList } from 'viem'` instead. */
  SignedAuthorizationList,
  /** @deprecated This is no longer experimental – use `import type { SerializedAuthorization } from 'viem'` instead. */
  SerializedAuthorization,
  /** @deprecated This is no longer experimental – use `import type { SerializedAuthorizationList } from 'viem'` instead. */
  SerializedAuthorizationList,
} from '../types/authorization.js'
export type {
  /** @deprecated This is no longer experimental – use `import type { RpcAuthorizationList } from 'viem'` instead. */
  RpcAuthorizationList,
  /** @deprecated This is no longer experimental – use `import type { RpcAuthorization } from 'viem'` instead. */
  RpcAuthorization,
} from '../types/rpc.js'
export {
  /** @deprecated This is no longer experimental – use `import type { HashAuthorizationParameters } from 'viem/utils'` instead. */
  type HashAuthorizationParameters,
  /** @deprecated This is no longer experimental – use `import type { HashAuthorizationReturnType } from 'viem/utils'` instead. */
  type HashAuthorizationReturnType,
  /** @deprecated This is no longer experimental – use `import type { HashAuthorizationErrorType } from 'viem/utils'` instead. */
  type HashAuthorizationErrorType,
  /** @deprecated This is no longer experimental – use `import { hashAuthorization } from 'viem/utils'` instead. */
  hashAuthorization,
} from '../utils/authorization/hashAuthorization.js'
export {
  /** @deprecated This is no longer experimental – use `import type { RecoverAuthorizationAddressParameters } from 'viem/utils'` instead. */
  type RecoverAuthorizationAddressParameters,
  /** @deprecated This is no longer experimental – use `import type { RecoverAuthorizationAddressReturnType } from 'viem/utils'` instead. */
  type RecoverAuthorizationAddressReturnType,
  /** @deprecated This is no longer experimental – use `import type { RecoverAuthorizationAddressErrorType } from 'viem/utils'` instead. */
  type RecoverAuthorizationAddressErrorType,
  /** @deprecated This is no longer experimental – use `import { recoverAuthorizationAddress } from 'viem/utils'` instead. */
  recoverAuthorizationAddress,
} from '../utils/authorization/recoverAuthorizationAddress.js'
export {
  /** @deprecated This is no longer experimental – use `import type { SerializeAuthorizationListReturnType } from 'viem/utils'` instead. */
  type SerializeAuthorizationListReturnType,
  /** @deprecated This is no longer experimental – use `import type { SerializeAuthorizationListErrorType } from 'viem/utils'` instead. */
  type SerializeAuthorizationListErrorType,
  /** @deprecated This is no longer experimental – use `import { serializeAuthorizationList } from 'viem/utils'` instead. */
  serializeAuthorizationList,
} from '../utils/authorization/serializeAuthorizationList.js'
export {
  /** @deprecated This is no longer experimental – use `import type { VerifyAuthorizationParameters } from 'viem/utils'` instead. */
  type VerifyAuthorizationParameters,
  /** @deprecated This is no longer experimental – use `import type { VerifyAuthorizationReturnType } from 'viem/utils'` instead. */
  type VerifyAuthorizationReturnType,
  /** @deprecated This is no longer experimental – use `import type { VerifyAuthorizationErrorType } from 'viem/utils'` instead. */
  type VerifyAuthorizationErrorType,
  /** @deprecated This is no longer experimental – use `import { verifyAuthorization } from 'viem/utils'` instead. */
  verifyAuthorization,
} from '../utils/authorization/verifyAuthorization.js'

export {
  type GrantPermissionsParameters,
  type GrantPermissionsReturnType,
  grantPermissions,
} from './erc7715/actions/grantPermissions.js'
export {
  type Erc7715Actions,
  erc7715Actions,
} from './erc7715/decorators/erc7715.js'

export {
  type Erc7739Actions,
  type Erc7739ActionsParameters,
  erc7739Actions,
} from './erc7739/decorators/erc7739.js'

export {
  type Erc7821Actions,
  erc7821Actions,
} from './erc7821/decorators/erc7821.js'
