import * as Address from 'ox/Address'
import * as Hash from 'ox/Hash'
import type * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import { MultisigConfig } from 'ox/tempo'
import { BaseError } from '../../errors/base.js'
import type * as Store from '../Store.js'

/** A valid 48-owner config is much smaller; 64 KiB bounds hostile store parsing work. */
const maxStoredValueLength = 65_536

/** Zero commitment used before an account records its first config update. */
const zeroCommitment = `0x${'00'.repeat(32)}` as const

/** Reads a cached multisig config. */
export async function read(
  store: Store.Store,
  options: read.Options,
): Promise<MultisigConfig.Config | null> {
  const { address, commitment } = options
  const value = await store.getItem(key({ address, commitment }))
  if (value === null || value === undefined) return null
  const config = deserialize(value)
  assertKey({ address, commitment, config })
  return config
}

export declare namespace read {
  /** Parameters for {@link read}. */
  export type Options = {
    /** Multisig account address. */
    address: Address.Address
    /** Config commitment observed onchain. */
    commitment: Hex.Hex
  }
}

/** Writes a validated multisig config. */
export async function write(
  store: Store.Store,
  options: write.Options,
): Promise<void> {
  const { address, commitment } = options
  const config = MultisigConfig.from(options.config)
  assertKey({ address, commitment, config })
  await store.setItem(key({ address, commitment }), serialize(config))
}

export declare namespace write {
  /** Parameters for {@link write}. */
  export type Options = {
    /** Multisig account address. */
    address: Address.Address
    /** Config commitment used for lookup. */
    commitment: Hex.Hex
    /** Complete config. */
    config: MultisigConfig.Config
  }
}

/** Verifies that a config matches its account-and-commitment key. */
function assertKey(options: {
  address: Address.Address
  commitment: Hex.Hex
  config: MultisigConfig.Config
}) {
  const { address, commitment, config } = options
  if (!Address.validate(address) || !Hash.validate(commitment))
    throw new InvalidStoreValueError()
  if (config.version === 0n) {
    if (
      commitment.toLowerCase() !== zeroCommitment ||
      !Address.isEqual(MultisigConfig.getAddress(config), address)
    )
      throw new InvalidStoreValueError()
    return
  }
  if (
    MultisigConfig.getCommitment(config).toLowerCase() !==
    commitment.toLowerCase()
  )
    throw new InvalidStoreValueError()
}

/** Deserializes a multisig config from storage. */
function deserialize(value: string): MultisigConfig.Config {
  try {
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return MultisigConfig.fromRpc(Json.parse(value) as never)
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Returns the store key for an account and config commitment. */
function key(options: { address: Address.Address; commitment: Hex.Hex }) {
  const { address, commitment } = options
  return `multisig:config:${address.toLowerCase()}:${commitment.toLowerCase()}`
}

/** Serializes a multisig config for storage. */
function serialize(config: MultisigConfig.Config): string {
  try {
    const value = Json.stringify(MultisigConfig.toRpc(config))
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return value
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Thrown when a stored multisig config is malformed or mismatched. */
export class InvalidStoreValueError extends BaseError {
  /** Creates an invalid store value error. */
  constructor(options: InvalidStoreValueError.Options = {}) {
    super('Stored multisig config is malformed or mismatched.', {
      cause: options.cause as Error | undefined,
      name: 'Multisig.Config.InvalidStoreValueError',
    })
  }
}

export declare namespace InvalidStoreValueError {
  /** Error construction options. */
  export type Options = {
    /** Underlying error. */
    cause?: unknown | undefined
  }
}
