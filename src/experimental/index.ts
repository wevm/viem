// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  /** @deprecated This is no longer experimental – use `import type { GetCapabilitiesParameters } from 'viem/actions'` instead. */
  type GetCapabilitiesParameters,
  /** @deprecated This is no longer experimental – use `import type { GetCapabilitiesErrorType } from 'viem/actions'` instead. */
  type GetCapabilitiesErrorType,
  /** @deprecated This is no longer experimental – use `import type { GetCapabilitiesReturnType } from 'viem/actions'` instead. */
  type GetCapabilitiesReturnType,
  /** @deprecated This is no longer experimental – use `import { getCapabilities } from 'viem/actions'` instead. */
  getCapabilities,
} from '../actions/wallet/getCapabilities.js'
export {
  /** @deprecated This is no longer experimental – use `import type { SendCallsErrorType } from 'viem/actions'` instead. */
  type SendCallsErrorType,
  /** @deprecated This is no longer experimental – use `import type { SendCallsParameters } from 'viem/actions'` instead. */
  type SendCallsParameters,
  /** @deprecated This is no longer experimental – use `import type { SendCallsReturnType } from 'viem/actions'` instead. */
  type SendCallsReturnType,
  /** @deprecated This is no longer experimental – use `import { sendCalls } from 'viem/actions'` instead. */
  sendCalls,
} from '../actions/wallet/sendCalls.js'
export {
  /** @deprecated This is no longer experimental – use `import type { GetCallsStatusErrorType } from 'viem/actions'` instead. */
  type GetCallsStatusErrorType,
  /** @deprecated This is no longer experimental – use `import type { GetCallsStatusParameters } from 'viem/actions'` instead. */
  type GetCallsStatusParameters,
  /** @deprecated This is no longer experimental – use `import type { GetCallsStatusReturnType } from 'viem/actions'` instead. */
  type GetCallsStatusReturnType,
  /** @deprecated This is no longer experimental – use `import { getCallsStatus } from 'viem/actions'` instead. */
  getCallsStatus,
} from '../actions/wallet/getCallsStatus.js'
export {
  /** @deprecated This is no longer experimental – use `import type { ShowCallsStatusErrorType } from 'viem/actions'` instead. */
  type ShowCallsStatusErrorType,
  /** @deprecated This is no longer experimental – use `import type { ShowCallsStatusParameters } from 'viem/actions'` instead. */
  type ShowCallsStatusParameters,
  /** @deprecated This is no longer experimental – use `import type { ShowCallsStatusReturnType } from 'viem/actions'` instead. */
  type ShowCallsStatusReturnType,
  /** @deprecated This is no longer experimental – use `import { showCallsStatus } from 'viem/actions'` instead. */
  showCallsStatus,
} from '../actions/wallet/showCallsStatus.js'
export {
  /** @deprecated This is no longer experimental – use `import type { WaitForCallsStatusErrorType } from 'viem/actions'` instead. */
  type WaitForCallsStatusErrorType,
  /** @deprecated This is no longer experimental – use `import type { WaitForCallsStatusParameters } from 'viem/actions'` instead. */
  type WaitForCallsStatusParameters,
  /** @deprecated This is no longer experimental – use `import type { WaitForCallsStatusReturnType } from 'viem/actions'` instead. */
  type WaitForCallsStatusReturnType,
  /** @deprecated This is no longer experimental – use `import type { WaitForCallsStatusTimeoutErrorType } from 'viem/actions'` instead. */
  type WaitForCallsStatusTimeoutErrorType,
  /** @deprecated This is no longer experimental – use `import { waitForCallsStatus } from 'viem/actions'` instead. */
  waitForCallsStatus,
} from '../actions/wallet/waitForCallsStatus.js'
export {
  /** @deprecated This is no longer experimental – use `import type { WalletActions } from 'viem'` instead. */
  type WalletActions as Eip5792Actions,
  /** @deprecated This is no longer experimental – use `import { createWalletClient } from 'viem'` or `import { walletActions } from 'viem'` instead. */
  walletActions as eip5792Actions,
} from '../clients/decorators/wallet.js'

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
export {
  /** @deprecated This is no longer experimental – use `import type { Authorization } from 'viem'` instead. */
  type Authorization,
  /** @deprecated This is no longer experimental – use `import type { SignedAuthorization } from 'viem'` instead. */
  type SignedAuthorization,
  /** @deprecated This is no longer experimental – use `import type { AuthorizationList } from 'viem'` instead. */
  type AuthorizationList,
  /** @deprecated This is no longer experimental – use `import type { SignedAuthorizationList } from 'viem'` instead. */
  type SignedAuthorizationList,
  /** @deprecated This is no longer experimental – use `import type { SerializedAuthorization } from 'viem'` instead. */
  type SerializedAuthorization,
  /** @deprecated This is no longer experimental – use `import type { SerializedAuthorizationList } from 'viem'` instead. */
  type SerializedAuthorizationList,
} from '../types/authorization.js'
export {
  /** @deprecated This is no longer experimental – use `import type { RpcAuthorizationList } from 'viem'` instead. */
  type RpcAuthorizationList,
  /** @deprecated This is no longer experimental – use `import type { RpcAuthorization } from 'viem'` instead. */
  type RpcAuthorization,
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
