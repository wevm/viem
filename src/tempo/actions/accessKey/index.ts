// biome-ignore lint/performance/noBarrelFile: namespace module
export { authorize } from './authorize.js'
export { authorizeSync } from './authorizeSync.js'
export { burnWitness } from './burnWitness.js'
export { burnWitnessSync } from './burnWitnessSync.js'
export {
  AccessKeyAlreadyExistsError,
  type AccessKeyAlreadyExistsErrorType,
  AccessKeyCallNotAllowedError,
  type AccessKeyCallNotAllowedErrorType,
  AccessKeyError,
  type AccessKeyErrorType,
  AccessKeyExpiredError,
  type AccessKeyExpiredErrorType,
  AccessKeyExpiryInPastError,
  type AccessKeyExpiryInPastErrorType,
  AccessKeySignatureTypeMismatchError,
  type AccessKeySignatureTypeMismatchErrorType,
  AccessKeySpendingLimitExceededError,
  type AccessKeySpendingLimitExceededErrorType,
  type ExecutionErrorType,
} from './errors.js'
export { getMetadata } from './getMetadata.js'
export { getRemainingLimit } from './getRemainingLimit.js'
export { isWitnessBurned } from './isWitnessBurned.js'
export { revoke } from './revoke.js'
export { revokeSync } from './revokeSync.js'
export { saveAuthorization } from './saveAuthorization.js'
export { signAuthorization } from './signAuthorization.js'
export { updateLimit } from './updateLimit.js'
export { updateLimitSync } from './updateLimitSync.js'
export { verifyHash } from './verifyHash.js'
export { watchWitness } from './watchWitness.js'
export { watchWitnessBurned } from './watchWitnessBurned.js'

export { prepareAuthorization } from './prepareAuthorization.js'
