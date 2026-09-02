import type { Address } from 'abitype'
import * as Address_ from 'ox/Address'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import {
  KeyAuthorization,
  MultisigConfig,
  MultisigOperation,
  Transaction as ox_Transaction,
  SignatureEnvelope,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { getBlockNumber } from '../actions/public/getBlockNumber.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import { decodeFunctionData } from '../utils/abi/decodeFunctionData.js'
import { isAddressEqual } from '../utils/address/isAddressEqual.js'
import * as Abis from './Abis.js'
import * as Addresses from './Addresses.js'
import { getConfigCommitment } from './actions/multisig.js'
import * as ConfigStore from './multisig/Config.js'
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
  return async (request, requestOptions_) => {
    const requestOptions = await resolveRequestOptions({
      request,
      requestOptions: requestOptions_,
      store: parameters.store,
    })
    const client = createClient({
      transport: custom({
        request: ({ method, params }, options) =>
          next({ method, params }, { ...requestOptions, ...options }),
      }),
    })

    if (request.method === 'multisig_getConfig') {
      const value = request.params?.[0]
      const address =
        value && typeof value === 'object' && 'address' in value
          ? value.address
          : undefined
      if (
        typeof address !== 'string' ||
        !Address_.validate(address) ||
        Hex.toBigInt(address) === 0n
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a multisig account address.',
        })
      const blockNumber = await getBlockNumber(client, { cacheTime: 0 })
      const commitment = await getConfigCommitment(client, {
        account: address,
        blockNumber,
      })
      const config = await ConfigStore.read(parameters.store, {
        address,
        commitment,
      })
      if (!config) return null
      return MultisigConfig.toRpc(config)
    }

    if (request.method === 'multisig_getOperation') {
      const hash = request.params?.[0]
      if (typeof hash !== 'string' || !Hash.validate(hash))
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a multisig operation hash.',
        })
      const operation = await OperationStore.read(parameters.store, hash)
      return operation ? MultisigOperation.toRpc(operation) : null
    }

    if (request.method === 'multisig_approveKeyAuthorization')
      return await approveKeyAuthorization({
        client,
        request,
        store: parameters.store,
      })

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
        return await toTransaction(client, operation, parameters.store)
      const transactionHash = await getSubmittedTransactionHash(
        parameters.store,
        operation,
      )
      if (!transactionHash)
        return await toTransaction(client, operation, parameters.store)
      const transaction = await next(
        {
          ...request,
          params: [transactionHash],
        },
        requestOptions,
      )
      if (!transaction || typeof transaction !== 'object')
        return await toTransaction(client, operation, parameters.store)
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
    options?: RequestOptions | undefined,
  ) => Promise<unknown>

  /** RPC request passed to a handler. */
  export type Request = {
    /** RPC method name. */
    method: string
    /** RPC method parameters. */
    params?: readonly unknown[] | undefined
  }

  /** Options for one handled request. */
  export type RequestOptions = EIP1193RequestOptions & {
    /** Chain selected by the caller or inferred from the multisig request. */
    chainId?: number | undefined
  }

  /** Parameters for {@link handleRequest}. */
  export type Parameters = {
    /** Store shared by multisig coordinators. */
    store: Store.Atomic
  }

  /** Error type for {@link handleRequest}. */
  export type ErrorType =
    | ConfigStore.InvalidStoreValueError
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
  const blockNumber = await getBlockNumber(options.client, { cacheTime: 0 })
  const config = MultisigConfig.from(signature.config)
  const configCommitment = await validateConfig({
    account: signature.account,
    blockNumber,
    client: options.client,
    config,
  })
  const operationHash = MultisigOperation.getHash({
    account: signature.account,
    config,
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
  const expiredSubmissionIds = new Set<Hex.Hex>()
  const operation = await OperationStore.update(
    options.store,
    operationHash,
    async (existing) => {
      if (existing && existing.type !== 'transaction')
        throw new OperationStore.InvalidStoreValueError()
      if (existing?.status === 'success') return existing
      if (existing?.status === 'submitting' && existing.expiresAt! > now)
        return existing
      if (existing?.status === 'submitting')
        expiredSubmissionIds.add(existing.submissionId!)
      const existingApprovals = existing
        ? await selectApprovals({
            account: signature.account,
            client: options.client,
            config,
            discardInvalidNested: true,
            hash: operationHash,
            approvals: existing.approvals,
            blockNumber,
            store: options.store,
          })
        : undefined
      const approvals = await selectApprovals({
        account: signature.account,
        client: options.client,
        config,
        hash: operationHash,
        approvals: [...(existingApprovals?.approvals ?? []), ...incoming],
        blockNumber,
        store: options.store,
      })
      return MultisigOperation.from({
        account: signature.account,
        approvals: approvals.approvals,
        config,
        createdAt: existing?.createdAt ?? now,
        hash: operationHash,
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

  for (const submissionId of expiredSubmissionIds) {
    if (
      operation.status === 'submitting' &&
      operation.submissionId?.toLowerCase() === submissionId.toLowerCase()
    )
      continue
    await removeSettledSubmission(options.store, operationHash, submissionId)
  }

  await ConfigStore.write(options.store, {
    address: signature.account,
    commitment: configCommitment,
    config,
  })
  await cacheNextConfigs({
    account: signature.account,
    config,
    store: options.store,
    transaction,
  })

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
        const blockNumber = await getBlockNumber(options.client, {
          cacheTime: 0,
        })
        await validateConfig({
          account: claim.account,
          blockNumber,
          client: options.client,
          config: claim.config,
        })
        const finalApprovals = await selectApprovals({
          account: claim.account,
          blockNumber,
          client: options.client,
          config: claim.config,
          hash: claim.hash,
          approvals: claim.approvals,
          store: options.store,
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
    /** Client used to validate configs. */
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
    requestOptions?: handleRequest.RequestOptions | undefined
    /** Serialized Tempo transaction. */
    serialized: Hex.Hex
    /** Shared multisig store. */
    store: Store.Atomic
  }
}

/** Collects approvals for a multisig key authorization. @internal */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function approveKeyAuthorization(
  options: approveKeyAuthorization.Options,
) {
  const value = options.request.params?.[0]
  if (!value || typeof value !== 'object')
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a multisig key authorization approval.',
    })

  const approval = await (async () => {
    if ('keyAuthorization' in value) {
      const authorization = (() => {
        try {
          return KeyAuthorization.fromRpc(
            value.keyAuthorization as KeyAuthorization.Rpc,
          )
        } catch {
          throw new RpcResponse.InvalidParamsError({
            message: 'Invalid multisig key authorization.',
          })
        }
      })()
      const signature = authorization.signature
      if (signature?.type !== 'multisig')
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a multisig key authorization signature.',
        })
      if (
        !authorization.account ||
        !isAddressEqual(authorization.account, signature.account)
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            'Multisig key authorization account does not match its signature.',
        })
      const { signature: _, ...unsigned } = authorization
      const keyAuthorization = KeyAuthorization.serialize(
        KeyAuthorization.from(unsigned),
      )
      const config = MultisigConfig.from(signature.config)
      const hash = MultisigOperation.getHash({
        account: signature.account,
        config,
        keyAuthorization,
        type: 'keyAuthorization',
      })
      return {
        account: signature.account,
        approvals: signature.signatures.map((signature) =>
          SignatureEnvelope.serialize(signature),
        ),
        config,
        hash,
        keyAuthorization,
      }
    }

    if ('hash' in value && 'signature' in value) {
      if (typeof value.hash !== 'string' || !Hash.validate(value.hash))
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a multisig operation hash.',
        })
      const operation = await OperationStore.read(options.store, value.hash)
      if (!operation || operation.type !== 'keyAuthorization')
        throw new RpcResponse.InvalidParamsError({
          message: 'Multisig key authorization operation was not found.',
        })
      if (operation.status === 'success') return { operation }
      const signature = (() => {
        try {
          return SignatureEnvelope.serialize(
            SignatureEnvelope.from(value.signature as Hex.Hex),
          )
        } catch {
          throw new RpcResponse.InvalidParamsError({
            message: 'Invalid multisig owner signature.',
          })
        }
      })()
      return {
        account: operation.account,
        approvals: [signature],
        config: operation.config,
        hash: operation.hash,
        keyAuthorization: operation.keyAuthorization,
      }
    }

    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a multisig key authorization approval.',
    })
  })()
  if ('operation' in approval)
    return MultisigOperation.toRpc(approval.operation)
  if (approval.approvals.length === 0)
    throw new RpcResponse.InvalidParamsError({
      message: 'A multisig approval envelope must include a signature.',
    })

  const blockNumber = await getBlockNumber(options.client, { cacheTime: 0 })
  const commitment = await validateConfig({
    account: approval.account,
    blockNumber,
    client: options.client,
    config: approval.config,
  })
  const now = Date.now()
  const operation = await OperationStore.update(
    options.store,
    approval.hash,
    async (existing) => {
      if (existing && existing.type !== 'keyAuthorization')
        throw new OperationStore.InvalidStoreValueError()
      if (existing?.status === 'success') return existing
      if (
        existing &&
        (existing.account.toLowerCase() !== approval.account.toLowerCase() ||
          MultisigConfig.getCommitment(existing.config).toLowerCase() !==
            MultisigConfig.getCommitment(approval.config).toLowerCase() ||
          existing.keyAuthorization.toLowerCase() !==
            approval.keyAuthorization.toLowerCase())
      )
        throw new OperationStore.InvalidStoreValueError()
      const existingApprovals = existing
        ? await selectApprovals({
            account: approval.account,
            approvals: existing.approvals,
            blockNumber,
            client: options.client,
            config: approval.config,
            discardInvalidNested: true,
            hash: approval.hash,
            store: options.store,
          })
        : undefined
      const approvals = await selectApprovals({
        account: approval.account,
        approvals: [
          ...(existingApprovals?.approvals ?? []),
          ...approval.approvals,
        ],
        blockNumber,
        client: options.client,
        config: approval.config,
        hash: approval.hash,
        store: options.store,
      })
      if (
        existing &&
        approvals.approvals.length === existing.approvals.length &&
        approvals.approvals.every(
          (approval, index) => approval === existing.approvals[index],
        )
      )
        return existing
      const pending = {
        account: approval.account,
        approvals: approvals.approvals,
        config: approval.config,
        createdAt: existing?.createdAt ?? now,
        hash: approval.hash,
        keyAuthorization: approval.keyAuthorization,
        signatureCount: approvals.signatureCount,
        threshold: approvals.threshold,
        type: 'keyAuthorization',
        updatedAt: now,
        weight: approvals.weight,
      } as const
      if (approvals.weight < approvals.threshold)
        return MultisigOperation.from({ ...pending, status: 'pending' })
      return MultisigOperation.from({
        ...pending,
        keyAuthorization: MultisigOperation.serializeKeyAuthorization(
          approval.keyAuthorization,
          {
            account: approval.account,
            approvals: approvals.selectedApprovals,
            config: approval.config,
          },
        ),
        status: 'success',
      })
    },
  )
  await ConfigStore.write(options.store, {
    address: approval.account,
    commitment,
    config: approval.config,
  })
  if (operation.type !== 'keyAuthorization')
    throw new OperationStore.InvalidStoreValueError()
  return MultisigOperation.toRpc(operation)
}

declare namespace approveKeyAuthorization {
  /** Options for {@link approveKeyAuthorization}. */
  export type Options = {
    /** Client used to validate configs. */
    client: ReturnType<typeof createClient>
    /** Original RPC request. */
    request: handleRequest.Request
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

/** Validates a config against an observed chain commitment. */
function assertConfig(options: {
  account: `0x${string}`
  commitment: Hex.Hex
  config: MultisigConfig.Config
}) {
  const { account, commitment, config } = options
  if (
    config.version === 0n &&
    MultisigConfig.getAddress(config).toLowerCase() !== account.toLowerCase()
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Initial multisig config does not match the multisig account.',
    })
  const expected = (() => {
    if (config.version === 0n) return Hex.fromNumber(0, { size: 32 })
    return MultisigConfig.getCommitment(config)
  })()
  if (commitment.toLowerCase() !== expected.toLowerCase())
    throw new RpcResponse.InvalidParamsError({
      message: `Multisig config does not match account ${account}.`,
    })
}

/** Reads and validates a config commitment at one block. */
async function validateConfig(options: {
  account: `0x${string}`
  blockNumber: bigint
  client: ReturnType<typeof createClient>
  config: MultisigConfig.Config
}) {
  const { account, blockNumber, client, config } = options
  const commitment = await getConfigCommitment(client, {
    account,
    blockNumber,
  })
  assertConfig({ account, commitment, config })
  return commitment
}

/** Caches candidate configs from valid native update calls. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function cacheNextConfigs(options: cacheNextConfigs.Options) {
  let currentConfig = options.config
  for (const call of options.transaction.calls) {
    if (
      !call.to ||
      !isAddressEqual(call.to, Addresses.nativeMultisig) ||
      !call.data
    )
      continue
    const decoded = (() => {
      try {
        return decodeFunctionData({ abi: Abis.nativeMultisig, data: call.data })
      } catch {
        return undefined
      }
    })()
    if (decoded?.functionName !== 'updateConfig') continue
    const [current, threshold, owners] = decoded.args
    const suppliedConfig = (() => {
      try {
        return MultisigConfig.from(current)
      } catch {
        return undefined
      }
    })()
    if (
      !suppliedConfig ||
      MultisigConfig.getCommitment(suppliedConfig).toLowerCase() !==
        MultisigConfig.getCommitment(currentConfig).toLowerCase()
    )
      continue
    const config = (() => {
      try {
        return MultisigConfig.from({
          owners,
          salt: suppliedConfig.salt,
          threshold,
          version: suppliedConfig.version + 1n,
        })
      } catch {
        return undefined
      }
    })()
    if (!config) continue
    await ConfigStore.write(options.store, {
      address: options.account,
      commitment: MultisigConfig.getCommitment(config),
      config,
    })
    currentConfig = config
  }
}

declare namespace cacheNextConfigs {
  /** Parameters for {@link cacheNextConfigs}. */
  export type Options = {
    /** Root multisig account. */
    account: Address
    /** Root config used to authorize the transaction. */
    config: MultisigConfig.Config
    /** Shared multisig store. */
    store: Store.Store
    /** Submitted transaction containing potential config updates. */
    transaction: Transaction.TransactionSerializableTempo
  }
}

/** Selects approvals after validating every nested config. */
// biome-ignore lint/correctness/noUnusedVariables: _
async function selectApprovals(options: selectApprovals.Options) {
  const validation = new Map<string, Promise<Hex.Hex>>()
  let validationCount = 0
  const select = async (approvals: readonly SignatureEnvelope.Serialized[]) => {
    const result = await MultisigOperation.selectApprovals({
      account: options.account,
      approvals,
      config: options.config,
      hash: options.hash,
    })
    const configs = new Map<
      string,
      { account: Address; config: MultisigConfig.Config }
    >()
    const visit = (signature: SignatureEnvelope.SignatureEnvelope) => {
      if (signature.type !== 'multisig') return
      const config = MultisigConfig.from(signature.config)
      const key = signature.account.toLowerCase()
      configs.set(key, { account: signature.account, config })
      for (const approval of signature.signatures) visit(approval)
    }
    for (const approval of result.approvals)
      visit(SignatureEnvelope.from(approval))

    for (const { account, config } of configs.values()) {
      const key = `${account.toLowerCase()}:${MultisigConfig.getCommitment(config)}`
      const pending = (() => {
        const existing = validation.get(key)
        if (existing) return existing
        validationCount++
        if (validationCount > MultisigConfig.maxOwners)
          throw new RpcResponse.InvalidParamsError({
            message: 'Multisig approval validation exceeds the owner limit.',
          })
        const pending = validateConfig({
          account,
          blockNumber: options.blockNumber,
          client: options.client,
          config,
        })
        validation.set(key, pending)
        return pending
      })()
      const commitment = await pending
      await ConfigStore.write(options.store, {
        address: account,
        commitment,
        config,
      })
    }
    return result
  }
  try {
    if (!options.discardInvalidNested) return await select(options.approvals)

    const approvals: SignatureEnvelope.Serialized[] = []
    for (const approval of options.approvals) {
      if (SignatureEnvelope.from(approval).type !== 'multisig') {
        approvals.push(approval)
        continue
      }
      try {
        const retained = (await select([approval])).approvals[0]
        if (retained) approvals.push(retained)
      } catch (error) {
        if (
          error instanceof MultisigOperation.InvalidApprovalError ||
          error instanceof RpcResponse.InvalidParamsError
        )
          continue
        throw error
      }
    }
    return await select(approvals)
  } catch (error) {
    if (error instanceof MultisigOperation.InvalidApprovalError)
      throw new RpcResponse.InvalidParamsError({ message: error.shortMessage })
    throw error
  }
}

declare namespace selectApprovals {
  /** Options for {@link selectApprovals}. */
  export type Options = MultisigOperation.selectApprovals.Options & {
    /** Block used to validate every config. */
    blockNumber: bigint
    /** Client used to validate nested multisig configurations. */
    client: ReturnType<typeof createClient>
    /** Discards stored nested approvals invalidated by a child configuration change. */
    discardInvalidNested?: boolean | undefined
    /** Shared multisig store. */
    store: Store.Store
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

/** Returns a synthetic transaction while the downstream transaction is unavailable. */
async function toTransaction(
  client: ReturnType<typeof createClient>,
  operation: MultisigOperation.TransactionOperation,
  store: Store.Store,
) {
  const approvals = await (async () => {
    if (operation.status !== 'pending')
      return await MultisigOperation.selectApprovals({
        account: operation.account,
        approvals: operation.approvals,
        config: operation.config,
        hash: operation.hash,
      })
    const blockNumber = await getBlockNumber(client, { cacheTime: 0 })
    await validateConfig({
      account: operation.account,
      blockNumber,
      client,
      config: operation.config,
    })
    return await selectApprovals({
      account: operation.account,
      approvals: operation.approvals,
      blockNumber,
      client,
      config: operation.config,
      discardInvalidNested: true,
      hash: operation.hash,
      store,
    })
  })()
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

/** Resolves and validates the chain used by a handled request. */
async function resolveRequestOptions(options: {
  request: handleRequest.Request
  requestOptions?: handleRequest.RequestOptions | undefined
  store: Store.Store
}): Promise<handleRequest.RequestOptions | undefined> {
  const { request, requestOptions, store } = options
  const chainId_explicit = requestOptions?.chainId
  if (
    chainId_explicit !== undefined &&
    (!Number.isSafeInteger(chainId_explicit) || chainId_explicit <= 0)
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a valid chain ID.',
    })
  const chainId_request = await resolveRequestChainId(request, store)
  if (
    chainId_explicit !== undefined &&
    chainId_request !== undefined &&
    chainId_explicit !== chainId_request
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Conflicting chain ids.',
    })
  const chainId = chainId_explicit ?? chainId_request
  if (chainId === undefined) return requestOptions
  return { ...requestOptions, chainId }
}

/** Resolves a chain from request fields, envelopes, or stored operations. */
async function resolveRequestChainId(
  request: handleRequest.Request,
  store: Store.Store,
) {
  const value = request.params?.[0]
  const chainId_body =
    value && typeof value === 'object' && 'chainId' in value
      ? parseChainId(value.chainId)
      : undefined
  const chainId_multisig = await (async () => {
    if (
      request.method === 'eth_sendRawTransaction' ||
      request.method === 'eth_sendRawTransactionSync' ||
      request.method === 'multisig_approveRawTransaction' ||
      request.method === 'multisig_approveRawTransactionSync'
    ) {
      if (!isSerializedTempoTransaction(value)) return undefined
      try {
        return parseChainId(Transaction.deserialize(value).chainId)
      } catch {
        return undefined
      }
    }

    if (
      request.method === 'multisig_approveKeyAuthorization' &&
      value &&
      typeof value === 'object' &&
      'keyAuthorization' in value
    ) {
      try {
        return parseChainId(
          KeyAuthorization.fromRpc(
            value.keyAuthorization as KeyAuthorization.Rpc,
          ).chainId,
        )
      } catch {
        return undefined
      }
    }

    const hash = (() => {
      if (
        request.method === 'eth_getTransactionByHash' ||
        request.method === 'eth_getTransactionReceipt'
      )
        return value
      if (
        request.method === 'multisig_approveKeyAuthorization' &&
        value &&
        typeof value === 'object' &&
        'hash' in value
      )
        return value.hash
      return undefined
    })()
    if (typeof hash !== 'string' || !Hash.validate(hash)) return undefined
    const operation = await OperationStore.read(store, hash)
    if (!operation) return undefined
    if (operation.type === 'transaction')
      return parseChainId(
        Transaction.deserialize(
          operation.transaction as Transaction.TransactionSerializedTempo,
        ).chainId,
      )
    return parseChainId(
      KeyAuthorization.deserialize(operation.keyAuthorization).chainId,
    )
  })()

  if (
    chainId_body !== undefined &&
    chainId_multisig !== undefined &&
    chainId_body !== chainId_multisig
  )
    throw new RpcResponse.InvalidParamsError({
      message: 'Conflicting chain ids.',
    })
  return chainId_body ?? chainId_multisig
}

/** Parses a supported chain ID representation. */
function parseChainId(value: unknown) {
  const chainId = (() => {
    if (typeof value === 'number') return value
    if (typeof value === 'bigint') return Number(value)
    if (typeof value === 'string' && Hex.validate(value)) {
      try {
        return Hex.toNumber(value)
      } catch {
        return undefined
      }
    }
    return undefined
  })()
  if (chainId === undefined || !Number.isSafeInteger(chainId) || chainId <= 0)
    return undefined
  return chainId
}

/** Checks whether a value is a serialized Tempo transaction. */
function isSerializedTempoTransaction(value: unknown): value is Hex.Hex {
  return (
    typeof value === 'string' &&
    (value.startsWith('0x76') || value.startsWith('0x78'))
  )
}
