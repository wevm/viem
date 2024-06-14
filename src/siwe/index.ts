// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  verifySiweMessage,
  type VerifySiweMessageParameters,
  type VerifySiweMessageReturnType,
  type VerifySiweMessageErrorType,
} from '../actions/siwe/verifySiweMessage.js'

export {
  createSiweMessage,
  type CreateSiweMessageParameters,
  type CreateSiweMessageReturnType,
  type CreateSiweMessageErrorType,
} from '../utils/siwe/createSiweMessage.js'

export { generateSiweNonce } from '../utils/siwe/generateSiweNonce.js'
export { parseSiweMessage } from '../utils/siwe/parseSiweMessage.js'

export {
  validateSiweMessage,
  type ValidateSiweMessageParameters,
  type ValidateSiweMessageReturnType,
} from '../utils/siwe/validateSiweMessage.js'

export type { SiweMessage } from '../utils/siwe/types.js'

export {
  type SiweInvalidMessageFieldErrorType,
  SiweInvalidMessageFieldError,
} from '../errors/siwe.js'
