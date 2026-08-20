import type { Address } from 'abitype'
import * as Hash from 'ox/Hash'
import type * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import { MultisigConfig, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import * as multisigActions from './actions/multisig.js'
import * as Operation from './multisig/Operation.js'
import type * as Storage from './Storage.js'
import * as Transaction from './Transaction.js'

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
      request: ({ method, params }) => next({ method, params }),
    }),
  })

  return async (request) => {
    if (request.method === 'multisig_getOperation') {
      const id = request.params?.[0]
      if (typeof id !== 'string' || !Hash.validate(id))
        throw new RpcResponse.InvalidParamsError({
          message: 'Expected a multisig operation ID.',
        })
      const operation = await multisigActions.getOperation(client, {
        id,
        store: parameters.store,
      })
      return operation ? Operation.serialize(operation) : null
    }

    if (
      request.method !== 'multisig_approveTransaction' &&
      request.method !== 'multisig_approveTransactionSync'
    )
      return await next(request)

    const serialized = request.params?.[0]
    if (!isSerializedTempoTransaction(serialized))
      throw new RpcResponse.InvalidParamsError({
        message: 'Expected a serialized Tempo transaction.',
      })

    return await submit({
      client,
      method: request.method,
      next,
      serialized,
      store: parameters.store,
    })
  }
}

export declare namespace handleRequest {
  /** RPC request handler. */
  export type Handler = (request: Request) => Promise<unknown>

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
  const transaction = deserialize(options.serialized)
  const signature = transaction.signature
  if (signature?.type !== 'multisig')
    throw new RpcResponse.InvalidParamsError({
      message: 'Expected a multisig transaction.',
    })

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
  const id = MultisigConfig.getSignPayload({
    account: signature.account,
    payload,
    version: resolved.version,
  })
  const incoming = signature.signatures.map((signature) =>
    SignatureEnvelope.serialize(signature),
  )
  const now = Date.now()
  const operation = await Operation.update(
    options.store,
    id,
    async (existing) => {
      if (existing?.keyAuthorization)
        throw new Operation.InvalidStoreValueError()
      if (existing?.status === 'success') return existing
      if (existing && existing.weight >= existing.threshold) return existing
      const approvals = await selectApprovals({
        account: signature.account,
        client: options.client,
        config: resolved.config,
        path: [signature.account.toLowerCase()],
        payload,
        signatures: [...(existing?.approvals ?? []), ...incoming],
        version: resolved.version,
      })
      return Operation.from({
        account: signature.account,
        approvals: approvals.all,
        config: resolved.config,
        createdAt: existing?.createdAt ?? now,
        id,
        init: !!signature.init,
        signatures: approvals.selected.length,
        status: 'pending',
        threshold: approvals.threshold,
        transaction: envelope,
        updatedAt: now,
        version: resolved.version,
        weight: approvals.weight,
      })
    },
  )

  if (operation.keyAuthorization) throw new Operation.InvalidStoreValueError()
  if (operation.status === 'success') return Operation.serialize(operation)
  if (operation.weight < operation.threshold)
    return Operation.serialize(operation)

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
  const result = await options.next({
    method:
      options.method === 'multisig_approveTransaction'
        ? 'eth_sendRawTransaction'
        : 'eth_sendRawTransactionSync',
    params: [final],
  })
  const transactionHash = getTransactionHash(result)
  const success = await Operation.update(options.store, id, (current) => {
    if (!current) throw new Operation.InvalidStoreValueError()
    if (current.status === 'success') return current
    const {
      init: __,
      keyAuthorization: ___,
      transaction: _,
      ...operation
    } = current
    return Operation.from({
      ...operation,
      status: 'success',
      transactionHash,
      updatedAt: Date.now(),
    })
  })
  return Operation.serialize(success)
}

declare namespace submit {
  /** Options for {@link submit}. */
  export type Options = {
    /** Client used to resolve initialized configurations. */
    client: ReturnType<typeof createClient>
    /** RPC submission method. */
    method:
      | 'multisig_approveTransaction'
      | 'multisig_approveTransactionSync'
    /** Downstream RPC request handler. */
    next: handleRequest.Handler
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
      const selected = await selectApprovals({
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
// biome-ignore lint/correctness/noUnusedVariables: _
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
