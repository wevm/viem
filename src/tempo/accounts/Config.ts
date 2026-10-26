import * as Address from 'ox/Address'
import * as Hash from 'ox/Hash'
import type * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import { AccountConfig } from 'ox/tempo'
import { BaseError } from '../../errors/base.js'
import type * as Store from '../Store.js'

/** A valid 48-owner config is much smaller; 64 KiB bounds hostile store parsing work. */
const maxStoredValueLength = 65_536

/** Zero commitment used before an account is initialized. */
const zeroCommitment = `0x${'00'.repeat(32)}` as const

/** Reads a cached account config. */
export async function read(
  store: Store.Store,
  options: read.Options,
): Promise<AccountConfig.Config | null> {
  const { address, chainId, commitment } = options
  const value = await store.getItem(key({ address, chainId, commitment }))
  if (value === null || value === undefined) return null
  const config = deserialize(value)
  assertKey({ address, commitment, config })
  return config
}

export declare namespace read {
  /** Parameters for {@link read}. */
  export type Options = {
    /** Configurable account address. */
    address: Address.Address
    /** Chain whose commitment selects the config. */
    chainId: number
    /** Config commitment observed onchain. */
    commitment: Hex.Hex
  }
}

/**
 * Writes a validated account config.
 *
 * Each key fixes one config, through its commitment or, before initialization, the account
 * address. An existing key therefore holds the same config and is not written again.
 */
export async function write(
  store: Store.Atomic,
  options: write.Options,
): Promise<void> {
  const { address, chainId, commitment } = options
  const config = (() => {
    try {
      return AccountConfig.from(options.config)
    } catch (cause) {
      throw new InvalidStoreValueError({ cause })
    }
  })()
  assertKey({ address, commitment, config })
  const value = serialize(config)
  await store.compareAndSet(key({ address, chainId, commitment }), null, value)
  // Initialization commits the version-zero config without changing its version.
  if (commitment.toLowerCase() === zeroCommitment)
    await store.compareAndSet(
      key({
        address,
        chainId,
        commitment: AccountConfig.getCommitment(config),
      }),
      null,
      value,
    )
}

export declare namespace write {
  /** Parameters for {@link write}. */
  export type Options = {
    /** Configurable account address. */
    address: Address.Address
    /** Chain whose commitment selects the config. */
    chainId: number
    /** Config commitment used for lookup. */
    commitment: Hex.Hex
    /** Complete config. */
    config: AccountConfig.Config
  }
}

/** Verifies that a config matches its account-and-commitment key. */
function assertKey(options: {
  address: Address.Address
  commitment: Hex.Hex
  config: AccountConfig.Config
}) {
  const { address, commitment, config } = options
  if (!Address.validate(address) || !Hash.validate(commitment))
    throw new InvalidStoreValueError()
  if (config.version === 0n) {
    if (!Address.isEqual(AccountConfig.getAddress(config), address))
      throw new InvalidStoreValueError()
    if (commitment.toLowerCase() === zeroCommitment) return
  }
  if (
    AccountConfig.getCommitment(config).toLowerCase() !==
    commitment.toLowerCase()
  )
    throw new InvalidStoreValueError()
}

/** Deserializes an account config from storage. */
function deserialize(value: string): AccountConfig.Config {
  try {
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return AccountConfig.fromRpc(Json.parse(value) as never)
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Returns the store key for an account and config commitment on one chain. */
function key(options: {
  address: Address.Address
  chainId: number
  commitment: Hex.Hex
}) {
  const { address, chainId, commitment } = options
  return `configurableAccount:config:${chainId}:${address.toLowerCase()}:${commitment.toLowerCase()}`
}

/** Serializes an account config for storage. */
function serialize(config: AccountConfig.Config): string {
  try {
    const value = Json.stringify(AccountConfig.toRpc(config))
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return value
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Thrown when a stored account config is malformed or mismatched. */
export class InvalidStoreValueError extends BaseError {
  /** Creates an invalid store value error. */
  constructor(options: InvalidStoreValueError.Options = {}) {
    super('Stored account config is malformed or mismatched.', {
      cause: options.cause as Error | undefined,
      name: 'Accounts.Config.InvalidStoreValueError',
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
