import type { Address } from 'abitype'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import {
  MultisigConfig,
  Transaction as ox_Transaction,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import * as multisigActions from './actions/multisig.js'
import * as Operation from './multisig/Operation.js'
import type * as Storage from './Storage.js'
import * as Transaction from './Transaction.js'

const submissionTtl = 30_000
const pollingInterval = 100

/**
 * Creates an RPC request handler that coordinates native multisig approvals.
 *
 * @param next - Downstream RPC request handler.
 * @param parameters - Handler parameters.
 * @returns The multisig-aware RPC request handler.
 */
export function handleRequest(
  next: handleRequest.Handler,
  parameters: handleRequest.Parameters,
): handleRequest.Handler {
  const client = createClient({
    transport: custom({
      request: ({ method, params }, options) =>
        next({ method, params }, options),
    }),
  })

  return async (request, requestOptions) => {
    if (
      request.method === 'eth_getTransactionByHash' ||
      request.method === 'eth_getTransactionReceipt'
    ) {
      const hash = request.params?.[0]
      if (typeof hash !== 'string' || !Hash.validate(hash))
        return await next(request, requestOptions)
      const operation = await Operation.read(parameters.store, hash)
      if (!operation || operation.keyAuthorization)
        return await next(request, requestOptions)
      if (request.method === 'eth_getTransactionReceipt') {
        if (operation.status === 'pending') return null
        const receipt = await next(
          {
            ...request,
            params: [operation.transactionHash],
          },
          requestOptions,
        )
        if (!receipt || typeof receipt !== 'object') return receipt
        const success =
          operation.status === 'submitting'
            ? await completeSubmission(parameters.store, operation)
            : operation
        return {
          ...receipt,
          multisig: Operation.serialize(success),
        }
      }
      if (operation.status === 'pending')
        return await pendingTransaction(client, operation)
      const transaction = await next(
        {
          ...request,
          params: [operation.transactionHash],
        },
        requestOptions,
      )
      if (!transaction || typeof transaction !== 'object') {
        if (operation.status === 'submitting')
          return await pendingTransaction(client, operation)
        return transaction
      }
      const success =
        operation.status === 'submitting'
          ? await completeSubmission(parameters.store, operation)
          : operation
      return {
        ...transaction,
        multisig: Operation.serialize(success),
      }
    }

    if (
      request.method !== 'eth_sendRawTransaction' &&
      request.method !== 'eth_sendRawTransactionSync'
    )
      return await next(request, requestOptions)

    const serialized = request.params?.[0]
    if (!isSerializedTempoTransaction(serialized))
      return await next(request, requestOptions)

    return await submit({
      client,
      method: request.method,
      next,
      request,
      requestOptions,
      serialized,
      store: parameters.store,
    })
  }
}

export declare namespace handleRequest {
  /** RPC request handler. */
  export type Handler = (
    request: Request,
    options?: EIP1193RequestOptions | undefined,
  ) => Promise<unknown>

  /** RPC request passed to a handler. */
  export type Request = {
    /** RPC method name. */
    method: string
    /** RPC method parameters. */
    params?: readonly unknown[] | undefined
  }

  /** Parameters for {@link handleRequest}. */
  export type Parameters = {
    /** Storage shared by multisig coordinators. */
    store: Storage.Storage
  }
}

/** Collects approvals and submits a transaction after quorum. @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
async function submit(options: submit.Options) {
  const transaction = (() => {
    try {
      return deserialize(options.serialized)
    } catch {
      return undefined
    }
  })()
  const signature = transaction?.signature
  if (!transaction || signature?.type !== 'multisig')
    return await options.next(
      {
        method: options.method,
        params: options.request.params,
      },
      options.requestOptions,
    )

  const { signature: _, ...unsigned } = transaction
  const envelope = TxEnvelopeTempo.from(unsigned as never)
  const payload = TxEnvelopeTempo.getSignPayload(envelope)
  const resolved = await (async () => {
    if (signature.init) return resolveInitialConfig(signature)
    const { owners, threshold, version } = await multisigActions.getConfig(
      options.client,
      { account: signature.account },
    )
    return {
      config: MultisigConfig.from({ owners, threshold }),
      version,
    }
  })()
  const operationHash = MultisigConfig.getSignPayload({
    account: signature.account,
    payload,
    version: resolved.version,
  })
  const incoming = signature.signatures.map((signature) =>
    SignatureEnvelope.serialize(signature),
  )
  if (incoming.length === 0)
    throw new RpcResponse.InvalidParamsError({
      message: 'A multisig approval envelope must include a signature.',
    })
  const now = Date.now()
  const operation = await Operation.update(
    options.store,
    operationHash,
    async (existing) => {
      if (existing?.keyAuthorization)
        throw new Operation.InvalidStoreValueError()
      if (existing?.status === 'success') return existing
      if (
        existing?.status === 'submitting' &&
        existing.submissionExpiresAt > now
      )
        return existing
      const existingApprovals = existing
        ? await selectApprovals({
            account: signature.account,
            client: options.client,
            config: resolved.config,
            ignoreInvalidNested: true,
            path: [signature.account.toLowerCase()],
            payload,
            signatures: existing.approvals,
            version: resolved.version,
          })
        : undefined
      const approvals = await selectApprovals({
        account: signature.account,
        client: options.client,
        config: resolved.config,
        path: [signature.account.toLowerCase()],
        payload,
        signatures: [...(existingApprovals?.all ?? []), ...incoming],
        version: resolved.version,
      })
      return Operation.from({
        account: signature.account,
        approvals: approvals.all,
        config: resolved.config,
        createdAt: existing?.createdAt ?? now,
        hash: operationHash,
        init: !!signature.init,
        signatures: approvals.selected.length,
        status: 'pending',
        threshold: approvals.threshold,
        transaction: mergeTransaction(existing?.transaction, envelope),
        updatedAt: now,
        version: resolved.version,
        weight: approvals.weight,
      })
    },
  )

  if (operation.keyAuthorization) throw new Operation.InvalidStoreValueError()
  if (operation.status === 'success')
    return await submittedResult(options, operation)
  if (
    operation.status === 'submitting' &&
    operation.submissionExpiresAt > Date.now()
  )
    return await submittingResult(options, operation)
  if (operation.weight < operation.threshold)
    return pendingResult(options.method, operation)

  const finalApprovals = await selectApprovals({
    account: operation.account,
    client: options.client,
    config: operation.config,
    path: [operation.account.toLowerCase()],
    payload: TxEnvelopeTempo.getSignPayload(operation.transaction),
    signatures: operation.approvals,
    version: operation.version,
  })
  const final = serializeFinal({
    account: operation.account,
    initConfig: operation.init ? operation.config : null,
    signatures: finalApprovals.selected,
    transaction: operation.transaction,
    version: operation.version,
  })
  const transactionHash = TxEnvelopeTempo.hash(deserialize(final) as never)
  const submissionId = Hex.random(32)
  const claim = await Operation.update(
    options.store,
    operationHash,
    (current) => {
      if (!current || current.keyAuthorization)
        throw new Operation.InvalidStoreValueError()
      if (current.status === 'success') return current
      if (
        current.status === 'submitting' &&
        current.submissionExpiresAt > Date.now()
      )
        return current
      return Operation.from({
        ...current,
        status: 'submitting',
        submissionExpiresAt: Date.now() + submissionTtl,
        submissionId,
        transactionHash,
        updatedAt: Date.now(),
      })
    },
  )
  if (claim.keyAuthorization) throw new Operation.InvalidStoreValueError()
  if (claim.status === 'success')
    return await submittedResult(options, claim as Operation.TransactionSuccess)
  if (claim.status !== 'submitting')
    throw new Operation.InvalidStoreValueError()
  if (claim.submissionId !== submissionId)
    return await submittingResult(
      options,
      claim as Operation.TransactionSubmitting,
    )

  let result: unknown
  try {
    result = await options.next(
      {
        method: options.method,
        params: [final, ...(options.request.params?.slice(1) ?? [])],
      },
      options.requestOptions,
    )
    if (
      getTransactionHash(result).toLowerCase() !== transactionHash.toLowerCase()
    )
      throw new Error(
        'Multisig broadcast returned an unexpected transaction hash.',
      )
  } catch (error) {
    const transaction = await options
      .next(
        { method: 'eth_getTransactionByHash', params: [transactionHash] },
        options.requestOptions,
      )
      .catch(() => null)
    if (!transaction) {
      await releaseSubmission(options.store, operationHash, submissionId)
      throw error
    }
  }
  const success = await Operation.update(
    options.store,
    operationHash,
    (current) => {
      if (!current) throw new Operation.InvalidStoreValueError()
      if (current.status === 'success') return current
      if (
        current.status !== 'submitting' ||
        current.submissionId !== submissionId
      )
        throw new Operation.InvalidStoreValueError()
      const { submissionExpiresAt: _, submissionId: __, ...operation } = current
      return Operation.from({
        ...operation,
        status: 'success',
        transactionHash,
        updatedAt: Date.now(),
      })
    },
  )
  if (success.keyAuthorization || success.status !== 'success')
    throw new Operation.InvalidStoreValueError()
  if (options.method === 'eth_sendRawTransaction') return success.hash
  if (result && typeof result === 'object')
    return { ...result, multisig: Operation.serialize(success) }
  return await submittedResult(options, success as Operation.TransactionSuccess)
}

declare namespace submit {
  /** Options for {@link submit}. */
  export type Options = {
    /** Client used to resolve initialized configurations. */
    client: ReturnType<typeof createClient>
    /** RPC submission method. */
    method: 'eth_sendRawTransaction' | 'eth_sendRawTransactionSync'
    /** Downstream RPC request handler. */
    next: handleRequest.Handler
    /** Original RPC request. */
    request: handleRequest.Request
    /** Original request overrides. */
    requestOptions?: EIP1193RequestOptions | undefined
    /** Serialized Tempo transaction. */
    serialized: Hex.Hex
    /** Shared multisig store. */
    store: Storage.Storage
  }
}

/** Deserializes a Tempo transaction or throws an RPC parameter error. */
function deserialize(serialized: Hex.Hex) {
  try {
    return Transaction.deserialize(
      serialized as Transaction.TransactionSerializedTempo,
    )
  } catch {
    throw new RpcResponse.InvalidParamsError({
      message: 'Invalid serialized Tempo transaction.',
    })
  }
}

/** Resolves and validates a bootstrap multisig configuration. */
function resolveInitialConfig(signature: SignatureEnvelope.Multisig) {
  const config = MultisigConfig.from(signature.init!)
  if (
    MultisigConfig.getAddress(config).toLowerCase() !==
    signature.account.toLowerCase()
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Bootstrap multisig config does not match the multisig account.',
    })
  return { config, version: 0n }
}

/** Validates, deduplicates, and selects owner approvals. @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
async function selectApprovals(options: selectApprovals.Options) {
  const digest = MultisigConfig.getSignPayload({
    account: options.account,
    payload: options.payload,
    version: options.version,
  })
  const owners = new Map(
    options.config.owners.map((owner) => [
      owner.owner.toLowerCase(),
      { address: owner.owner, weight: Number(owner.weight) },
    ]),
  )
  const groups = new Map<string, selectApprovals.Group>()
  for (const serialized of options.signatures) {
    const signature = SignatureEnvelope.from(serialized)
    if (signature.type === 'keychain')
      throw new RpcResponse.InvalidParamsError({
        message: 'Keychain signatures cannot approve a multisig operation.',
      })
    const address =
      signature.type === 'multisig'
        ? signature.account
        : SignatureEnvelope.extractAddress({ payload: digest, signature })
    const owner = owners.get(address.toLowerCase())
    if (!owner)
      throw new RpcResponse.InvalidParamsError({
        message: `Signature from non-owner ${address}.`,
      })
    const key = address.toLowerCase()
    const group = groups.get(key)
    if (group) group.signatures.push(signature)
    else
      groups.set(key, {
        address: owner.address,
        signatures: [signature],
        weight: owner.weight,
      })
  }

  const approvals: selectApprovals.Approval[] = []
  const stored: selectApprovals.StoredApproval[] = []
  for (const group of groups.values()) {
    const nested = group.signatures.filter(
      (signature) => signature.type === 'multisig',
    )
    if (nested.length > 0) {
      if (nested.length !== group.signatures.length)
        throw new RpcResponse.InvalidParamsError({
          message: `Conflicting signature types from owner ${group.address}.`,
        })
      if (
        options.path.length >= 2 ||
        options.path.includes(group.address.toLowerCase())
      )
        throw new RpcResponse.InvalidParamsError({
          message: `Invalid nested multisig owner ${group.address}.`,
        })
      const { owners, threshold, version } = await multisigActions.getConfig(
        options.client,
        { account: group.address },
      )
      const selected = await (async () => {
        try {
          return await selectApprovals({
            account: group.address,
            client: options.client,
            config: MultisigConfig.from({ owners, threshold }),
            path: [...options.path, group.address.toLowerCase()],
            payload: digest,
            signatures: nested.flatMap((signature) =>
              signature.signatures.map((approval) =>
                SignatureEnvelope.serialize(approval),
              ),
            ),
            version,
          })
        } catch (error) {
          if (options.ignoreInvalidNested) return undefined
          throw error
        }
      })()
      if (!selected) continue
      stored.push({
        address: group.address,
        signature: SignatureEnvelope.serialize(
          SignatureEnvelope.from({
            account: group.address,
            signatures: selected.all.map((signature) =>
              SignatureEnvelope.from(signature),
            ),
          }),
        ),
      })
      if (selected.weight >= selected.threshold)
        approvals.push({
          address: group.address,
          signature: SignatureEnvelope.serialize(
            SignatureEnvelope.from({
              account: group.address,
              signatures: selected.selected.map((signature) =>
                SignatureEnvelope.from(signature),
              ),
            }),
          ),
          weight: group.weight,
        })
      continue
    }

    const signatures = group.signatures.map((signature) => {
      if (
        !SignatureEnvelope.verify(signature, {
          address: group.address,
          payload: digest,
        })
      )
        throw new RpcResponse.InvalidParamsError({
          message: `Invalid signature from owner ${group.address}.`,
        })
      return SignatureEnvelope.serialize(signature)
    })
    const signature = signatures.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    )[0]!
    approvals.push({
      address: group.address,
      signature,
      weight: group.weight,
    })
    stored.push({ address: group.address, signature })
  }

  const ranked = approvals.sort(
    (a, b) =>
      b.weight - a.weight ||
      a.address.toLowerCase().localeCompare(b.address.toLowerCase()),
  )
  const selected: typeof ranked = []
  let weight = 0
  for (const approval of ranked.slice(0, MultisigConfig.maxSignatures)) {
    if (weight >= Number(options.config.threshold)) break
    selected.push(approval)
    weight += approval.weight
  }
  selected.sort((a, b) =>
    a.address.toLowerCase().localeCompare(b.address.toLowerCase()),
  )
  const all = stored
    .sort((a, b) =>
      a.address.toLowerCase().localeCompare(b.address.toLowerCase()),
    )
    .map((approval) => approval.signature)

  return {
    all,
    selected: selected.map((approval) => approval.signature),
    threshold: Number(options.config.threshold),
    weight,
  }
}

declare namespace selectApprovals {
  /** Validated owner approval. */
  export type Approval = {
    /** Owner address. */
    address: Address
    /** Serialized owner signature. */
    signature: Hex.Hex
    /** Owner weight. */
    weight: number
  }

  /** Approvals submitted for one configured owner. */
  export type Group = {
    /** Configured owner address. */
    address: Address
    /** Submitted signatures that resolve to the owner. */
    signatures: SignatureEnvelope.SignatureEnvelope[]
    /** Configured owner weight. */
    weight: number
  }

  /** Approval retained in the store. */
  export type StoredApproval = {
    /** Configured owner address. */
    address: Address
    /** Serialized primitive or normalized nested approval. */
    signature: Hex.Hex
  }

  /** Options for {@link selectApprovals}. */
  export type Options = {
    /** Multisig account address. */
    account: Address
    /** Client used to resolve nested multisig configurations. */
    client: ReturnType<typeof createClient>
    /** Multisig owner configuration. */
    config: MultisigConfig.Config
    /** Discards stored nested approvals that no longer match the current child configuration. */
    ignoreInvalidNested?: boolean | undefined
    /** Multisig accounts traversed while validating nested approvals. */
    path: readonly string[]
    /** Unsigned transaction signing payload. */
    payload: Hex.Hex
    /** Serialized owner approvals. */
    signatures: readonly Hex.Hex[]
    /** Multisig configuration version. */
    version: bigint
  }
}

/** Serializes a transaction with its selected approvals. @internal */
function serializeFinal(options: serializeFinal.Options) {
  const envelope = TxEnvelopeTempo.from(options.transaction)
  const signatures = SignatureEnvelope.sortMultisigApprovals({
    account: options.account,
    payload: TxEnvelopeTempo.getSignPayload(envelope),
    signatures: options.signatures.map((signature) =>
      SignatureEnvelope.from(signature),
    ),
    version: options.version,
  })
  const signature = options.initConfig
    ? SignatureEnvelope.from({
        init: true,
        initialConfig: options.initConfig,
        signatures,
      })
    : SignatureEnvelope.from({ account: options.account, signatures })
  return TxEnvelopeTempo.serialize(envelope, {
    ...('feePayerSignature' in options.transaction
      ? { feePayerSignature: options.transaction.feePayerSignature as never }
      : {}),
    signature,
  })
}

/** Returns an existing successful operation through the requested send method. */
async function submittedResult(
  options: submit.Options,
  operation: Operation.TransactionSuccess,
) {
  if (options.method === 'eth_sendRawTransaction') return operation.hash
  const deadline = Date.now() + getTimeout(options.request)
  while (true) {
    const receipt = await options.next(
      {
        method: 'eth_getTransactionReceipt',
        params: [operation.transactionHash],
      },
      options.requestOptions,
    )
    if (receipt && typeof receipt === 'object')
      return { ...receipt, multisig: Operation.serialize(operation) }
    if (Date.now() >= deadline)
      throw new Error('Timed out while waiting for the multisig transaction.')
    await delay(pollingInterval)
  }
}

/** Waits for the coordinator that owns a live submission lease. */
async function submittingResult(
  options: submit.Options,
  operation: Operation.TransactionSubmitting,
): Promise<unknown> {
  if (options.method === 'eth_sendRawTransaction') return operation.hash
  const deadline = Date.now() + getTimeout(options.request)
  while (true) {
    const current = await Operation.read(options.store, operation.hash)
    if (!current || current.keyAuthorization)
      throw new Operation.InvalidStoreValueError()
    if (current.status === 'success')
      return await submittedResult(options, current)
    if (
      current.status === 'pending' ||
      current.submissionExpiresAt <= Date.now()
    )
      return await submit(options)
    if (Date.now() >= deadline) return pendingResult(options.method, current)
    await delay(pollingInterval)
  }
}

/** Returns a pending result for an operation that has not reached quorum. */
function pendingResult(
  method: submit.Options['method'],
  operation: Operation.TransactionPending | Operation.TransactionSubmitting,
) {
  if (method === 'eth_sendRawTransaction') return operation.hash
  return {
    blockHash: null,
    blockNumber: null,
    contractAddress: null,
    cumulativeGasUsed: null,
    effectiveGasPrice: null,
    from: operation.account,
    gasUsed: null,
    logs: [],
    logsBloom: null,
    multisig: Operation.serialize(operation),
    status: 'pending',
    to: null,
    transactionHash: operation.hash,
    transactionIndex: null,
    type: '0x76',
  } as const
}

/** Marks a transaction as successful after a lookup proves that it was submitted. */
async function completeSubmission(
  store: Storage.Storage,
  operation: Operation.TransactionSubmitting,
) {
  return (await Operation.update(store, operation.hash, (current) => {
    if (!current || current.keyAuthorization)
      throw new Operation.InvalidStoreValueError()
    if (current.status === 'success') return current
    const value = (() => {
      if (current.status === 'pending') return current
      const { submissionExpiresAt: _, submissionId: __, ...value } = current
      return value
    })()
    return Operation.from({
      ...value,
      status: 'success',
      transactionHash: operation.transactionHash,
      updatedAt: Date.now(),
    })
  })) as Operation.TransactionSuccess
}

/** Releases a failed submission lease without discarding collected approvals. */
async function releaseSubmission(
  store: Storage.Storage,
  hash: Hex.Hex,
  submissionId: Hex.Hex,
) {
  await Operation.update(store, hash, (current) => {
    if (!current || current.keyAuthorization)
      throw new Operation.InvalidStoreValueError()
    if (
      current.status !== 'submitting' ||
      current.submissionId !== submissionId
    )
      return current
    const {
      submissionExpiresAt: _,
      submissionId: __,
      transactionHash: ___,
      ...operation
    } = current
    return Operation.from({
      ...operation,
      status: 'pending',
      updatedAt: Date.now(),
    })
  })
}

/** Preserves or upgrades a fee-payer envelope without removing an existing signature. */
function mergeTransaction(
  existing: Operation.Transaction['transaction'] | undefined,
  incoming: Operation.Transaction['transaction'],
) {
  if (!existing) return incoming
  if (!('feePayerSignature' in incoming)) return existing
  if (incoming.feePayerSignature !== null) return incoming
  if (!('feePayerSignature' in existing)) return incoming
  return existing
}

/** Returns the synchronous RPC timeout. */
function getTimeout(request: handleRequest.Request) {
  const timeout = request.params?.[1]
  return typeof timeout === 'number' && timeout >= 0 ? timeout : submissionTtl
}

/** Waits before polling shared operation state again. */
function delay(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

/** Returns a pending transaction with its multisig operation. */
async function pendingTransaction(
  client: ReturnType<typeof createClient>,
  operation: Operation.TransactionPending | Operation.TransactionSubmitting,
) {
  const approvals = await selectApprovals({
    account: operation.account,
    client,
    config: operation.config,
    ignoreInvalidNested: true,
    path: [operation.account.toLowerCase()],
    payload: TxEnvelopeTempo.getSignPayload(operation.transaction),
    signatures: operation.approvals,
    version: operation.version,
  })
  const serialized = serializeFinal({
    account: operation.account,
    initConfig: operation.init ? operation.config : null,
    // Keep one stored approval in the synthetic envelope when every nested
    // approval became stale. The next submission replaces it before broadcast.
    signatures:
      approvals.selected.length > 0
        ? approvals.selected
        : operation.approvals.slice(0, 1),
    transaction: operation.transaction,
    version: operation.version,
  })
  const transaction = deserialize(serialized)
  return {
    ...ox_Transaction.toRpc(
      {
        ...transaction,
        blockHash: null,
        blockNumber: null,
        from: operation.account,
        hash: operation.hash,
        transactionIndex: null,
      } as never,
      { pending: true },
    ),
    multisig: Operation.serialize(operation),
  }
}

declare namespace serializeFinal {
  /** Options for {@link serializeFinal}. */
  export type Options = {
    /** Multisig account address. */
    account: Address
    /** Bootstrap configuration, when present. */
    initConfig: MultisigConfig.Config | null
    /** Serialized owner approvals. */
    signatures: readonly Hex.Hex[]
    /** Unsigned Tempo transaction. */
    transaction: Omit<TxEnvelopeTempo.TxEnvelopeTempo, 'signature'>
    /** Multisig configuration version. */
    version: bigint
  }
}

/** Extracts a transaction hash from an RPC submission result. */
function getTransactionHash(result: unknown): Hex.Hex {
  if (typeof result === 'string' && Hash.validate(result)) return result
  if (
    result &&
    typeof result === 'object' &&
    'transactionHash' in result &&
    typeof result.transactionHash === 'string' &&
    Hash.validate(result.transactionHash)
  )
    return result.transactionHash
  throw new Error('Expected transaction hash in multisig broadcast result.')
}

/** Checks whether a value is a serialized Tempo transaction. */
function isSerializedTempoTransaction(value: unknown): value is Hex.Hex {
  return (
    typeof value === 'string' &&
    (value.startsWith('0x76') || value.startsWith('0x78'))
  )
}

/** Multisig operation utilities. */
// biome-ignore lint/performance/noBarrelFile: namespace module
export * as Operation from './multisig/Operation.js'
