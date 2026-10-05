import type { Address } from 'abitype'
import { Hash, type Hex, RpcResponse, Signature } from 'ox'
import { type Transaction as core_Transaction, TxEnvelopeTempo } from 'ox/tempo'
import type { Local as LocalAccount } from '../../../core/Account.js'
import { type Client, create as createClient } from '../../../core/Client.js'
import { http } from '../../../core/transports/http.js'
import type * as Relay from '../../Relay.js'
import * as Transaction from 'ox/tempo/TxEnvelopeTempo'
import type * as TransactionRequest from 'ox/tempo/TransactionRequest'
import * as Request from './request.js'
import * as Utils from './utils.js'

export function create(options: Relay.feePayer.Options): Relay.Plugin {
  // Bind signing permission to the middleware invocation and its validated payload.
  const authorized = new WeakMap<Relay.Plugin.Context, Hex.Hex>()
  const allowedFeePayers = new Set(
    options.allowedFeePayers?.map((url) =>
      ExternalFeePayerUrl.normalize(url, {
        allowUnsafe: options.internal_allowUnsafeUrls,
      }),
    ),
  )
  return {
    async handleRequest(context, next) {
      const { request } = context
      if (
        ![
          'eth_fillTransaction',
          'eth_signRawTransaction',
          'eth_sendRawTransaction',
          'eth_sendRawTransactionSync',
        ].includes(request.method)
      )
        return next()
      const { client, getClient, options: requestOptions } = context
      const chainId = requestOptions.chainId

      const getTokens = (id: number) => context.resolveTokens(id)

      const record = (details: SponsorshipDetails | undefined) => {
        if (details && requestOptions.response)
          requestOptions.response.sponsorship_details = details
      }

      if (request.method !== 'eth_fillTransaction') {
        if (!options.account) {
          if (request.method === 'eth_signRawTransaction')
            throw new RpcResponse.MethodNotFoundError({
              message:
                'eth_signRawTransaction requires a fee payer to be configured on the relay. Add `Relay.feePayer({ account })` to enable transaction sponsorship.',
            })

          return next()
        }

        const serialized = request.params?.[0]
        if (
          typeof serialized !== 'string' ||
          !requestsRawSponsorship(serialized as Hex.Hex)
        )
          return next()

        const result = await handleRawTransaction({
          ...options,
          account: options.account,
          getClient,
          getFeeToken: async (id) => (await getTokens(id))[0],
          method: request.method as
            | 'eth_signRawTransaction'
            | 'eth_sendRawTransaction'
            | 'eth_sendRawTransactionSync',
          request,
        })

        record(result.sponsorshipDetails)
        return result.result
      }

      const parameters = request.params![0] as Record<string, unknown>
      const { feePayer: _, ...normalized } =
        Utils.normalizeFillTransactionRequest(parameters)

      const external =
        typeof parameters.feePayer === 'string'
          ? ExternalFeePayerUrl.normalize(parameters.feePayer, {
              allowUnsafe: options.internal_allowUnsafeUrls ?? false,
            })
          : undefined
      if (external && !allowedFeePayers.has(external))
        throw new RpcResponse.InvalidParamsError({
          message: 'External fee payer URL is not allowed.',
        })

      const wantsSponsorship =
        (!!options.account || !!external) && parameters.feePayer !== false
      if (options.account && !external) delete normalized.feePayerSignature
      const base = { ...normalized, chainId }
      if (!wantsSponsorship) return Request.fill(client, base)

      const token =
        options.feeToken ??
        (parameters.feeToken as Address | undefined) ??
        (!options.validate || external
          ? (await getTokens(chainId!))[0]
          : undefined)
      const transaction = {
        ...base,
        feePayer: true,
        ...(token ? { feeToken: token } : {}),
      }

      const prepared = isPreparedTransaction(transaction)
      const fillClient = external
        ? createClient({
            chain: client.chain,
            transport: http(external, {
              fetchOptions: { redirect: 'error' },
              retryCount: 0,
            }),
          })
        : client
      const result: Request.Result =
        prepared && !external
          ? { tx: transaction }
          : await Request.fill(
              fillClient,
              transaction,
              external ? { ...requestOptions, retryCount: 0 } : requestOptions,
            )
      const filled = Utils.normalizeTempoTransaction(result.tx)

      // Reserve intrinsic gas for larger signatures before validating and signing the candidate.
      if (
        (!prepared || parameters.feePayer !== true) &&
        filled.gas &&
        !filled.feePayerSignature
      )
        filled.gas += 20_000n
      if (token && (!external || filled.feeToken == null))
        Object.assign(filled, { feeToken: token })

      const sponsored =
        external ||
        !options.validate ||
        (await shouldSponsor({
          sender: parameters.from as Address | undefined,
          transaction: filled,
          validate: options.validate,
        }))
      if (!sponsored) return Request.fill(client, { ...base, feePayer: false })

      const defer =
        typeof normalized.multisigSimulation === 'object' &&
        normalized.multisigSimulation !== null

      const sponsor = sponsored
        ? external
          ? (result.capabilities?.sponsor ?? result.sponsor)
          : options.account
            ? getSponsor({ ...options, account: options.account })
            : undefined
        : undefined

      if (options.account && !external && !defer) {
        delete filled.signature
        if (!filled.from) filled.from = parameters.from as Address
        authorized.set(
          context,
          TxEnvelopeTempo.getFeePayerSignPayload(
            TxEnvelopeTempo.from(filled as never),
            { sender: filled.from },
          ),
        )
      }
      return {
        ...result,
        ...(sponsor ? { sponsor } : {}),
        tx: Utils.formatTempoTransaction(
          filled as core_Transaction.Transaction,
        ),
        capabilities: {
          ...result.capabilities,
          sponsored: external
            ? (result.capabilities?.sponsored ?? !!sponsor)
            : !!sponsor,
          ...(sponsor ? { sponsor } : {}),
        },
      }
    },
    async signTransaction(result, context) {
      const approved = authorized.get(context)
      authorized.delete(context)
      const parameters = context.request.params![0] as Record<string, unknown>
      if (
        !approved ||
        !options.account ||
        typeof parameters.feePayer === 'string' ||
        parameters.feePayer === false ||
        !result.capabilities?.sponsored ||
        (typeof parameters.multisigSimulation === 'object' &&
          parameters.multisigSimulation !== null)
      )
        return undefined
      const transaction = Utils.normalizeTempoTransaction(result.tx)
      const payload = TxEnvelopeTempo.getFeePayerSignPayload(
        TxEnvelopeTempo.from(transaction as never),
        { sender: (transaction.from ?? parameters.from) as Address },
      )
      if (payload !== approved)
        throw new RpcResponse.InvalidParamsError({
          message: 'Sponsored transaction changed after validation.',
        })
      const signed = await sign({
        account: options.account,
        onSponsored: options.onSponsored,
        sender: parameters.from as Address | undefined,
        transaction,
        signal: context.options.signal,
      })
      if (signed.sponsorshipDetails && context.options.response)
        context.options.response.sponsorship_details = signed.sponsorshipDetails
      const tx = Utils.formatTempoTransaction(
        signed.transaction as core_Transaction.Transaction,
      )
      return tx.feePayerSignature as Relay.Plugin.Signature
    },
  }
}

/** Checks a prepared transaction with its chain ID. Rejected fills fall back to sender payment; rejected raw submissions return a refusal. */
export type Validate = (
  request: TransactionRequest.TransactionRequest & {
    chainId?: number | Hex.Hex | undefined
  },
) => Validation | Promise<Validation>

/** A sponsorship verdict: `true` sponsors; `false` or a named reason refuses. */
export type Validation =
  | boolean
  | 'billing_past_due'
  | 'billing_required'
  | 'fee_token_unsupported'
  | 'spend_limit_exceeded'
  | 'tx_fee_limit_exceeded'

/** Details recorded for a sponsored transaction. */
export type SponsorshipDetails = {
  /** Whether Tempo subsidizes the sponsorship instead of charging the API-key organization. */
  subsidized: boolean
}

/** Refusal messages keyed by named validation reason. */
const refusalMessages = {
  billing_past_due: 'Billing past due.',
  billing_required: 'Billing required.',
  fee_token_unsupported: 'Fee token unsupported.',
  spend_limit_exceeded: 'Spend limit exceeded.',
  tx_fee_limit_exceeded: 'Transaction fee limit exceeded.',
} as const satisfies Record<Exclude<Validation, boolean>, string>

/** Returns sponsor metadata for `eth_fillTransaction` responses. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
function getSponsor(options: getSponsor.Options): getSponsor.ReturnType {
  const { account, name, url } = options
  return {
    address: account.address,
    ...(name ? { name } : {}),
    ...(url ? { url } : {}),
  }
}

declare namespace getSponsor {
  type Options = {
    /** Account used for sponsorship. */
    account: LocalAccount
    /** Optional display name. */
    name?: string | undefined
    /** Optional display URL. */
    url?: string | undefined
  }

  type ReturnType = {
    /** Sponsor address. */
    address: Address
    /** Sponsor display name. */
    name?: string | undefined
    /** Sponsor display URL. */
    url?: string | undefined
  }
}

/** Returns whether the fee payer approves a filled transaction. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function shouldSponsor(options: shouldSponsor.Options) {
  const { sender, transaction, validate } = options
  if (!validate) return true
  // Named refusal reasons collapse to false: fills fall back to an
  // unsponsored fill instead of surfacing the reason.
  const verdict = await validate({
    ...transaction,
    from: sender,
  } as TransactionRequest.TransactionRequest)
  return verdict === true
}

declare namespace shouldSponsor {
  type Options = {
    /** Sender address from the original request. */
    sender?: Address | undefined
    /** Filled transaction to validate. */
    transaction: Record<string, unknown>
    /** Optional sponsorship approval callback. */
    validate?: Validate | undefined
  }
}

/** Returns whether a raw Tempo transaction is explicitly requesting sponsorship. */
function requestsRawSponsorship(serialized: `0x${string}`) {
  if (!Utils.isSerializedTempoTransaction(serialized)) return false
  const transaction = Transaction.deserialize(serialized)
  return (
    'feePayerSignature' in transaction && transaction.feePayerSignature === null
  )
}

/** Returns `true` when a fill request already has the fields needed for sponsorship signing. */
function isPreparedTransaction(value: Record<string, unknown>) {
  return (
    typeof value.from === 'string' &&
    typeof Utils.resolveChainId(value.chainId) === 'number' &&
    typeof value.gas !== 'undefined' &&
    typeof value.nonce !== 'undefined' &&
    (typeof value.maxFeePerGas !== 'undefined' ||
      typeof value.gasPrice !== 'undefined')
  )
}

/** Signs a filled transaction as the fee payer. */
export async function sign(options: sign.Options) {
  const { account, transaction, sender } = options
  const from = (transaction.from as Address | undefined) ?? sender
  const { signature: _, ...withoutSenderSig } = transaction
  const prepared = { ...withoutSenderSig, from }

  if (!prepared.from)
    throw new RpcResponse.InvalidParamsError({
      message: 'Transaction sender must be provided before fee payer signing.',
    })
  if (!account.sign)
    throw new Error('Fee payer account cannot sign transactions.')

  const chainId = Utils.resolveChainId(transaction.chainId)
  if (chainId === undefined)
    throw new RpcResponse.InvalidParamsError({
      message: 'Transaction chainId must be provided before fee payer signing.',
    })

  const envelope = TxEnvelopeTempo.from(prepared as never)
  const signPayload = TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
    sender: prepared.from,
  })
  options.signal?.throwIfAborted()
  const feePayerSignature = Signature.from(
    await account.sign({ hash: signPayload }),
  )
  options.signal?.throwIfAborted()

  // Record the commitment before releasing the signature, since the signed fill can be broadcast through another endpoint.
  const feeToken = transaction.feeToken as Address | null | undefined
  const sponsorshipDetails = await options.onSponsored?.({
    chainId,
    ...(feeToken ? { feeToken } : {}),
    method: 'eth_fillTransaction',
    sender: prepared.from,
    signPayload,
    transaction: TxEnvelopeTempo.serialize(envelope, { feePayerSignature }),
  })

  return {
    ...(sponsorshipDetails ? { sponsorshipDetails } : {}),
    transaction: { ...prepared, feePayerSignature },
  }
}

export declare namespace sign {
  type Options = {
    /** Abort signal for the enclosing fill. */
    signal?: AbortSignal | undefined
    /** Account used as the fee payer. */
    account: LocalAccount
    /** Called once the fee payer has signed the fill. Awaited: a throw aborts the fill. */
    onSponsored?:
      | ((
          event: SponsoredEvent,
        ) => SponsorshipDetails | Promise<SponsorshipDetails | void> | void)
      | undefined
    /** Filled transaction to sign. */
    transaction: Record<string, unknown>
    /** Sender address from the original request. */
    sender?: Address | undefined
  }
}

/** Handles `eth_signRawTransaction` and broadcast methods for sponsored Tempo transactions. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function handleRawTransaction(options: handleRawTransaction.Options) {
  const {
    account,
    feeToken: sponsorFeeToken,
    getClient,
    method,
    request,
    validate,
  } = options
  const serialized = request.params?.[0] as `0x76${string}` | undefined

  if (!Utils.isSerializedTempoTransaction(serialized))
    throw new RpcResponse.InvalidParamsError({
      message: 'Only Tempo (0x76/0x78) transactions are supported.',
    })

  const transaction = Transaction.deserialize(serialized)
  // Prefer sender recovered from raw envelope; multisig finalize path supplies fallback sender.
  const sender = transaction.from ?? options.sender

  // Sponsorship only applies after sender has signed original transaction.
  if (!transaction.signature || !sender)
    throw new RpcResponse.InvalidParamsError({
      message:
        'Transaction must be signed by the sender before fee payer signing.',
    })
  if (!account.sign)
    throw new Error('Fee payer account cannot sign transactions.')

  const client = getClient(transaction.chainId)
  const feeToken_chain = (
    client.chain as { feeToken?: Address | undefined } | undefined
  )?.feeToken
  const feeToken =
    (transaction.feeToken as Address | null | undefined) ??
    sponsorFeeToken ??
    (await options.getFeeToken?.(transaction.chainId)) ??
    feeToken_chain
  const transaction_sponsored = feeToken
    ? { ...transaction, feeToken }
    : transaction

  if (validate) {
    const verdict = await validate(
      transaction_sponsored as TransactionRequest.TransactionRequest,
    )
    if (verdict !== true)
      throw new RpcResponse.InvalidParamsError(
        verdict === false
          ? { message: 'Sponsorship rejected.' }
          : { data: { code: verdict }, message: refusalMessages[verdict] },
      )
  }

  const envelope = TxEnvelopeTempo.from(transaction_sponsored as never)
  const signPayload = TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
    sender,
  })
  const feePayerSignature = Signature.from(
    await account.sign({ hash: signPayload }),
  )
  const serializedTransaction = TxEnvelopeTempo.serialize(envelope, {
    feePayerSignature,
    signature: transaction.signature,
  })

  // Awaited before any broadcast so a recording failure refuses sponsorship;
  // no sponsored transaction ever reaches the chain unrecorded.
  const sponsorshipDetails = await options.onSponsored?.({
    chainId: transaction.chainId,
    ...(feeToken ? { feeToken } : {}),
    method,
    sender,
    signPayload,
    transaction: serializedTransaction,
    transactionHash: Hash.keccak256(serializedTransaction),
  })

  // Raw-sign requests stop after fee-payer signature is added; send methods broadcast it.
  const result =
    method === 'eth_signRawTransaction'
      ? serializedTransaction
      : await client.request({
          method: method as never,
          params: [
            serializedTransaction,
            ...(request.params?.slice(1) ?? []),
          ] as never,
        })
  return { result, ...(sponsorshipDetails ? { sponsorshipDetails } : {}) }
}

declare namespace handleRawTransaction {
  type Options = {
    /** Account used as the fee payer. */
    account: LocalAccount
    /** Optional token the fee payer prefers for sponsored raw transactions. */
    feeToken?: Address | undefined
    /** Optional fee-token resolver used when the raw envelope omits `feeToken`. */
    getFeeToken?:
      | ((chainId: number) => Promise<Address | undefined>)
      | undefined
    /** Client resolver keyed by transaction `chainId`. */
    getClient: (chainId?: number) => Client
    /** Raw transaction method to handle. */
    method:
      | 'eth_signRawTransaction'
      | 'eth_sendRawTransaction'
      | 'eth_sendRawTransactionSync'
    /** Called once the fee payer has signed, before any broadcast. Awaited: a throw aborts the request. */
    onSponsored?:
      | ((
          event: SponsoredEvent,
        ) => SponsorshipDetails | Promise<SponsorshipDetails | void> | void)
      | undefined
    /** Incoming JSON-RPC request. */
    request: { params?: readonly unknown[] | undefined }
    /** Sender address to use if it cannot be recovered from the raw envelope. */
    sender?: Address | undefined
    /** Optional sponsorship approval callback. */
    validate?: Validate | undefined
  }
}

/** Facts of one sponsorship commitment, emitted at fee-payer signing time. */
export type SponsoredEvent = {
  /** Chain the sponsored transaction targets. */
  chainId: number
  /** Fee token the sponsorship resolved, when known. */
  feeToken?: Address | undefined
  /** Method that triggered sponsorship: a fill (intent) or a raw submission. */
  method:
    | 'eth_fillTransaction'
    | 'eth_signRawTransaction'
    | 'eth_sendRawTransaction'
    | 'eth_sendRawTransactionSync'
  /** Transaction sender. */
  sender: Address
  /** Fee-payer sign payload: a stable identity for the sponsored envelope. */
  signPayload: Hex.Hex
  /** Serialized sponsored transaction (sender-unsigned for fill intents). */
  transaction: Hex.Hex
  /** Transaction hash (keccak256 of the signed envelope); absent for fill intents, whose senders have not signed yet. */
  transactionHash?: Hex.Hex | undefined
}

export namespace ExternalFeePayerUrl {
  type Options = {
    /** Whether to allow non-HTTPS or local/private external fee payer URLs. */
    allowUnsafe?: boolean | undefined
  }

  /** Normalizes external fee-payer relay URLs before forwarding fill payloads. */
  export function normalize(value: string, options: Options = {}): string {
    let url: URL
    try {
      url = new URL(value)
    } catch {
      throw new RpcResponse.InvalidParamsError({
        message: 'Invalid fee payer URL.',
      })
    }

    const allowUnsafe = options.allowUnsafe === true
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new RpcResponse.InvalidParamsError({
        message: 'Invalid fee payer URL protocol.',
      })
    if (!allowUnsafe && url.protocol !== 'https:')
      throw new RpcResponse.InvalidParamsError({
        message: 'Invalid fee payer URL protocol.',
      })
    if (!allowUnsafe && isUnsafeHostname(url.hostname))
      throw new RpcResponse.InvalidParamsError({
        message: 'Invalid fee payer URL host.',
      })

    url.username = ''
    url.password = ''
    url.hash = ''
    return url.href
  }

  function isUnsafeHostname(hostname: string): boolean {
    const host = normalizeHostname(hostname)
    if (host === 'localhost' || host.endsWith('.localhost')) return true
    const ipv4 = parseIpv4(host)
    if (ipv4) return isUnsafeIpv4(ipv4)
    if (!host.includes(':')) return false
    const ipv6 = parseIpv6(host)
    if (!ipv6) return true
    return isUnsafeIpv6(ipv6)
  }

  function normalizeHostname(hostname: string): string {
    return hostname
      .toLowerCase()
      .replace(/^\[|\]$/g, '')
      .split('%')[0]!
  }

  function parseIpv4(
    value: string,
  ): [number, number, number, number] | undefined {
    const parts = value.split('.')
    if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part)))
      return undefined
    const numbers = parts.map((part) => Number(part))
    if (
      numbers.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
    )
      return undefined
    return numbers as [number, number, number, number]
  }

  function isUnsafeIpv4(parts: [number, number, number, number]): boolean {
    const [a, b] = parts
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    return a >= 224
  }

  function parseIpv6(
    value: string,
  ):
    | [number, number, number, number, number, number, number, number]
    | undefined {
    const halves = value.split('::')
    if (halves.length > 2) return undefined

    const left = halves[0] ? halves[0].split(':') : []
    const right = halves[1] ? halves[1].split(':') : []
    const missing = halves.length === 2 ? 8 - left.length - right.length : 0
    if (missing < 0) return undefined

    const parts = [...left, ...Array(missing).fill('0'), ...right]
    if (parts.length !== 8) return undefined

    const numbers = parts.map((part) =>
      /^[\da-f]{1,4}$/i.test(part) ? Number.parseInt(part, 16) : NaN,
    )
    if (
      numbers.some(
        (part) => !Number.isInteger(part) || part < 0 || part > 0xffff,
      )
    )
      return undefined
    return numbers as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
  }

  function isUnsafeIpv6(
    parts: [number, number, number, number, number, number, number, number],
  ) {
    const [a] = parts
    if (parts.every((part) => part === 0)) return true
    if (parts.slice(0, 7).every((part) => part === 0) && parts[7] === 1)
      return true
    if ((a & 0xfe00) === 0xfc00) return true
    if ((a & 0xffc0) === 0xfe80) return true
    if ((a & 0xffc0) === 0xfec0) return true
    if ((a & 0xff00) === 0xff00) return true

    const ipv4 = ipv4FromIpv6(parts)
    return ipv4 ? isUnsafeIpv4(ipv4) : false
  }

  function ipv4FromIpv6(
    parts: [number, number, number, number, number, number, number, number],
  ): [number, number, number, number] | undefined {
    const mapped =
      parts.slice(0, 5).every((part) => part === 0) && parts[5] === 0xffff
    const compatible = parts.slice(0, 6).every((part) => part === 0)
    if (!mapped && !compatible) return undefined
    return [parts[6]! >> 8, parts[6]! & 0xff, parts[7]! >> 8, parts[7]! & 0xff]
  }
}
