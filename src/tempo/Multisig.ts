import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import {
  MultisigConfig,
  MultisigOperation,
  Transaction as ox_Transaction,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import * as multisigActions from './actions/multisig.js'
import * as OperationStore from './multisig/Operation.js'
import type * as Store from './Store.js'
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
  if (!parameters.store.compareAndSet)
    throw new RpcResponse.InvalidParamsError({
      message:
        'Multisig coordination requires a store with atomic `compareAndSet`.',
    })
  const client = createClient({
    transport: custom({
      request: ({ method, params }, options) =>
        next({ method, params }, options),
    }),
  })

  return async (request, requestOptions) => {
    if (request.method === 'multisig_getOperation') {
      const hash = request.params?.[0]
      if (typeof hash !== 'string' || !Hash.validate(hash))
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a multisig operation hash.',
        })
      const operation = await OperationStore.read(parameters.store, hash)
      return operation ? MultisigOperation.toRpc(operation) : null
    }

    if (
      request.method === 'eth_getTransactionByHash' ||
      request.method === 'eth_getTransactionReceipt'
    ) {
      const hash = request.params?.[0]
      if (typeof hash !== 'string' || !Hash.validate(hash))
        return await next(request, requestOptions)
      const operation = await OperationStore.read(parameters.store, hash)
      if (!operation || operation.type !== 'transaction')
        return await next(request, requestOptions)
      if (request.method === 'eth_getTransactionReceipt') {
        if (operation.status === 'pending') return null
        const transactionHash = await getSubmittedTransactionHash(
          parameters.store,
          operation,
        )
        if (!transactionHash) return null
        const receipt = await next(
          {
            ...request,
            params: [transactionHash],
          },
          requestOptions,
        )
        if (!receipt || typeof receipt !== 'object') return receipt
        const success =
          operation.status === 'submitting'
            ? await completeSubmission(
                parameters.store,
                operation,
                transactionHash,
              )
            : operation
        return {
          ...receipt,
          multisig: MultisigOperation.toRpc(success),
        }
      }
      if (operation.status === 'pending')
        return await pendingTransaction(client, operation)
      const transactionHash = await getSubmittedTransactionHash(
        parameters.store,
        operation,
      )
      if (!transactionHash) return await pendingTransaction(client, operation)
      const transaction = await next(
        {
          ...request,
          params: [transactionHash],
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
          ? await completeSubmission(
              parameters.store,
              operation,
              transactionHash,
            )
          : operation
      return {
        ...transaction,
        multisig: MultisigOperation.toRpc(success),
      }
    }

    if (
      request.method !== 'eth_sendRawTransaction' &&
      request.method !== 'eth_sendRawTransactionSync' &&
      request.method !== 'multisig_approveRawTransaction' &&
      request.method !== 'multisig_approveRawTransactionSync'
    )
      return await next(request, requestOptions)

    const standard =
      request.method === 'eth_sendRawTransaction' ||
      request.method === 'eth_sendRawTransactionSync'
    const serialized = request.params?.[0]
    if (!isSerializedTempoTransaction(serialized)) {
      if (standard) return await next(request, requestOptions)
      throw new RpcResponse.InvalidParamsError({
        message: 'Expected a serialized Tempo multisig transaction.',
      })
    }

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
    /** Store shared by multisig coordinators. */
    store: Store.Atomic
  }

  /** Error type for {@link handleRequest}. */
  export type ErrorType =
    | OperationStore.InvalidStoreValueError
    | OperationStore.StoreConflictError
    | RpcResponse.InvalidParamsError
}

/** Collects approvals and submits a transaction after quorum. @internal */
// biome-ignore lint/correctness/noUnusedVariables: _
async function submit(options: submit.Options) {
  const transaction = (() => {
    try {
      return deserialize(options.serialized)
    } catch (error) {
      if (
        options.method !== 'eth_sendRawTransaction' &&
        options.method !== 'eth_sendRawTransactionSync'
      )
        throw error
      return undefined
    }
  })()
  const signature = transaction?.signature
  if (!transaction || signature?.type !== 'multisig') {
    if (
      options.method === 'eth_sendRawTransaction' ||
      options.method === 'eth_sendRawTransactionSync'
    )
      return await options.next(options.request, options.requestOptions)
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a multisig transaction signature.',
    })
  }

  const { signature: _, ...unsigned } = transaction
  const envelope = TxEnvelopeTempo.from(unsigned as never)
  const serializedUnsigned = serializeUnsigned(
    envelope,
    options.serialized.startsWith(TxEnvelopeTempo.feePayerMagic),
  )
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
  const operationHash = MultisigOperation.getHash({
    account: signature.account,
    configVersion: resolved.version,
    transaction: serializedUnsigned,
    type: 'transaction',
  })
  const incoming = signature.signatures.map((signature) =>
    SignatureEnvelope.serialize(signature),
  )
  if (incoming.length === 0)
    throw new RpcResponse.InvalidParamsError({
      message: 'A multisig approval envelope must include a signature.',
    })
  const now = Date.now()
  const operation = await OperationStore.update(
    options.store,
    operationHash,
    async (existing) => {
      if (existing && existing.type !== 'transaction')
        throw new OperationStore.InvalidStoreValueError()
      if (existing?.status === 'success') return existing
      if (existing?.status === 'submitting' && existing.expiresAt! > now)
        return existing
      const existingApprovals = existing
        ? await selectApprovals({
            account: signature.account,
            client: options.client,
            config: resolved.config,
            discardInvalidNested: true,
            hash: operationHash,
            approvals: existing.approvals,
          })
        : undefined
      const approvals = await selectApprovals({
        account: signature.account,
        client: options.client,
        config: resolved.config,
        hash: operationHash,
        approvals: [...(existingApprovals?.approvals ?? []), ...incoming],
      })
      return MultisigOperation.from({
        account: signature.account,
        approvals: approvals.approvals,
        config: resolved.config,
        configVersion: resolved.version,
        createdAt: existing?.createdAt ?? now,
        hash: operationHash,
        init: !!signature.init,
        signatureCount: approvals.signatureCount,
        status: 'pending',
        threshold: approvals.threshold,
        transaction: mergeTransaction(
          existing?.transaction,
          serializedUnsigned,
        ),
        type: 'transaction',
        updatedAt: now,
        weight: approvals.weight,
      })
    },
  )

  if (operation.type !== 'transaction')
    throw new OperationStore.InvalidStoreValueError()
  if (operation.status === 'success')
    return await submittedResult(options, operation)
  if (operation.status === 'submitting' && operation.expiresAt! > Date.now())
    return await submittingResult(options, operation)
  if (operation.weight < operation.threshold)
    return pendingResult(options.method, operation)

  const submissionId = Hex.random(32)
  const timeout = options.request.params?.[1]
  const synchronous =
    options.method === 'eth_sendRawTransactionSync' ||
    options.method === 'multisig_approveRawTransactionSync'
  const leaseTtl =
    synchronous &&
    typeof timeout === 'number' &&
    Number.isSafeInteger(timeout) &&
    timeout >= 0
      ? timeout + submissionTtl
      : submissionTtl
  const claim = await OperationStore.update(
    options.store,
    operationHash,
    (current) => {
      if (!current || current.type !== 'transaction')
        throw new OperationStore.InvalidStoreValueError()
      if (current.status === 'success') return current
      if (current.status === 'submitting' && current.expiresAt! > Date.now())
        return current
      if (current.weight < current.threshold) return current
      const now = Date.now()
      return MultisigOperation.from({
        ...current,
        expiresAt: Math.min(now + leaseTtl, Number.MAX_SAFE_INTEGER),
        status: 'submitting',
        submissionId,
        updatedAt: now,
      })
    },
  )
  if (claim.type !== 'transaction')
    throw new OperationStore.InvalidStoreValueError()
  if (claim.status === 'success') return await submittedResult(options, claim)
  if (claim.status === 'pending') return pendingResult(options.method, claim)
  if (claim.submissionId !== submissionId)
    return await submittingResult(options, claim)

  const { final, transactionHash: initialTransactionHash } =
    await (async () => {
      try {
        const finalApprovals = await selectApprovals({
          account: claim.account,
          client: options.client,
          config: claim.config,
          hash: claim.hash,
          approvals: claim.approvals,
        })
        const final = MultisigOperation.serializeTransaction(claim, {
          approvals: finalApprovals.selectedApprovals,
        })
        const transactionHash = TxEnvelopeTempo.hash(
          TxEnvelopeTempo.deserialize(final) as TxEnvelopeTempo.Signed,
        )
        await OperationStore.writeSubmission(
          options.store,
          operationHash,
          submissionId,
          final,
        )
        return { final, transactionHash }
      } catch (error) {
        await releaseSubmission(options.store, operationHash, submissionId)
        throw error
      }
    })()
  let transactionHash = initialTransactionHash

  let result: unknown
  const stopLease = maintainSubmissionLease(
    options.store,
    operationHash,
    submissionId,
    leaseTtl,
  )
  let leaseStopped = false
  const stopLeaseOnce = async () => {
    if (leaseStopped) return
    leaseStopped = true
    await stopLease()
  }
  try {
    try {
      result = await options.next(
        {
          method:
            options.method === 'eth_sendRawTransaction' ||
            options.method === 'multisig_approveRawTransaction'
              ? 'eth_sendRawTransaction'
              : 'eth_sendRawTransactionSync',
          params: [final, ...(options.request.params?.slice(1) ?? [])],
        },
        options.requestOptions,
      )
      const returnedHash = getTransactionHash(result)
      if (returnedHash.toLowerCase() !== transactionHash.toLowerCase())
        transactionHash = returnedHash
    } catch (error) {
      const submittedHash = await OperationStore.readSubmission(
        options.store,
        claim,
        submissionId,
      )
      const transaction = await (async () => {
        if (!submittedHash) return null
        try {
          return await options.next({
            method: 'eth_getTransactionByHash',
            params: [submittedHash],
          })
        } catch {
          return null
        }
      })()
      await stopLeaseOnce()
      if (!submittedHash || !transaction) {
        await releaseSubmission(options.store, operationHash, submissionId)
        throw error
      }
      transactionHash = submittedHash
    }
  } finally {
    await stopLeaseOnce()
  }
  const success = await OperationStore.update(
    options.store,
    operationHash,
    (current) => {
      if (!current || current.type !== 'transaction')
        throw new OperationStore.InvalidStoreValueError()
      if (current.status === 'success') {
        if (
          current.transactionHash?.toLowerCase() !==
          transactionHash.toLowerCase()
        )
          throw new OperationStore.InvalidStoreValueError()
        return current
      }
      if (
        current.status !== 'submitting' ||
        current.submissionId !== submissionId
      )
        throw new OperationStore.InvalidStoreValueError()
      const { expiresAt: _, submissionId: __, ...operation } = current
      return MultisigOperation.from({
        ...operation,
        status: 'success',
        transactionHash,
        updatedAt: Date.now(),
      })
    },
  )
  if (success.type !== 'transaction' || success.status !== 'success')
    throw new OperationStore.InvalidStoreValueError()
  await removeSettledSubmission(options.store, operationHash, submissionId)
  if (
    options.method === 'eth_sendRawTransactionSync' &&
    result &&
    typeof result === 'object'
  )
    return { ...result, multisig: MultisigOperation.toRpc(success) }
  return await submittedResult(options, success)
}

declare namespace submit {
  /** Options for {@link submit}. */
  export type Options = {
    /** Client used to resolve initialized configurations. */
    client: ReturnType<typeof createClient>
    /** RPC submission method. */
    method:
      | 'eth_sendRawTransaction'
      | 'eth_sendRawTransactionSync'
      | 'multisig_approveRawTransaction'
      | 'multisig_approveRawTransactionSync'
    /** Downstream RPC request handler. */
    next: handleRequest.Handler
    /** Original RPC request. */
    request: handleRequest.Request
    /** Original request overrides. */
    requestOptions?: EIP1193RequestOptions | undefined
    /** Serialized Tempo transaction. */
    serialized: Hex.Hex
    /** Shared multisig store. */
    store: Store.Atomic
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

/** Selects approvals with current nested multisig configurations. */
// biome-ignore lint/correctness/noUnusedVariables: _
async function selectApprovals(options: selectApprovals.Options) {
  const select = (approvals: readonly SignatureEnvelope.Serialized[]) =>
    MultisigOperation.selectApprovals({
      account: options.account,
      approvals,
      config: options.config,
      hash: options.hash,
      resolveConfig: async ({ account }) => {
        const { owners, threshold, version } = await multisigActions.getConfig(
          options.client,
          { account },
        )
        return {
          config: MultisigConfig.from({ owners, threshold }),
          version,
        }
      },
    })
  try {
    if (!options.discardInvalidNested) return await select(options.approvals)

    const approvals = (
      await Promise.all(
        options.approvals.map(async (approval) => {
          if (SignatureEnvelope.from(approval).type !== 'multisig')
            return approval
          try {
            return (await select([approval])).approvals[0]
          } catch (error) {
            if (error instanceof MultisigOperation.InvalidApprovalError)
              return undefined
            throw error
          }
        }),
      )
    ).filter((approval) => typeof approval !== 'undefined')
    return await select(approvals)
  } catch (error) {
    if (error instanceof MultisigOperation.InvalidApprovalError)
      throw new RpcResponse.InvalidParamsError({ message: error.shortMessage })
    throw error
  }
}

declare namespace selectApprovals {
  /** Options for {@link selectApprovals}. */
  export type Options = Omit<
    MultisigOperation.selectApprovals.Options,
    'resolveConfig'
  > & {
    /** Client used to resolve nested multisig configurations. */
    client: ReturnType<typeof createClient>
    /** Discards stored nested approvals invalidated by a child configuration change. */
    discardInvalidNested?: boolean | undefined
  }
}

/** Returns an existing successful operation through the requested send method. */
async function submittedResult(
  options: submit.Options,
  operation: MultisigOperation.TransactionOperation,
) {
  if (
    options.method === 'eth_sendRawTransaction' ||
    options.method === 'multisig_approveRawTransaction'
  )
    return operation.hash
  if (options.method === 'multisig_approveRawTransactionSync')
    return MultisigOperation.toRpc(operation)
  const timeout = options.request.params?.[1]
  const deadline =
    Date.now() +
    (typeof timeout === 'number' && timeout >= 0 ? timeout : submissionTtl)
  while (true) {
    const receipt = await options.next(
      {
        method: 'eth_getTransactionReceipt',
        params: [operation.transactionHash],
      },
      options.requestOptions,
    )
    if (receipt && typeof receipt === 'object')
      return { ...receipt, multisig: MultisigOperation.toRpc(operation) }
    if (Date.now() >= deadline)
      throw new Error('Timed out while waiting for the multisig transaction.')
    await new Promise((resolve) => setTimeout(resolve, pollingInterval))
  }
}

/** Waits for the relay that owns a live submission lease. */
async function submittingResult(
  options: submit.Options,
  operation: MultisigOperation.TransactionOperation,
): Promise<unknown> {
  if (
    options.method === 'eth_sendRawTransaction' ||
    options.method === 'multisig_approveRawTransaction'
  )
    return operation.hash
  const timeout = options.request.params?.[1]
  const deadline =
    Date.now() +
    (typeof timeout === 'number' && timeout >= 0 ? timeout : submissionTtl)
  while (true) {
    const current = await OperationStore.read(options.store, operation.hash)
    if (!current || current.type !== 'transaction')
      throw new OperationStore.InvalidStoreValueError()
    if (current.status === 'success')
      return await submittedResult(options, current)
    if (current.status === 'pending' || current.expiresAt! <= Date.now())
      return await submit(options)
    if (Date.now() >= deadline) return pendingResult(options.method, current)
    await new Promise((resolve) => setTimeout(resolve, pollingInterval))
  }
}

/** Returns a pending result for an operation that has not reached quorum. */
function pendingResult(
  method: submit.Options['method'],
  operation: MultisigOperation.TransactionOperation,
) {
  if (
    method === 'eth_sendRawTransaction' ||
    method === 'multisig_approveRawTransaction'
  )
    return operation.hash
  if (method === 'multisig_approveRawTransactionSync')
    return MultisigOperation.toRpc(operation)
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
    multisig: MultisigOperation.toRpc(operation),
    status: 'pending',
    to: null,
    transactionHash: operation.hash,
    transactionIndex: null,
    type: '0x76',
  } as const
}

/** Marks a transaction as successful after a lookup proves that it was submitted. */
async function completeSubmission(
  store: Store.Atomic,
  operation: MultisigOperation.TransactionOperation,
  transactionHash: Hex.Hex,
) {
  if (operation.status !== 'submitting' || !operation.submissionId)
    throw new OperationStore.InvalidStoreValueError()
  const success = await OperationStore.update(
    store,
    operation.hash,
    (current) => {
      if (!current || current.type !== 'transaction')
        throw new OperationStore.InvalidStoreValueError()
      if (current.status === 'success') {
        if (
          current.transactionHash?.toLowerCase() !==
          transactionHash.toLowerCase()
        )
          throw new OperationStore.InvalidStoreValueError()
        return current
      }
      if (
        current.status !== 'submitting' ||
        current.submissionId !== operation.submissionId
      )
        throw new OperationStore.InvalidStoreValueError()
      const {
        expiresAt: _,
        submissionId: __,
        transactionHash: ___,
        ...value
      } = current
      return MultisigOperation.from({
        ...value,
        status: 'success',
        transactionHash,
        updatedAt: Date.now(),
      })
    },
  )
  await removeSettledSubmission(store, operation.hash, operation.submissionId)
  return success as MultisigOperation.TransactionOperation
}

/** Releases a failed submission lease without discarding collected approvals. */
async function releaseSubmission(
  store: Store.Atomic,
  hash: Hex.Hex,
  submissionId: Hex.Hex,
) {
  await OperationStore.update(store, hash, (current) => {
    if (!current || current.type !== 'transaction')
      throw new OperationStore.InvalidStoreValueError()
    if (
      current.status !== 'submitting' ||
      current.submissionId !== submissionId
    )
      return current
    const { expiresAt: _, submissionId: __, ...operation } = current
    return MultisigOperation.from({
      ...operation,
      status: 'pending',
      updatedAt: Date.now(),
    })
  })
  await OperationStore.removeSubmission(store, hash, submissionId)
}

/** Removes settled submission data without replacing a successful result with a cleanup error. */
async function removeSettledSubmission(
  store: Store.Store,
  hash: Hex.Hex,
  submissionId: Hex.Hex,
) {
  try {
    await OperationStore.removeSubmission(store, hash, submissionId)
  } catch {}
}

/** Preserves or upgrades a fee-payer envelope without removing an existing signature. */
function mergeTransaction(existing: Hex.Hex | undefined, incoming: Hex.Hex) {
  if (!existing) return incoming
  const existingTransaction = TxEnvelopeTempo.deserialize(existing as never)
  const incomingTransaction = TxEnvelopeTempo.deserialize(incoming as never)
  if (!('feePayerSignature' in incomingTransaction)) return existing
  if (incomingTransaction.feePayerSignature !== null) return incoming
  if (!('feePayerSignature' in existingTransaction)) return incoming
  return existing
}

/** Returns a pending transaction with its multisig operation. */
async function pendingTransaction(
  client: ReturnType<typeof createClient>,
  operation: MultisigOperation.TransactionOperation,
) {
  const approvals = await selectApprovals({
    account: operation.account,
    approvals: operation.approvals,
    client,
    config: operation.config,
    discardInvalidNested: true,
    hash: operation.hash,
  })
  const current =
    operation.status === 'pending'
      ? MultisigOperation.from({
          ...operation,
          approvals: approvals.approvals,
          signatureCount: approvals.signatureCount,
          threshold: approvals.threshold,
          weight: approvals.weight,
        })
      : operation
  const serialized = MultisigOperation.serializeTransaction(
    approvals.approvals.length > 0 ? current : operation,
    {
      // Keep one stored approval in the synthetic envelope when every nested
      // approval became stale. The next submission replaces it before broadcast.
      approvals:
        approvals.selectedApprovals.length > 0
          ? approvals.selectedApprovals
          : operation.approvals.slice(0, 1),
    },
  )
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
    multisig: MultisigOperation.toRpc(current),
  }
}

/** Returns the persisted transaction hash for a submitting or successful operation. */
async function getSubmittedTransactionHash(
  store: Store.Store,
  operation: MultisigOperation.TransactionOperation,
) {
  if (operation.status === 'success') return operation.transactionHash!
  if (operation.status !== 'submitting' || !operation.submissionId)
    throw new OperationStore.InvalidStoreValueError()
  return await OperationStore.readSubmission(
    store,
    operation,
    operation.submissionId,
  )
}

/** Renews a submission lease until the returned cleanup function runs. */
function maintainSubmissionLease(
  store: Store.Atomic,
  hash: Hex.Hex,
  submissionId: Hex.Hex,
  leaseTtl: number,
) {
  let active = true
  let error: unknown
  let renewal = Promise.resolve()
  const timer = setInterval(() => {
    renewal = renewal.then(async () => {
      if (!active || error) return
      try {
        const operation = await OperationStore.update(
          store,
          hash,
          (current) => {
            if (!current || current.type !== 'transaction')
              throw new OperationStore.InvalidStoreValueError()
            if (
              current.status !== 'submitting' ||
              current.submissionId !== submissionId
            )
              return current
            return MultisigOperation.from({
              ...current,
              expiresAt: Math.min(
                Date.now() + leaseTtl,
                Number.MAX_SAFE_INTEGER,
              ),
              updatedAt: Date.now(),
            })
          },
        )
        if (
          operation.type !== 'transaction' ||
          operation.status !== 'submitting' ||
          operation.submissionId !== submissionId
        )
          throw new OperationStore.InvalidStoreValueError()
      } catch (cause) {
        error = cause
      }
    })
  }, submissionTtl / 2)

  return async () => {
    active = false
    clearInterval(timer)
    await renewal
    if (error) throw error
  }
}

/** Canonically serializes an unsigned Tempo transaction. */
function serializeUnsigned(
  envelope: Omit<TxEnvelopeTempo.TxEnvelopeTempo, 'signature'>,
  feePayer: boolean,
) {
  return TxEnvelopeTempo.serialize(
    envelope,
    feePayer
      ? envelope.from
        ? { format: 'feePayer', sender: envelope.from }
        : { format: 'feePayer' }
      : {},
  )
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
