import type { Address } from 'abitype'
import { erc20Abi } from '../../../constants/abis.js'
import { BaseError } from '../../../errors/base.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import type { AaCall, AaCalls } from '../../eip8130/types/transaction.js'
import type {
  GetTermsReturnType,
  PaymentOption,
  SponsoredOfferDeclined,
  SponsoredOfferSelectable,
  TokenChoice,
  TokenPaymentOffer,
} from '../types.js'

/** Encodes an ERC-20 `transfer(to, amount)` call. */
export function encodeTokenTransfer(parameters: {
  token: Address
  to: Address
  amount: bigint
}): AaCall {
  return {
    to: parameters.token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [parameters.to, parameters.amount],
    }),
  }
}

/** A `token` offer. */
export function isTokenOffer(option: PaymentOption): option is TokenPaymentOffer {
  return option.kind === 'token'
}

/** A declined sponsorship entry (`sponsored_declined`, never selectable). */
export function isDeclinedOffer(
  option: PaymentOption,
): option is SponsoredOfferDeclined {
  return option.kind === 'sponsored_declined'
}

/** A selectable full-sponsorship offer (`sponsored`). */
export function isSponsoredOffer(
  option: PaymentOption,
): option is SponsoredOfferSelectable {
  return option.kind === 'sponsored'
}

/** Any offer the wallet may build a transaction from (excludes declined entries). */
export function isSelectableOffer(
  option: PaymentOption,
): option is SponsoredOfferSelectable | TokenPaymentOffer {
  return isSponsoredOffer(option) || isTokenOffer(option)
}

export type SelectPaymentOptionParameters = {
  /** Prefer token payment, optionally constrained to this token, over sponsorship. */
  token?: Address | undefined
}

export type SelectPaymentOptionReturnType = {
  option: SponsoredOfferSelectable | TokenPaymentOffer
  /** The chosen token, when `option` is a `token` offer. */
  tokenChoice?: TokenChoice | undefined
}

/**
 * Picks one selectable offer (and, for a token offer, one `TokenChoice`) from a
 * `payer_getTerms` result, per ERC-8168:
 *
 * - When `token` is set, picks the first `token` offer whose `tokens` contains a
 *   matching choice (by `token`).
 * - Otherwise prefers the first selectable `sponsored` offer; falling back to
 *   the first `token` offer and its first choice.
 *
 * `sponsored_declined` entries are never selected.
 */
export function selectPaymentOption(
  terms: GetTermsReturnType,
  parameters: SelectPaymentOptionParameters = {},
): SelectPaymentOptionReturnType {
  const { token } = parameters
  const options = terms.options ?? []

  const matchChoice = (offer: TokenPaymentOffer): TokenChoice | undefined => {
    const choices = offer.tokens ?? []
    if (token)
      return choices.find(
        (c) => c.token.toLowerCase() === token.toLowerCase(),
      )
    return choices[0]
  }

  // Explicit token request: only a matching token offer satisfies it.
  if (token) {
    for (const option of options) {
      if (!isTokenOffer(option)) continue
      const tokenChoice = matchChoice(option)
      if (tokenChoice) return { option, tokenChoice }
    }
    throw new BaseError(
      `No token offer matches the requested token "${token}".`,
    )
  }

  // Otherwise prefer a selectable sponsored offer.
  const sponsored = options.find(isSponsoredOffer)
  if (sponsored) return { option: sponsored }

  // Fall back to the first token offer.
  const tokenOffer = options.find(isTokenOffer)
  if (tokenOffer) {
    const tokenChoice = matchChoice(tokenOffer)
    if (!tokenChoice)
      throw new BaseError('Token offer carries no `tokens` to pay with.')
    return { option: tokenOffer, tokenChoice }
  }

  throw new BaseError(
    'Terms carry no selectable offer (only `sponsored_declined` entries, or an empty `options` array).',
  )
}

export type BuildSponsoredCallsParameters = {
  /** Terms returned by `payer_getTerms`. */
  terms: GetTermsReturnType
  /** The user's intended calls (placed in the final phase). */
  calls: readonly AaCall[]
  /** Prefer token payment with this token over sponsorship. */
  token?: Address | undefined
}

export type BuildSponsoredCallsReturnType = {
  /** Payer address (the selected offer's `payer`) to set on the transaction. */
  payer: Address
  /** Ordered call phases (phase 0 = token transfer when paying, last = user calls). */
  calls: AaCalls
  /** The selected payment offer. */
  option: SponsoredOfferSelectable | TokenPaymentOffer
  /** The selected token choice, when paying with a token. */
  tokenChoice?: TokenChoice | undefined
  /** Phase-0 transfer destination (`feeRecipient` ?? offer `payer`), when paying with a token. */
  feeRecipient?: Address | undefined
  /** Phase-0 token transfer amount (`paymentAmount`), when paying with a token. */
  paymentAmount?: bigint | undefined
}

/**
 * Constructs the EIP-8130 `calls` phases and `payer` from `payer_getTerms`
 * output, per the ERC-8168 phase table:
 *
 * | Offer `kind` | Phase 0 | Phase 1 |
 * |---|---|---|
 * | `sponsored` | — | user calls |
 * | `token` | `transfer(choice.feeRecipient ?? offer.payer, choice.paymentAmount)` | user calls |
 *
 * Balance-funded sponsorship (a `sponsored` offer carrying a `balance`) uses the
 * full-sponsorship construction (no phase 0); the payer is reimbursed off-chain
 * from the sender's allowance/credit.
 */
export function buildSponsoredCalls(
  parameters: BuildSponsoredCallsParameters,
): BuildSponsoredCallsReturnType {
  const { terms, calls, token } = parameters

  const { option, tokenChoice } = selectPaymentOption(terms, { token })

  if (option.kind === 'sponsored')
    return { payer: option.payer, calls: [calls], option }

  if (!tokenChoice)
    throw new BaseError('Selected token offer resolved no `TokenChoice`.')

  const feeRecipient = tokenChoice.feeRecipient ?? option.payer
  const paymentAmount = hexToBigInt(tokenChoice.paymentAmount)
  const phase0: AaCall[] = [
    encodeTokenTransfer({
      token: tokenChoice.token,
      to: feeRecipient,
      amount: paymentAmount,
    }),
  ]

  return {
    payer: option.payer,
    calls: [phase0, calls],
    option,
    tokenChoice,
    feeRecipient,
    paymentAmount,
  }
}
