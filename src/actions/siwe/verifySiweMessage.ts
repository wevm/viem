import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { Prettify } from '../../types/utils.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import type { HashMessageErrorType } from '../../utils/signature/hashMessage.js'
import { parseSiweMessage } from '../../utils/siwe/parseSiweMessage.js'
import {
  type ValidateSiweMessageParameters,
  validateSiweMessage,
} from '../../utils/siwe/validateSiweMessage.js'
import {
  type VerifyHashErrorType,
  type VerifyHashParameters,
  verifyHash,
} from '../public/verifyHash.js'

export type VerifySiweMessageParameters = Prettify<
  Pick<VerifyHashParameters, 'blockNumber' | 'blockTag'> &
    Pick<
      ValidateSiweMessageParameters,
      'address' | 'domain' | 'nonce' | 'scheme' | 'time'
    > & {
      /**
       * EIP-4361 formatted message.
       */
      message: string
      /**
       * Signature to check against.
       */
      signature: Hex
    }
>

export type VerifySiweMessageReturnType = boolean

export type VerifySiweMessageErrorType =
  | HashMessageErrorType
  | VerifyHashErrorType
  | ErrorType

/**
 * Verifies [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) formatted message was signed.
 *
 * Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
 *
 * - Docs {@link https://viem.sh/docs/siwe/actions/verifySiweMessage}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifySiweMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifySiweMessageReturnType}
 */
export async function verifySiweMessage<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: VerifySiweMessageParameters,
): Promise<VerifySiweMessageReturnType> {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    signature,
    time = new Date(),
    ...callRequest
  } = parameters

  const parsed = parseSiweMessage(message)
  if (!parsed.address) return false

  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time,
  })
  if (!isValid) return false

  const hash = hashMessage(message)
  return verifyHash(client, {
    address: parsed.address,
    hash,
    signature,
    ...callRequest,
  })
}
