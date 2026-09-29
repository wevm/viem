// biome-ignore lint/performance/noBarrelFile: entrypoint
export {
  authenticatorAbi,
  erc4337AccountAbi,
  keystoreAbi,
  transactionContextAbi,
} from './abis.js'
export {
  delegateAuthSize,
  type NewSmartAccountParameters,
  type NewSmartAccountReturnType,
  newSmartAccount,
  type ToAccountParameters,
  type ToAccountReturnType,
  type ToDelegateSignerParameters,
  type ToEoaAccountParameters,
  type ToEoaAccountReturnType,
  toAccount,
  toDelegateSigner,
  toEoaAccount,
} from './accounts/toAccount.js'
export {
  type Eip8130SmartAccountImplementation,
  type ToSmartAccountParameters,
  type ToSmartAccountReturnType,
  toSmartAccount,
} from './accounts/toSmartAccount.js'
export {
  type GetActorConfigParameters,
  type GetActorConfigReturnType,
  getActorConfig,
} from './actions/getActorConfig.js'
export {
  type GetConfigSequenceParameters,
  type GetConfigSequenceReturnType,
  getConfigSequence,
  unsequencedLocalSequence,
} from './actions/getConfigSequence.js'
export {
  type GetLockStatusParameters,
  type GetLockStatusReturnType,
  getLockStatus,
} from './actions/getLockStatus.js'
export {
  type GetPolicyParameters,
  type GetPolicyReturnType,
  getPolicy,
} from './actions/getPolicy.js'
export {
  type GetSessionSpendParameters,
  type GetSessionSpendReturnType,
  getSessionSpend,
} from './actions/getSessionSpend.js'
export {
  type IsActorParameters,
  type IsActorReturnType,
  isActor,
} from './actions/isActor.js'
export {
  type IsLockedParameters,
  type IsLockedReturnType,
  isLocked,
} from './actions/isLocked.js'
export {
  type ValidateSignatureParameters,
  type ValidateSignatureReturnType,
  validateSignature,
} from './actions/validateSignature.js'
export {
  type Eip8130Capabilities,
  type Eip8130CapabilitiesParameters,
  eip8130Capabilities,
  eip8130CapabilitiesByChain,
  supportedPermissionTypes,
  supportedPolicyTypes,
  supportedSignerTypes,
  supportedSubAccountKeyTypes,
} from './capabilities.js'
export {
  accountStateFlags,
  actorScope,
  canonicalAuthDataLength,
  canonicalAuthenticators,
  defaultAccountAddress,
  deploymentHeaderSize,
  externalPolicyAuthenticator,
  keystoreAddress,
  maxCodeSize,
  policyDataLength,
  revokedAuthenticator,
  scopeUnrestricted,
  txContextAddress,
  unsequencedLocalHalf,
} from './constants.js'
export {
  type KeystoreActions,
  keystoreActions,
} from './decorators/keystoreActions.js'
export {
  baseSepoliaDeployment,
  canonicalEip8130Deployment,
  type Eip8130Deployment,
  eip8130Deployments,
  getEip8130Deployment,
  vibenetDevnetDeployment,
} from './deployments.js'
export {
  ActorNotBoundError,
  type ActorNotBoundErrorType,
  NonceScopeError,
  type NonceScopeErrorType,
  ScopeMismatchError,
  type ScopeMismatchErrorType,
} from './errors.js'
export {
  type AuthorizeActorOptions,
  authorizeActor,
  canUseSequencedNonce,
  encodePolicyData,
  incrementLocalEpoch,
  isNoncelessOnly,
  key,
  type Policy,
  revokeActor,
  toScope,
} from './keys.js'
export {
  type LockChangeParameters,
  lockChange,
  maxUnlockDelay,
  unlockChange,
} from './lock.js'
export { nonceForScope } from './nonce.js'
export {
  type FulfillGrantPermissionsErrorType,
  type FulfillGrantPermissionsParameters,
  type FulfillGrantPermissionsReturnType,
  fulfillGrantPermissions,
  type GrantRole,
  type ParsePermissionsContextErrorType,
  type ParsePermissionsContextReturnType,
  parsePermissionsContext,
  type RoutePermissionedCallsErrorType,
  type RoutePermissionedCallsParameters,
  type RoutePermissionedCallsReturnType,
  routePermissionedCalls,
  type ToPermissionsContextParameters,
  type ToSessionPolicyConfigErrorType,
  type ToSessionPolicyErrorType,
  type ToSessionPolicyParameters,
  toPermissionsContext,
  toSessionPolicy,
  toSessionPolicyConfig,
} from './permissions.js'
export {
  type CommitmentOfErrorType,
  commitmentOf,
  type DefineSessionPolicyErrorType,
  type DefineSessionPolicyParameters,
  defineSessionPolicy,
  type EncodeSessionPolicyActionErrorType,
  type EncodeSessionPolicyConfigErrorType,
  encodeSessionPolicyAction,
  encodeSessionPolicyConfig,
  type PolicyBinding,
  policyManagerAbi,
  type SessionPolicy,
  type SessionPolicyAction,
  type SessionPolicyCallScope,
  type SessionPolicyConfig,
  type SessionPolicySelectorRule,
  type SessionPolicyTokenLimit,
  sessionPolicyAbi,
  sessionPolicyAddress,
} from './policies.js'
export {
  type FulfillAddSubAccountErrorType,
  type FulfillAddSubAccountParameters,
  type FulfillAddSubAccountReturnType,
  fulfillAddSubAccount,
  type SubAccountKey,
} from './subAccounts.js'
export {
  type ActorIdFromAddressErrorType,
  type ActorIdFromPublicKeyErrorType,
  actorIdFromAddress,
  actorIdFromPublicKey,
} from './utils/actorId.js'
export {
  type ComputeAddressErrorType,
  type ComputeAddressParameters,
  computeAddress,
  deploymentHeader,
} from './utils/computeAddress.js'
export {
  accountChangeTypehash,
  type HashAccountChangesErrorType,
  type HashAccountChangesParameters,
  hashAccountChanges,
  signedAccountChangesTypehash,
} from './utils/hashActorChanges.js'
export {
  type EncodeApplySignedAccountChangesDataErrorType,
  type EncodeApplySignedAccountChangesDataParameters,
  type EncodeCreateAccountDataErrorType,
  type EncodeCreateAccountDataParameters,
  encodeApplySignedAccountChangesData,
  encodeCreateAccountData,
  type ToFactoryArgsErrorType,
  type ToFactoryArgsParameters,
  type ToFactoryArgsReturnType,
  toFactoryArgs,
} from './utils/keystoreCalls.js'
export { erc1167Bytecode, upgradeableProxyBytecode } from './utils/proxy.js'
export {
  type ResolveNonceKeyParameters,
  resolveNonceKey,
} from './utils/resolveNonceKey.js'
export {
  type SignAccountChangesErrorType,
  type SignAccountChangesParameters,
  signAccountChanges,
} from './utils/signActorChanges.js'
export {
  type EncodeSignedActorChangesSignatureErrorType,
  encodeSignedActorChangesSignature,
  type SignedActorChangeSet,
  signedActorChangesMagic,
} from './utils/signedActorChangesSignature.js'
export {
  type ToP256SignerParameters,
  type ToWebAuthnSignerParameters,
  toP256Signer,
  toWebAuthnSigner,
  type WebAuthnSignSource,
} from './utils/signers.js'
export {
  type GetSignatureEnvelopeHashParameters,
  getSignatureEnvelopeHash,
  multichainId,
  type ParsedSignatureEnvelope,
  parseSignatureEnvelope,
  type ReplaySafeHashErrorType,
  type ReplaySafeHashParameters,
  replaySafeHash,
  type SignatureType,
  type SignMessageEnvelopeErrorType,
  type SignMessageEnvelopeParameters,
  type SignTypedDataEnvelopeParameters,
  signatureType,
  signedMessageTypehash,
  signMessageEnvelope,
  signTypedDataEnvelope,
  type WrapCounterfactualSignatureErrorType,
  type WrapCounterfactualSignatureParameters,
  type WrapSignatureEnvelopeParameters,
  wrapCounterfactualSignature,
  wrapSignatureEnvelope,
} from './utils/signMessage.js'
