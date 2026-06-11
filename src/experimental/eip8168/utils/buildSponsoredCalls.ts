import type { Address } from 'abitype'
import { erc20Abi } from '../../../constants/abis.js'
import { BaseError } from '../../../errors/base.js'
import { encodeFunctionData } from '../../../utils/abi/encodeFunctionData.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import type { AaCall, AaCalls } from '../../eip8130/types/transaction.js'
import type {
  GetTermsReturnType,
  PayerRpcCall,
  PayerTokenOption,
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

function toAaCall(call: PayerRpcCall): AaCall {
  return { to: call.to, data: call.data ?? '0x' }
}

export type BuildSponsoredCallsParameters = {
  /** Terms returned by `payer_getTerms`. */
  terms: GetTermsReturnType
  /** The user's intended calls (placed in the final phase). */
  calls: readonly AaCall[]
  /**
   * Token to pay with when not fully sponsored. Defaults to the first
   * `tokenOptions` entry (or `preferredToken` if it matches an option).
   */
  token?: Address | undefined
}

export type BuildSponsoredCallsReturnType = {
  /** Payer address to set on the transaction. */
  payer: Address
  /** Ordered call phases (phase 0 = sponsorship requirements, last = user calls). */
  calls: AaCalls
  /** The selected token option, when paying with a token. */
  tokenOption?: PayerTokenOption | undefined
  /** Phase-0 token transfer amount (`paymentAmount`), when paying with a token. */
  paymentAmount?: bigint | undefined
}

/**
 * Constructs the EIP-8130 `calls` phases and `payer` from `payer_getTerms`
 * output, per the ERC-8168 phase table:
 *
 * | Model | Phase 0 | Last phase |
 * |---|---|---|
 * | Full sponsorship | — | user calls |
 * | Token payment | `transfer(payer, paymentAmount)` | user calls |
 * | Required calls | required calls | user calls |
 * | Token + required | transfer + required calls | user calls |
 *
 * Balance-funded sponsorship uses the full-sponsorship construction (no phase-0
 * transfer); the payer is reimbursed off-chain from the sender's budget/credit.
 */
export function buildSponsoredCalls(
  parameters: BuildSponsoredCallsParameters,
): BuildSponsoredCallsReturnType {
  const { terms, calls } = parameters

  const phase0: AaCall[] = []
  let tokenOption: PayerTokenOption | undefined
  let paymentAmount: bigint | undefined

  if (!terms.sponsored) {
    const options = terms.tokenOptions ?? []
    if (options.length === 0)
      throw new BaseError(
        'Terms are not sponsored and carry no `tokenOptions` to pay with.',
      )
    tokenOption = parameters.token
      ? options.find(
          (o) => o.token.toLowerCase() === parameters.token!.toLowerCase(),
        )
      : options[0]
    if (!tokenOption)
      throw new BaseError(
        `No token option matches the requested token "${parameters.token}".`,
      )
    paymentAmount = hexToBigInt(tokenOption.paymentAmount)
    phase0.push(
      encodeTokenTransfer({
        token: tokenOption.token,
        to: terms.payer,
        amount: paymentAmount,
      }),
    )
  }

  if (terms.requiredCalls?.length)
    phase0.push(...terms.requiredCalls.map(toAaCall))

  const phases: AaCalls = phase0.length > 0 ? [phase0, calls] : [calls]

  return { payer: terms.payer, calls: phases, tokenOption, paymentAmount }
}
