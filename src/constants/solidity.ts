import type { AbiError } from 'abitype'

// https://docs.soliditylang.org/en/v0.8.16/control-structures.html#panic-via-assert-and-error-via-require
export const panicReasons = {
  1: 'An `assert` condition failed.',
  17: 'Arithmic operation resulted in underflow or overflow.',
  18: 'Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).',
  33: 'Attempted to convert to an invalid type.',
  34: 'Attempted to access a storage byte array that is incorrectly encoded.',
  49: 'Performed `.pop()` on an empty array',
  50: 'Array index is out of bounds.',
  65: 'Allocated too much memory or created an array which is too large.',
  81: 'Attempted to call a zero-initialized variable of internal function type.',
} as const

export const solidityError: AbiError = {
  inputs: [
    {
      name: 'message',
      type: 'string',
    },
  ],
  name: 'Error',
  type: 'error',
}
export const solidityPanic: AbiError = {
  inputs: [
    {
      name: 'reason',
      type: 'uint256',
    },
  ],
  name: 'Panic',
  type: 'error',
}
