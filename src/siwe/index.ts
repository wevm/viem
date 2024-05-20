export {
  createMessage,
  type CreateMessageParameters,
  type CreateMessageReturnType,
  type CreateMessageErrorType,
} from '../utils/siwe/createMessage.js'

export { generateNonce } from '../utils/siwe/generateNonce.js'
export { parseMessage } from '../utils/siwe/parseMessage.js'

export {
  verifyMessage,
  type VerifyMessageParameters,
  type VerifyMessageReturnType,
  type VerifyMessageErrorType,
} from '../utils/siwe/verifyMessage.js'

export type { Message } from '../utils/siwe/types.js'

export {
  type SiweInvalidMessageFieldErrorType,
  SiweInvalidMessageFieldError,
} from '../errors/siwe.js'
