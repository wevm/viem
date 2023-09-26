import type { Address } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import { concat } from '../data/concat.js'
import { isBytes } from '../data/isBytes.js'
import { pad } from '../data/pad.js'
import { slice } from '../data/slice.js'
import { toBytes } from '../encoding/toBytes.js'
import { toRlp } from '../encoding/toRlp.js'
import { keccak256 } from '../hash/keccak256.js'

import { getAddress } from './getAddress.js'

export type GetCreateAddressOptions = {
  from: Address
  nonce: bigint
}

export type GetCreate2AddressOptions =
  | {
      bytecode: ByteArray | Hex
      from: Address
      salt: ByteArray | Hex
    }
  | {
      bytecodeHash: ByteArray | Hex
      from: Address
      salt: ByteArray | Hex
    }

export type GetContractAddressOptions =
  | ({
      opcode?: 'CREATE'
    } & GetCreateAddressOptions)
  | ({ opcode: 'CREATE2' } & GetCreate2AddressOptions)

export function getContractAddress(opts: GetContractAddressOptions) {
  if (opts.opcode === 'CREATE2') return getCreate2Address(opts)
  return getCreateAddress(opts)
}

export function getCreateAddress(opts: GetCreateAddressOptions) {
  const from = toBytes(getAddress(opts.from))

  let nonce = toBytes(opts.nonce)
  if (nonce[0] === 0) nonce = new Uint8Array([])

  return getAddress(
    `0x${keccak256(toRlp([from, nonce], 'bytes')).slice(26)}` as Address,
  )
}

export function getCreate2Address(opts: GetCreate2AddressOptions) {
  const from = toBytes(getAddress(opts.from))
  const salt = pad(isBytes(opts.salt) ? opts.salt : toBytes(opts.salt), {
    size: 32,
  })

  const bytecodeHash = (() => {
    if ('bytecodeHash' in opts) {
      if (isBytes(opts.bytecodeHash)) return opts.bytecodeHash
      return toBytes(opts.bytecodeHash)
    }
    return keccak256(opts.bytecode, 'bytes')
  })()

  return getAddress(
    slice(keccak256(concat([toBytes('0xff'), from, salt, bytecodeHash])), 12),
  )
}
