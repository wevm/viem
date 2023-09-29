import type { Address } from 'abitype'

import type { ByteArray, Hex } from '../../types/misc.js'
import { type ConcatErrorType, concat } from '../data/concat.js'
import { type IsBytesErrorType, isBytes } from '../data/isBytes.js'
import { type PadErrorType, pad } from '../data/pad.js'
import { type SliceErrorType, slice } from '../data/slice.js'
import { type ToBytesErrorType, toBytes } from '../encoding/toBytes.js'
import { type ToRlpErrorType, toRlp } from '../encoding/toRlp.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'

import type { ErrorType } from '../../errors/utils.js'
import { type GetAddressErrorType, getAddress } from './getAddress.js'

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

export type GetCreateAddressErrorType =
  | Keccak256ErrorType
  | GetAddressErrorType
  | ToBytesErrorType
  | ToRlpErrorType
  | ErrorType

export function getCreateAddress(opts: GetCreateAddressOptions) {
  const from = toBytes(getAddress(opts.from))

  let nonce = toBytes(opts.nonce)
  if (nonce[0] === 0) nonce = new Uint8Array([])

  return getAddress(
    `0x${keccak256(toRlp([from, nonce], 'bytes')).slice(26)}` as Address,
  )
}

export type GetCreate2AddressErrorType =
  | ConcatErrorType
  | Keccak256ErrorType
  | GetAddressErrorType
  | IsBytesErrorType
  | PadErrorType
  | SliceErrorType
  | ToBytesErrorType
  | ToRlpErrorType
  | ErrorType

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
