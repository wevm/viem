import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import type { PrivateKeyAccount } from '../accounts/types.js'
import { readContract } from '../actions/public/readContract.js'
import { erc20Abi } from '../constants/abis.js'
import { BaseError } from '../errors/base.js'
import type { Frame as Frame_ } from '../types/frame.js'
import { encodeFunctionData } from '../utils/abi/encodeFunctionData.js'
import * as Frame from './Frame.js'
import * as internal from './internal/sponsorship.js'

/**
 * Pays gas through an ETH-funded contract and reimburses it in an ERC-20 token.
 * @param options - Payer, reimbursement token, and deployed payer contract. The payer defaults to the transaction account.
 * @returns Adjacent payment-approval and token-reimbursement frames.
 */
export function fee(options: fee.Options) {
  const { payer, token, contractAddress, ...gas } = options

  return Frame.from((context) => {
    const sponsor = payer ?? context.account
    if (
      !sponsor ||
      typeof sponsor === 'string' ||
      !('sign' in sponsor) ||
      !sponsor.sign
    )
      throw new BaseError(
        'Frame.fee: `payer` or the transaction `account` must provide a signing function.',
      )

    const signature: Frame.Signature = (() => {
      if ('scheme' in sponsor) return sponsor
      const sign = sponsor.sign
      return {
        scheme: 'secp256k1',
        signer: sponsor.address,
        sign: (parameters) => sign({ hash: parameters.hash }),
      }
    })()
    if (signature.payload && signature.payload !== '0x')
      throw new BaseError(
        'Frame.fee: payer signatures must use the canonical transaction hash; `payload` must be omitted or "0x".',
      )

    return {
      name: 'fee',

      dataSuffix() {
        return undefined
      },

      async afterFill(context) {
        const verifierAddress =
          'verifier' in sponsor ? sponsor.verifier : undefined

        const { client, transaction, entries } = context

        const fees = entries.filter(
          (entry) => entry.name === 'fee' && entry.afterFill,
        )
        if (fees.length !== 1)
          throw new BaseError(
            'Frame.fee: a transaction must contain exactly one fee group.',
          )
        const payer = fees[0]!
        const token = entries[payer.frameIndex + 1]!
        if (transaction.blobVersionedHashes?.length)
          throw new BaseError(
            'Frame.fee: `blobVersionedHashes` must be empty; blob gas sponsorship is unsupported.',
          )
        if (transaction.signatures?.length !== 2)
          throw new BaseError(
            'Frame.fee: signature allocation must contain exactly two entries: sender at index 0 and payer at index 1.',
          )

        const expected = (() => {
          if (signature.scheme === 'arbitrary' || signature.scheme === 0)
            return 0n
          if (signature.scheme === 'p256' || signature.scheme === 2) return 2n
          return 1n
        })()
        const witnessGas =
          transaction.signatures.reduce(
            (size, signature) => size + internal.signatureSize(signature),
            0n,
          ) * 64n
        const reserved = internal.getGas(transaction) + witnessGas + 64n * 64n
        const [amount, scheme, signer, verifier] = await readContract(client, {
          address: payer.frame.to!,
          abi: internal.abi,
          functionName: 'quoteAndAuthentication',
          args: [token.frame.to!, reserved * transaction.maxFeePerGas!],
        })
        if (
          scheme !== expected ||
          (scheme === 0n
            ? !verifierAddress ||
              verifier.toLowerCase() !== verifierAddress.toLowerCase()
            : signer.toLowerCase() !== signature.signer?.toLowerCase())
        )
          throw new BaseError(
            'Frame.fee: payer signature scheme, signer, or verifier does not match `contractAddress` authentication configuration.',
          )
        if (amount <= 0n)
          throw new BaseError(
            'Frame.fee: `quoteAndAuthentication` must return a strictly positive token reimbursement amount.',
          )

        return {
          frames: [
            {
              index: payer.frameIndex,
              data: encodeFunctionData({
                abi: internal.abi,
                functionName: 'pay',
                args: [token.frame.to!, amount],
              }),
            },
            {
              index: token.frameIndex,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [payer.frame.to!, amount],
              }),
            },
          ],
          validate: (transaction) =>
            internal.getGas(transaction) + witnessGas <= reserved,
        }
      },

      frames: [
        {
          ...gas,
          to: contractAddress,
          mode: 'verify',
          flags: 'approvePayment',
          data: encodeFunctionData({
            abi: internal.abi,
            functionName: 'pay',
            args: [token, 1n],
          }),
        },
        {
          to: token,
          mode: 'sender',
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [contractAddress, 1n],
          }),
        },
      ],

      signatures: [
        {
          ...signature,
          async sign(parameters) {
            if (
              parameters.transaction.frameContext?.afterFillHash !==
              parameters.hash
            )
              throw new BaseError(
                'Frame.fee: transaction hash does not match the finalized fee quote. Call `prepareTransactionRequest` before signing.',
              )

            const witness = await signature.sign(parameters)
            if (
              (signature.scheme === 'arbitrary' || signature.scheme === 0) &&
              (typeof witness !== 'string' ||
                Hex.size(witness) > internal.maxSignatureSize)
            )
              throw new BaseError(
                'Frame.fee: an arbitrary signature must be hex-encoded and contain at most 4096 bytes.',
              )
            return witness
          },
        },
      ],
    }
  })
}

export declare namespace fee {
  /** Local payer or a signature adapter authorized by the payer contract. */
  type Payer =
    | PrivateKeyAccount
    | (Extract<Frame.Signature, { scheme: 0 | 'arbitrary' }> & {
        verifier: Address
      })
    | (Exclude<Frame.Signature, { scheme: 0 | 'arbitrary' }> & {
        signer: Address
      })

  type Options = {
    /** Account authorized by the contract. Defaults to the transaction account. */
    payer?: Payer | undefined
    /** ERC-20 token accepted by the pricing contract. */
    token: Address
    /** Deployed, ETH-funded payer contract. */
    contractAddress: Address
  } & Pick<Frame_, 'executionGas' | 'stateGas'>
}
