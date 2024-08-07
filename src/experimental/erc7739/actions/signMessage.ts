import type { Address, TypedDataDomain } from 'abitype'
import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import {
  type GetEip712DomainParameters,
  getEip712Domain,
} from '../../../actions/public/getEip712Domain.js'
import { signTypedData } from '../../../actions/wallet/signTypedData.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { GetAccountParameter } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex, SignableMessage } from '../../../types/misc.js'
import type { OneOf, RequiredBy } from '../../../types/utils.js'
import { getAction } from '../../../utils/getAction.js'
import { toPrefixedMessage } from '../../../utils/signature/toPrefixedMessage.js'
import type { GetVerifierParameter } from '../types.js'

export type SignMessageParameters<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | undefined = Account | undefined,
  verifier extends Address | undefined = Address | undefined,
> = Pick<GetEip712DomainParameters, 'factory' | 'factoryData'> &
  GetAccountParameter<account, accountOverride> & {
    message: SignableMessage
  } & OneOf<
    | {
        verifierDomain: RequiredBy<
          TypedDataDomain,
          'chainId' | 'name' | 'verifyingContract' | 'version'
        >
        verifier?: undefined
      }
    | (GetVerifierParameter<verifier> & {
        verifierDomain?:
          | RequiredBy<
              TypedDataDomain,
              'chainId' | 'name' | 'verifyingContract' | 'version'
            >
          | undefined
      })
  >

export type SignMessageReturnType = Hex

export type SignMessageErrorType = ErrorType

/**
 * Signs a [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal sign message via [ERC-7739 `PersonalSign` format](https://eips.ethereum.org/EIPS/eip-7702).
 *
 * This Action is suitable to sign messages for Smart Accounts that implement (or conform to) [ERC-7739](https://eips.ethereum.org/EIPS/eip-7702) (e.g. Solady's [ERC1271.sol](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC1271.sol)).
 *
 * - Docs: https://viem.sh/experimental/erc7739/signMessage
 *
 * With the calculated signature, you can:
 * - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage) to verify the signature,
 *
 * @param client - Client to use
 * @param parameters - {@link SignMessageParameters}
 * @returns The signed message. {@link SignMessageReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signMessage } from 'viem/experimental/erc7739'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const signature = await signMessage(client, {
 *   account: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',
 *   message: 'hello world',
 *   verifier: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, custom } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { signMessage } from 'viem/experimental/erc7739'
 *
 * const client = createWalletClient({
 *   account: '0xE8Df82fA4E10e6A12a9Dab552bceA2acd26De9bb',
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const signature = await signMessage(client, {
 *   message: 'hello world',
 *   verifier: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
export async function signMessage<
  chain extends Chain | undefined,
  account extends Account | undefined,
  accountOverride extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SignMessageParameters<account, accountOverride>,
): Promise<SignMessageReturnType> {
  const {
    account: account_ = client.account,
    factory,
    factoryData,
    message,
    verifier,
  } = parameters

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/experimental/erc7739/signMessage',
    })
  const account = parseAccount(account_)

  const domain = await (async () => {
    if (parameters.verifierDomain) return parameters.verifierDomain
    const {
      domain: { salt, ...domain },
    } = await getAction(
      client,
      getEip712Domain,
      'getEip712Domain',
    )({
      address: verifier!,
      factory,
      factoryData,
    })
    return domain
  })()

  return getAction(
    client,
    signTypedData,
    'signTypedData',
  )({
    account,
    domain,
    types: {
      PersonalSign: [{ name: 'prefixed', type: 'bytes' }],
    },
    primaryType: 'PersonalSign',
    message: {
      prefixed: toPrefixedMessage(message),
    },
  })
}
