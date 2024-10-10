import { BaseError } from '~viem/errors/base.js'
import type { Hex } from '~viem/types/misc.js'
import {
  fromHex,
  fromRlp,
  hexToBigInt,
  hexToNumber,
} from '~viem/utils/index.js'
import type { ZksyncTransactionSerializable } from '../types/transaction.js'

export function parseEip712Transaction(
  transaction: Hex,
): ZksyncTransactionSerializable {
  {
    const payload: Uint8Array = fromHex(transaction, 'bytes')
    if (payload[0] !== 113) {
      throw new BaseError('transaction type must be eip712')
    }

    return constructEip712Transaction(payload)
  }
}

function constructEip712Transaction(
  bytes: Uint8Array,
): ZksyncTransactionSerializable {
  type PaymasterParams = {
    paymaster: Hex
    paymasterInput: Hex
  }

  function validHex(value: Hex): Hex {
    if (!value || value === '0x') {
      return '0x0'
    }
    return value
  }

  function handleArrayToPaymaster(arr: Hex[]): PaymasterParams | undefined {
    if (arr.length === 0) {
      return undefined
    }
    if (arr.length !== 2) {
      throw new BaseError(
        `Invalid paymaster parameters, expected to have length of 2, found ${arr.length}!`,
      )
    }

    return {
      paymaster: arr[0],
      paymasterInput: arr[1],
    }
  }

  const raw = fromRlp(bytes.slice(1)) as Hex[]
  const paymasterParams = handleArrayToPaymaster(raw[15] as unknown as Hex[])
  return {
    type: 'eip712',
    nonce: hexToNumber(validHex(raw[0])),
    maxPriorityFeePerGas: hexToBigInt(validHex(raw[1])),
    maxFeePerGas: hexToBigInt(validHex(raw[2])),
    gas: hexToBigInt(validHex(raw[3])),
    to: raw[4],
    value: hexToBigInt(validHex(raw[5])),
    data: raw[6],
    v: hexToBigInt(validHex(raw[7])),
    r: raw[8],
    s: raw[9],
    chainId: hexToNumber(validHex(raw[10])),
    from: raw[11],
    gasPerPubdata: hexToBigInt(validHex(raw[12])),
    factoryDeps: raw[13] as unknown as Hex[],
    customSignature: raw[14],
    paymaster: paymasterParams?.paymaster,
    paymasterInput: paymasterParams?.paymasterInput,
  }
}
