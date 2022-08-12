import { expect, test } from 'vitest'

import { etherValue } from './etherValue'

test('converts ether to wei', () => {
  expect(etherValue('6942069420.12345678912345')).toMatchInlineSnapshot(
    '6942069420123456789123450000n',
  )
  expect(etherValue('6942069420')).toMatchInlineSnapshot(
    '6942069420000000000000000000n',
  )
  expect(etherValue('1')).toMatchInlineSnapshot('1000000000000000000n')
  expect(etherValue('0.5')).toMatchInlineSnapshot('500000000000000000n')
  expect(etherValue('0.1')).toMatchInlineSnapshot('100000000000000000n')
  expect(etherValue('0.00000000001')).toMatchInlineSnapshot('10000000n')
  expect(etherValue('0.000000000001')).toMatchInlineSnapshot('1000000n')
  expect(etherValue('0.0000000000001')).toMatchInlineSnapshot('100000n')
  expect(etherValue('0.00000000000001')).toMatchInlineSnapshot('10000n')
  expect(etherValue('0.000000000000001')).toMatchInlineSnapshot('1000n')
  expect(etherValue('0.0000000000000001')).toMatchInlineSnapshot('100n')
  expect(etherValue('0.00000000000000001')).toMatchInlineSnapshot('10n')
  expect(etherValue('0.000000000000000001')).toMatchInlineSnapshot('1n')
  expect(etherValue('-6942069420.12345678912345')).toMatchInlineSnapshot(
    '-6942069420123456789123450000n',
  )
  expect(etherValue('-6942069420')).toMatchInlineSnapshot(
    '-6942069420000000000000000000n',
  )
  expect(etherValue('-1')).toMatchInlineSnapshot('-1000000000000000000n')
  expect(etherValue('-0.5')).toMatchInlineSnapshot('-500000000000000000n')
  expect(etherValue('-0.1')).toMatchInlineSnapshot('-100000000000000000n')
  expect(etherValue('-0.00000000001')).toMatchInlineSnapshot('-10000000n')
  expect(etherValue('-0.000000000001')).toMatchInlineSnapshot('-1000000n')
  expect(etherValue('-0.0000000000001')).toMatchInlineSnapshot('-100000n')
  expect(etherValue('-0.00000000000001')).toMatchInlineSnapshot('-10000n')
  expect(etherValue('-0.000000000000001')).toMatchInlineSnapshot('-1000n')
  expect(etherValue('-0.0000000000000001')).toMatchInlineSnapshot('-100n')
  expect(etherValue('-0.00000000000000001')).toMatchInlineSnapshot('-10n')
  expect(etherValue('-0.000000000000000001')).toMatchInlineSnapshot('-1n')
})

test('converts ether to gwei', () => {
  expect(etherValue('69420.1234567', 'gwei')).toMatchInlineSnapshot(
    '69420123456700n',
  )
  expect(etherValue('69420', 'gwei')).toMatchInlineSnapshot('69420000000000n')
  expect(etherValue('1', 'gwei')).toMatchInlineSnapshot('1000000000n')
  expect(etherValue('0.5', 'gwei')).toMatchInlineSnapshot('500000000n')
  expect(etherValue('0.1', 'gwei')).toMatchInlineSnapshot('100000000n')
  expect(etherValue('0.01', 'gwei')).toMatchInlineSnapshot('10000000n')
  expect(etherValue('0.001', 'gwei')).toMatchInlineSnapshot('1000000n')
  expect(etherValue('0.0001', 'gwei')).toMatchInlineSnapshot('100000n')
  expect(etherValue('0.00001', 'gwei')).toMatchInlineSnapshot('10000n')
  expect(etherValue('0.000001', 'gwei')).toMatchInlineSnapshot('1000n')
  expect(etherValue('0.0000001', 'gwei')).toMatchInlineSnapshot('100n')
  expect(etherValue('0.00000001', 'gwei')).toMatchInlineSnapshot('10n')
  expect(etherValue('0.000000001', 'gwei')).toMatchInlineSnapshot('1n')

  expect(etherValue('-6942060.123456', 'gwei')).toMatchInlineSnapshot(
    '-6942060123456000n',
  )
  expect(etherValue('-6942069420', 'gwei')).toMatchInlineSnapshot(
    '-6942069420000000000n',
  )
  expect(etherValue('-1', 'gwei')).toMatchInlineSnapshot('-1000000000n')
  expect(etherValue('-0.5', 'gwei')).toMatchInlineSnapshot('-500000000n')
  expect(etherValue('-0.1', 'gwei')).toMatchInlineSnapshot('-100000000n')
  expect(etherValue('-0.01', 'gwei')).toMatchInlineSnapshot('-10000000n')
  expect(etherValue('-0.001', 'gwei')).toMatchInlineSnapshot('-1000000n')
  expect(etherValue('-0.0001', 'gwei')).toMatchInlineSnapshot('-100000n')
  expect(etherValue('-0.00001', 'gwei')).toMatchInlineSnapshot('-10000n')
  expect(etherValue('-0.000001', 'gwei')).toMatchInlineSnapshot('-1000n')
  expect(etherValue('-0.0000001', 'gwei')).toMatchInlineSnapshot('-100n')
  expect(etherValue('-0.00000001', 'gwei')).toMatchInlineSnapshot('-10n')
  expect(etherValue('-0.000000001', 'gwei')).toMatchInlineSnapshot('-1n')
})

test('error: throws if wei cannot be created', () => {
  expect(() => etherValue('0.00000000000000000001')).toThrowError(
    'cannot create a whole number from 0.00000000000000000001 by shifting 18 decimals',
  )
  expect(() => etherValue('0.000000000000000000001')).toThrowError(
    'cannot create a whole number from 0.000000000000000000001 by shifting 18 decimals',
  )
  expect(() => etherValue('-0.00000000000000000001')).toThrowError(
    'cannot create a whole number from -0.00000000000000000001 by shifting 18 decimals',
  )
})

test('error: throws if gwei cannot be created', () => {
  expect(() => etherValue('0.0000000001', 'gwei')).toThrowError(
    'cannot create a whole number from 0.0000000001 by shifting 9 decimals',
  )
  expect(() => etherValue('-0.0000000001', 'gwei')).toThrowError(
    'cannot create a whole number from -0.0000000001 by shifting 9 decimals',
  )
})
