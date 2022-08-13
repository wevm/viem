import { expect, test } from 'vitest'

import { gweiValue } from './gweiValue'

test('converts gwei to wei', () => {
  expect(gweiValue('69420.1234567')).toMatchInlineSnapshot('69420123456700n')
  expect(gweiValue('69420')).toMatchInlineSnapshot('69420000000000n')
  expect(gweiValue('1')).toMatchInlineSnapshot('1000000000n')
  expect(gweiValue('0.5')).toMatchInlineSnapshot('500000000n')
  expect(gweiValue('0.1')).toMatchInlineSnapshot('100000000n')
  expect(gweiValue('0.01')).toMatchInlineSnapshot('10000000n')
  expect(gweiValue('0.001')).toMatchInlineSnapshot('1000000n')
  expect(gweiValue('0.0001')).toMatchInlineSnapshot('100000n')
  expect(gweiValue('0.00001')).toMatchInlineSnapshot('10000n')
  expect(gweiValue('0.000001')).toMatchInlineSnapshot('1000n')
  expect(gweiValue('0.0000001')).toMatchInlineSnapshot('100n')
  expect(gweiValue('0.00000001')).toMatchInlineSnapshot('10n')
  expect(gweiValue('0.000000001')).toMatchInlineSnapshot('1n')

  expect(gweiValue('-6942060.123456')).toMatchInlineSnapshot(
    '-6942060123456000n',
  )
  expect(gweiValue('-6942069420')).toMatchInlineSnapshot(
    '-6942069420000000000n',
  )
  expect(gweiValue('-1')).toMatchInlineSnapshot('-1000000000n')
  expect(gweiValue('-0.5')).toMatchInlineSnapshot('-500000000n')
  expect(gweiValue('-0.1')).toMatchInlineSnapshot('-100000000n')
  expect(gweiValue('-0.01')).toMatchInlineSnapshot('-10000000n')
  expect(gweiValue('-0.001')).toMatchInlineSnapshot('-1000000n')
  expect(gweiValue('-0.0001')).toMatchInlineSnapshot('-100000n')
  expect(gweiValue('-0.00001')).toMatchInlineSnapshot('-10000n')
  expect(gweiValue('-0.000001')).toMatchInlineSnapshot('-1000n')
  expect(gweiValue('-0.0000001')).toMatchInlineSnapshot('-100n')
  expect(gweiValue('-0.00000001')).toMatchInlineSnapshot('-10n')
  expect(gweiValue('-0.000000001')).toMatchInlineSnapshot('-1n')
})

test('converts to rounded gwei', () => {
  expect(gweiValue('0.0000000001')).toMatchInlineSnapshot('0n')
  expect(gweiValue('0.00000000059')).toMatchInlineSnapshot('1n')
  expect(gweiValue('1.00000000059')).toMatchInlineSnapshot('1000000001n')
  expect(gweiValue('69.59000000059')).toMatchInlineSnapshot('69590000001n')
  expect(gweiValue('1.2345678912345222')).toMatchInlineSnapshot('1234567891n')
  expect(gweiValue('-0.0000000001')).toMatchInlineSnapshot('0n')
  expect(gweiValue('-0.00000000059')).toMatchInlineSnapshot('-1n')
  expect(gweiValue('-1.00000000059')).toMatchInlineSnapshot('-1000000001n')
  expect(gweiValue('-69.59000000059')).toMatchInlineSnapshot('-69590000001n')
  expect(gweiValue('-1.2345678912345222')).toMatchInlineSnapshot('-1234567891n')
})

// test('error: throws if gwei cannot be created', () => {
//   expect(() => gweiValue('0.0000000001')).toThrowErrorMatchingInlineSnapshot(
//     `
//     "Cannot create a gwei value from 0.0000000001. This value is too small.

//     Details: cannot create an integer by shifting 0.0000000001 by 9 decimals.
//     Version: viem@1.0.2"
//   `,
//   )
//   expect(() => gweiValue('1.2345678912345222')).toThrowErrorMatchingInlineSnapshot(
//     `
//     "Cannot create a gwei value from 0.0000000001. This value is too small.

//     Details: cannot create an integer by shifting 0.0000000001 by 9 decimals.
//     Version: viem@1.0.2"
//   `,
//   )
//   expect(() => gweiValue('-0.0000000001')).toThrowErrorMatchingInlineSnapshot(
//     `
//     "Cannot create a gwei value from -0.0000000001. This value is too small.

//     Details: cannot create an integer by shifting -0.0000000001 by 9 decimals.
//     Version: viem@1.0.2"
//   `,
//   )
// })
