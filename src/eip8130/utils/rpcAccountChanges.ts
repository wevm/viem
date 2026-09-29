import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { accountChangeType, changeType } from '../constants.js'
import type { AaAccountChange, AaActor } from '../types/transaction.js'
import { decodeChange, encodeChangePayload } from './actorChangeData.js'

/** JSON-RPC shape of one `accountChanges` entry, tagged by its type byte. */
export type RpcAccountChange = { type: string } & Record<string, unknown>

type RpcActor = {
  actorId: Hex
  authenticator: Address
  scope?: number | Hex
  policyData?: Hex
}

type RpcSignedChange = { changeType: string; payload: Hex }

/** `ChangeType` variant names emitted by older nodes (serde enum names). */
const changeTypeNames = {
  [changeType.authorizeActor]: 'AuthorizeActor',
  [changeType.revokeActor]: 'RevokeActor',
  [changeType.incrementLocalEpoch]: 'IncrementLocalEpoch',
  [changeType.lock]: 'Lock',
  [changeType.unlock]: 'Unlock',
} as const satisfies Record<number, string>

const channelByte = { local: 0, multichain: 1 } as const
const channelByName: Record<string, number> = { Local: 0, Multichain: 1 }

const changeTypeByName = Object.fromEntries(
  Object.entries(changeTypeNames).map(([op, name]) => [name, Number(op)]),
) as Record<string, number>

/** Type byte as a JSON-RPC quantity (`'0x01'` → `'0x1'`). */
function toQuantity(typeByte: Hex | number): Hex {
  return numberToHex(
    typeof typeByte === 'number' ? typeByte : hexToNumber(typeByte),
  )
}

/** Parses a JSON-RPC integer sent as a quantity or (older nodes) a JSON number. */
function toBigInt(value: unknown): bigint {
  return BigInt(value as number | string)
}

/** Parses an enum sent as its wire byte (`'0x1'` / `'0x01'`) or a legacy name. */
function enumByte(
  value: string,
  names: Record<string, number>,
  label: string,
): number {
  if (/^0x[0-9a-f]{1,2}$/i.test(value)) return Number(value)
  const byte = names[value]
  if (byte === undefined)
    throw new BaseError(`Unknown account change ${label}: "${value}".`)
  return byte
}

/**
 * Converts a typed {@link AaAccountChange} to the node's JSON-RPC form. Every
 * enum is its wire byte as a quantity: the entry `type` (`'0x1'` delegation,
 * `'0x2'` create, `'0x3'` config), a config batch's `channel` (`'0x0'` local,
 * `'0x1'` multichain), and each op's `changeType`. Integers are quantities too.
 */
export function toRpcAccountChange(change: AaAccountChange): RpcAccountChange {
  if (change.type === 'delegation')
    return {
      type: toQuantity(accountChangeType.delegation),
      target: change.target,
    }
  if (change.type === 'create')
    return {
      type: toQuantity(accountChangeType.create),
      userSalt: change.userSalt,
      code: change.code,
      // `scope` and `policyData` have no serde default on the node, so both are
      // always sent.
      initialActors: change.initialActors.map((actor) => ({
        actorId: actor.actorId,
        authenticator: actor.authenticator,
        scope: numberToHex(actor.scope ?? 0),
        policyData: actor.policyData ?? '0x',
      })),
    }
  return {
    type: toQuantity(accountChangeType.config),
    channel: toQuantity(channelByte[change.channel]),
    sequence: numberToHex(change.sequence),
    changes: change.changes.map((c) => ({
      changeType: toQuantity(c.changeType),
      payload: encodeChangePayload(c),
    })),
    signature: change.signature,
  }
}

/**
 * Converts one node JSON-RPC `accountChanges` entry back into a typed
 * {@link AaAccountChange}. Accepts wire bytes (`'0x1'` / `'0x01'`) and hex
 * quantities, as well as the variant names and JSON numbers emitted by older
 * nodes (`delegation`, `Local`, `AuthorizeActor`, …).
 */
export function fromRpcAccountChange(raw: RpcAccountChange): AaAccountChange {
  const kind = entryKind(raw.type)
  if (kind === 'delegation')
    return { type: 'delegation', target: raw.target as Address }
  if (kind === 'create')
    return {
      type: 'create',
      userSalt: raw.userSalt as Hex,
      code: raw.code as Hex,
      initialActors: (raw.initialActors as readonly RpcActor[]).map((a) => {
        const actor: AaActor = {
          actorId: a.actorId,
          authenticator: a.authenticator,
        }
        const scope = Number(a.scope ?? 0)
        if (scope) actor.scope = scope
        if (a.policyData && a.policyData !== '0x')
          actor.policyData = a.policyData
        return actor
      }),
    }
  return {
    type: 'config',
    channel:
      enumByte(raw.channel as string, channelByName, 'channel') ===
      channelByte.multichain
        ? 'multichain'
        : 'local',
    sequence: toBigInt(raw.sequence),
    changes: (raw.changes as readonly RpcSignedChange[]).map((c) =>
      decodeChange(enumByte(c.changeType, changeTypeByName, 'op'), c.payload),
    ),
    signature: raw.signature as Hex,
  }
}

function entryKind(type: string): AaAccountChange['type'] {
  if (type === 'delegation' || type === 'create') return type
  if (type === 'configChange') return 'config'
  if (/^0x[0-9a-f]+$/i.test(type)) {
    const byte = Number(type)
    if (byte === hexToNumber(accountChangeType.delegation)) return 'delegation'
    if (byte === hexToNumber(accountChangeType.create)) return 'create'
    if (byte === hexToNumber(accountChangeType.config)) return 'config'
  }
  throw new BaseError(`Unknown account change entry type: "${type}".`)
}
