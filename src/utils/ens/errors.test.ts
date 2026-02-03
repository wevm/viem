import { expect, test } from 'vitest'
import { universalResolverResolveAbi } from '../../constants/abis.js'
import { zeroAddress } from '../../constants/address.js'
import { BaseError } from '../../errors/base.js'
import { ContractFunctionRevertedError } from '../../errors/contract.js'
import { encodeErrorResult } from '../index.js'
import { isNullUniversalResolverError } from './errors.js'

const abi = universalResolverResolveAbi
const functionName = 'resolveWithGateways'

test('resolver not found error', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: encodeErrorResult({
          abi,
          errorName: 'ResolverNotFound',
          args: ['0x1234'],
        }),
        functionName,
      }),
    ),
  ).toBe(true)
})

test('resolver not contract error', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: encodeErrorResult({
          abi,
          errorName: 'ResolverNotContract',
          args: ['0x1234', zeroAddress],
        }),
        functionName,
      }),
    ),
  ).toBe(true)
})

test('resolver error', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: encodeErrorResult({
          abi,
          errorName: 'ResolverError',
          args: ['0x1234'],
        }),
        functionName,
      }),
    ),
  ).toBe(true)
})

test('http error', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: encodeErrorResult({
          abi,
          errorName: 'HttpError',
          args: [404, 'Not Found'],
        }),
        functionName,
      }),
    ),
  ).toBe(true)
})

test('reverse address mismatch error', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: encodeErrorResult({
          abi,
          errorName: 'ReverseAddressMismatch',
          args: ['primary.eth', zeroAddress],
        }),
        functionName,
      }),
    ),
  ).toBe(true)
})

test('unsupported resolver profile error', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: encodeErrorResult({
          abi,
          errorName: 'UnsupportedResolverProfile',
          args: ['0x12345678'],
        }),
        functionName,
      }),
    ),
  ).toBe(true)
})

test('not base error', () => {
  expect(isNullUniversalResolverError(new Error())).toBe(false)
})

test('not contract reverted error', () => {
  expect(isNullUniversalResolverError(new BaseError(''))).toBe(false)
})

test('other contract revert reason', () => {
  expect(
    isNullUniversalResolverError(
      new ContractFunctionRevertedError({
        abi,
        data: '0x',
        functionName,
      }),
    ),
  ).toBe(false)
})
