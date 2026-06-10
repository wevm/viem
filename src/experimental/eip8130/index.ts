// biome-ignore lint/performance/noBarrelFile: entrypoint
export {
  accountConfigurationAbi,
  authenticatorAbi,
  erc4337AccountAbi,
  nonceManagerAbi,
  transactionContextAbi,
} from './abis.js'
export {
  type To8130AccountParameters,
  type To8130AccountReturnType,
  to8130Account,
} from './accounts/to8130Account.js'
export {
  type Eip8130SmartAccountImplementation,
  type ToSmartAccount8130Parameters,
  type ToSmartAccount8130ReturnType,
  toSmartAccount8130,
} from './accounts/toSmartAccount8130.js'
export {
  type PrepareTransaction8130Parameters,
  prepareTransaction8130,
  type SendCalls8130Parameters,
  sendCalls8130,
} from './actions/sendCalls.js'
export {
  eip8130ChainIds,
  type Is8130EnabledParameters,
  is8130Enabled,
  register8130Chains,
  unregister8130Chains,
} from './chains.js'
export {
  aaBaseCost,
  aaPayerType,
  aaTransactionType,
  accountChangeType,
  accountConfigAddress,
  actorChangeType,
  actorScope,
  canonicalAuthenticators,
  defaultAccountAddress,
  deploymentHeaderSize,
  ecrecoverAuthenticator,
  maxCodeSize,
  nonceKeyMax,
  nonceManagerAddress,
  revokedAuthenticator,
  txContextAddress,
} from './constants.js'
export {
  baseSepoliaDeployment,
  type Eip8130Deployment,
  eip8130Deployments,
  getEip8130Deployment,
} from './deployments.js'
export {
  type AuthorizeActorOptions,
  authorizeActor,
  encodePolicyData,
  key,
  type Policy,
  revokeActor,
  toScope,
} from './keys.js'
export type {
  AaAccountChange,
  AaAccountChangeConfig,
  AaAccountChangeCreate,
  AaAccountChangeDelegation,
  AaActor,
  AaActorChange,
  AaAuthorizeActor,
  AaCall,
  AaCalls,
  AaRevokeActor,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from './types/transaction.js'
export {
  type EncodeApplySignedActorChangesDataErrorType,
  type EncodeApplySignedActorChangesDataParameters,
  type EncodeCreateAccountDataErrorType,
  type EncodeCreateAccountDataParameters,
  encodeApplySignedActorChangesData,
  encodeCreateAccountData,
  type ToFactoryArgs8130ErrorType,
  type ToFactoryArgs8130Parameters,
  type ToFactoryArgs8130ReturnType,
  toFactoryArgs8130,
} from './utils/accountConfigCalls.js'
export {
  type DecodeAuthorizeActorDataErrorType,
  type DecodedAuthorizeActorData,
  decodeAuthorizeActorData,
  type EncodeActorChangeDataErrorType,
  encodeActorChangeData,
} from './utils/actorChangeData.js'
export {
  type ActorIdFromAddressErrorType,
  type ActorIdFromPublicKeyErrorType,
  actorIdFromAddress,
  actorIdFromPublicKey,
} from './utils/actorId.js'
export {
  type AssertTransaction8130ErrorType,
  assertTransaction8130,
} from './utils/assertTransaction.js'
export {
  type ComputeAddress8130ErrorType,
  type ComputeAddress8130Parameters,
  computeAddress8130,
  deploymentHeader,
} from './utils/computeAddress.js'
export {
  actorChangeTypehash,
  type HashActorChanges8130ErrorType,
  type HashActorChanges8130Parameters,
  hashActorChanges8130,
  signedActorChangesTypehash,
} from './utils/hashActorChanges.js'
export {
  type GetPayerSignatureHash8130ErrorType,
  type GetSenderSignatureHash8130ErrorType,
  type GetSignatureHash8130Parameters,
  type GetSignatureHash8130ReturnType,
  getPayerSignatureHash8130,
  getSenderSignatureHash8130,
} from './utils/hashTransaction.js'
export {
  type ParseTransaction8130ErrorType,
  parseTransaction8130,
} from './utils/parseTransaction.js'
export { erc1167Bytecode } from './utils/proxy.js'
export {
  type SerializeTransaction8130ErrorType,
  serializeTransaction8130,
  toAccountChangesList,
  toCallsList,
  toTransactionBody,
} from './utils/serializeTransaction.js'
export {
  type SignActorChanges8130ErrorType,
  type SignActorChanges8130Parameters,
  signActorChanges8130,
} from './utils/signActorChanges.js'
export {
  type EncodeSignedActorChangesSignatureErrorType,
  encodeSignedActorChangesSignature,
  type SignedActorChangeSet,
  signedActorChangesMagic,
} from './utils/signedActorChangesSignature.js'
export {
  type Signer,
  type SignTransaction8130ErrorType,
  type SignTransaction8130Parameters,
  signTransaction8130,
} from './utils/signTransaction.js'
