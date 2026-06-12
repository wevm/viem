import { describe, expect, test } from 'vitest'

import * as Value from './Value.js'

describe('format', () => {
  test('default', () => {
    expect(Value.format(69n, 0)).toMatchInlineSnapshot('"69"')
    expect(Value.format(69n, 5)).toMatchInlineSnapshot('"0.00069"')
    expect(Value.format(690n, 1)).toMatchInlineSnapshot('"69"')
    expect(Value.format(1300000n, 5)).toMatchInlineSnapshot('"13"')
    expect(Value.format(4200000000000n, 10)).toMatchInlineSnapshot('"420"')
    expect(Value.format(20000000000n, 9)).toMatchInlineSnapshot('"20"')
    expect(Value.format(40000000000000000000n, 18)).toMatchInlineSnapshot(
      '"40"',
    )
    expect(Value.format(10000000000000n, 18)).toMatchInlineSnapshot('"0.00001"')
    expect(Value.format(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
    expect(Value.format(12345n, 4)).toMatchInlineSnapshot('"1.2345"')
    expect(
      Value.format(6942069420123456789123450000n, 18),
    ).toMatchInlineSnapshot('"6942069420.12345678912345"')
    expect(
      Value.format(
        694212312312306942012345444446789123450000000000000000000000000000000n,
        50,
      ),
    ).toMatchInlineSnapshot('"6942123123123069420.1234544444678912345"')
    expect(Value.format(-690n, 1)).toMatchInlineSnapshot('"-69"')
    expect(Value.format(-1300000n, 5)).toMatchInlineSnapshot('"-13"')
    expect(Value.format(-4200000000000n, 10)).toMatchInlineSnapshot('"-420"')
    expect(Value.format(-20000000000n, 9)).toMatchInlineSnapshot('"-20"')
    expect(Value.format(-40000000000000000000n, 18)).toMatchInlineSnapshot(
      '"-40"',
    )
    expect(Value.format(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
    expect(Value.format(-12345n, 4)).toMatchInlineSnapshot('"-1.2345"')
    expect(
      Value.format(-6942069420123456789123450000n, 18),
    ).toMatchInlineSnapshot('"-6942069420.12345678912345"')
    expect(
      Value.format(
        -694212312312306942012345444446789123450000000000000000000000000000000n,
        50,
      ),
    ).toMatchInlineSnapshot('"-6942123123123069420.1234544444678912345"')
  })

  test('error: invalid decimals', () => {
    expect(() => Value.format(69n, -1)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalsError: \`decimals\` must be a non-negative integer. Got \`-1\`.]`,
    )
    expect(() => Value.format(69n, 1.5)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalsError: \`decimals\` must be a non-negative integer. Got \`1.5\`.]`,
    )
  })
})

describe('from', () => {
  test('default', () => {
    expect(Value.from('69', 1)).toMatchInlineSnapshot('690n')
    expect(Value.from('13', 5)).toMatchInlineSnapshot('1300000n')
    expect(Value.from('420', 10)).toMatchInlineSnapshot('4200000000000n')
    expect(Value.from('20', 9)).toMatchInlineSnapshot('20000000000n')
    expect(Value.from('40', 18)).toMatchInlineSnapshot('40000000000000000000n')
    expect(Value.from('1.2345', 4)).toMatchInlineSnapshot('12345n')
    expect(Value.from('1.0045', 4)).toMatchInlineSnapshot('10045n')
    expect(Value.from('1.2345000', 4)).toMatchInlineSnapshot('12345n')
    expect(Value.from('6942069420.12345678912345', 18)).toMatchInlineSnapshot(
      '6942069420123456789123450000n',
    )
    expect(Value.from('6942069420.00045678912345', 18)).toMatchInlineSnapshot(
      '6942069420000456789123450000n',
    )
    expect(
      Value.from('6942123123123069420.1234544444678912345', 50),
    ).toMatchInlineSnapshot(
      '694212312312306942012345444446789123450000000000000000000000000000000n',
    )
    expect(Value.from('-69', 1)).toMatchInlineSnapshot('-690n')
    expect(Value.from('-1.2345', 4)).toMatchInlineSnapshot('-12345n')
    expect(Value.from('-6942069420.12345678912345', 18)).toMatchInlineSnapshot(
      '-6942069420123456789123450000n',
    )
    expect(
      Value.from('-6942123123123069420.1234544444678912345', 50),
    ).toMatchInlineSnapshot(
      '-694212312312306942012345444446789123450000000000000000000000000000000n',
    )
  })

  test('decimals === 0', () => {
    expect(
      Value.from('69.2352112312312451512412341231', 0),
    ).toMatchInlineSnapshot('69n')
    expect(
      Value.from('69.5952141234124125231523412312', 0),
    ).toMatchInlineSnapshot('70n')
    expect(Value.from('12301000000000000020000', 0)).toMatchInlineSnapshot(
      '12301000000000000020000n',
    )
    expect(Value.from('12301000000000000020000.123', 0)).toMatchInlineSnapshot(
      '12301000000000000020000n',
    )
    expect(Value.from('12301000000000000020000.5', 0)).toMatchInlineSnapshot(
      '12301000000000000020001n',
    )
    expect(Value.from('99999999999999999999999.5', 0)).toMatchInlineSnapshot(
      '100000000000000000000000n',
    )
  })

  test('decimals < fraction length', () => {
    expect(Value.from('69.23521', 0)).toMatchInlineSnapshot('69n')
    expect(Value.from('69.56789', 0)).toMatchInlineSnapshot('70n')
    expect(Value.from('69.23521', 1)).toMatchInlineSnapshot('692n')
    expect(Value.from('69.23521', 2)).toMatchInlineSnapshot('6924n')
    expect(Value.from('69.23221', 2)).toMatchInlineSnapshot('6923n')
    expect(Value.from('69.23261', 3)).toMatchInlineSnapshot('69233n')
    expect(Value.from('999999.99999', 3)).toMatchInlineSnapshot('1000000000n')
    expect(Value.from('699999.99999', 3)).toMatchInlineSnapshot('700000000n')
    expect(Value.from('699999.98999', 3)).toMatchInlineSnapshot('699999990n')
    expect(Value.from('699959.99999', 3)).toMatchInlineSnapshot('699960000n')
    expect(Value.from('699099.99999', 3)).toMatchInlineSnapshot('699100000n')
    expect(Value.from('100000.000999', 3)).toMatchInlineSnapshot('100000001n')
    expect(Value.from('100000.990999', 3)).toMatchInlineSnapshot('100000991n')
    expect(Value.from('69.00221', 3)).toMatchInlineSnapshot('69002n')
    expect(Value.from('1.0536059576998882', 7)).toMatchInlineSnapshot(
      '10536060n',
    )
    expect(Value.from('1.0053059576998882', 7)).toMatchInlineSnapshot(
      '10053060n',
    )
    expect(Value.from('1.0000000900000000', 7)).toMatchInlineSnapshot(
      '10000001n',
    )
    expect(Value.from('1.0000009900000000', 7)).toMatchInlineSnapshot(
      '10000010n',
    )
    expect(Value.from('1.0000099900000000', 7)).toMatchInlineSnapshot(
      '10000100n',
    )
    expect(Value.from('1.0000092900000000', 7)).toMatchInlineSnapshot(
      '10000093n',
    )
    expect(Value.from('1.5536059576998882', 7)).toMatchInlineSnapshot(
      '15536060n',
    )
    expect(Value.from('1.0536059476998882', 7)).toMatchInlineSnapshot(
      '10536059n',
    )
    expect(Value.from('1.4545454545454545', 7)).toMatchInlineSnapshot(
      '14545455n',
    )
    expect(Value.from('1.1234567891234567', 7)).toMatchInlineSnapshot(
      '11234568n',
    )
    expect(Value.from('1.8989898989898989', 7)).toMatchInlineSnapshot(
      '18989899n',
    )
    expect(Value.from('9.9999999999999999', 7)).toMatchInlineSnapshot(
      '100000000n',
    )
    expect(Value.from('0.0536059576998882', 7)).toMatchInlineSnapshot('536060n')
    expect(Value.from('0.0053059576998882', 7)).toMatchInlineSnapshot('53060n')
    expect(Value.from('0.0000000900000000', 7)).toMatchInlineSnapshot('1n')
    expect(Value.from('0.0000009900000000', 7)).toMatchInlineSnapshot('10n')
    expect(Value.from('0.0000099900000000', 7)).toMatchInlineSnapshot('100n')
    expect(Value.from('0.0000092900000000', 7)).toMatchInlineSnapshot('93n')
    expect(Value.from('0.0999999999999999', 7)).toMatchInlineSnapshot(
      '1000000n',
    )
    expect(Value.from('0.0099999999999999', 7)).toMatchInlineSnapshot('100000n')
    expect(Value.from('0.00000000059', 9)).toMatchInlineSnapshot('1n')
    expect(Value.from('0.0000000003', 9)).toMatchInlineSnapshot('0n')
    expect(Value.from('69.00000000000', 9)).toMatchInlineSnapshot(
      '69000000000n',
    )
    expect(Value.from('69.00000000019', 9)).toMatchInlineSnapshot(
      '69000000000n',
    )
    expect(Value.from('69.00000000059', 9)).toMatchInlineSnapshot(
      '69000000001n',
    )
    expect(Value.from('69.59000000059', 9)).toMatchInlineSnapshot(
      '69590000001n',
    )
    expect(Value.from('69.59000002359', 9)).toMatchInlineSnapshot(
      '69590000024n',
    )
  })

  test('error: invalid decimal number', () => {
    expect(() =>
      Value.from('123.456.789', 18),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`123.456.789\` is not a valid decimal number.]`,
    )
    expect(() => Value.from('', 18)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`\` is not a valid decimal number.]`,
    )
    expect(() => Value.from('.', 18)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`.\` is not a valid decimal number.]`,
    )
    expect(() => Value.from('-', 18)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`-\` is not a valid decimal number.]`,
    )
    expect(() => Value.from('-.', 18)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`-.\` is not a valid decimal number.]`,
    )
  })

  test('error: invalid decimals', () => {
    expect(() => Value.from('1', -1)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalsError: \`decimals\` must be a non-negative integer. Got \`-1\`.]`,
    )
    expect(() => Value.from('1', 1.5)).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalsError: \`decimals\` must be a non-negative integer. Got \`1.5\`.]`,
    )
  })
})

describe('formatEther', () => {
  test('default', () => {
    expect(
      Value.formatEther(6942069420123456789123450000n),
    ).toMatchInlineSnapshot('"6942069420.12345678912345"')
    expect(
      Value.formatEther(6942069420000000000000000000n),
    ).toMatchInlineSnapshot('"6942069420"')
    expect(Value.formatEther(1000000000000000000000000n)).toMatchInlineSnapshot(
      '"1000000"',
    )
    expect(Value.formatEther(100000000000000000000000n)).toMatchInlineSnapshot(
      '"100000"',
    )
    expect(Value.formatEther(10000000000000000000000n)).toMatchInlineSnapshot(
      '"10000"',
    )
    expect(Value.formatEther(1000000000000000000000n)).toMatchInlineSnapshot(
      '"1000"',
    )
    expect(Value.formatEther(100000000000000000000n)).toMatchInlineSnapshot(
      '"100"',
    )
    expect(Value.formatEther(10000000000000000000n)).toMatchInlineSnapshot(
      '"10"',
    )
    expect(Value.formatEther(1000000000000000000n)).toMatchInlineSnapshot('"1"')
    expect(Value.formatEther(500000000000000000n)).toMatchInlineSnapshot(
      '"0.5"',
    )
    expect(Value.formatEther(100000000000000000n)).toMatchInlineSnapshot(
      '"0.1"',
    )
    expect(Value.formatEther(10000000000000000n)).toMatchInlineSnapshot(
      '"0.01"',
    )
    expect(Value.formatEther(1000000000000000n)).toMatchInlineSnapshot(
      '"0.001"',
    )
    expect(Value.formatEther(100000000000000n)).toMatchInlineSnapshot(
      '"0.0001"',
    )
    expect(Value.formatEther(10000000000000n)).toMatchInlineSnapshot(
      '"0.00001"',
    )
    expect(Value.formatEther(1000000000000n)).toMatchInlineSnapshot(
      '"0.000001"',
    )
    expect(Value.formatEther(100000000000n)).toMatchInlineSnapshot(
      '"0.0000001"',
    )
    expect(Value.formatEther(10000000000n)).toMatchInlineSnapshot(
      '"0.00000001"',
    )
    expect(Value.formatEther(1000000000n)).toMatchInlineSnapshot(
      '"0.000000001"',
    )
    expect(Value.formatEther(100000000n)).toMatchInlineSnapshot(
      '"0.0000000001"',
    )
    expect(Value.formatEther(10000000n)).toMatchInlineSnapshot(
      '"0.00000000001"',
    )
    expect(Value.formatEther(1000000n)).toMatchInlineSnapshot(
      '"0.000000000001"',
    )
    expect(Value.formatEther(100000n)).toMatchInlineSnapshot(
      '"0.0000000000001"',
    )
    expect(Value.formatEther(10000n)).toMatchInlineSnapshot(
      '"0.00000000000001"',
    )
    expect(Value.formatEther(1000n)).toMatchInlineSnapshot(
      '"0.000000000000001"',
    )
    expect(Value.formatEther(100n)).toMatchInlineSnapshot(
      '"0.0000000000000001"',
    )
    expect(Value.formatEther(10n)).toMatchInlineSnapshot(
      '"0.00000000000000001"',
    )
    expect(Value.formatEther(1n)).toMatchInlineSnapshot(
      '"0.000000000000000001"',
    )
    expect(Value.formatEther(0n)).toMatchInlineSnapshot('"0"')
    expect(
      Value.formatEther(-6942069420123456789123450000n),
    ).toMatchInlineSnapshot('"-6942069420.12345678912345"')
    expect(
      Value.formatEther(-6942069420000000000000000000n),
    ).toMatchInlineSnapshot('"-6942069420"')
    expect(Value.formatEther(-1000000000000000000n)).toMatchInlineSnapshot(
      '"-1"',
    )
    expect(Value.formatEther(-500000000000000000n)).toMatchInlineSnapshot(
      '"-0.5"',
    )
    expect(Value.formatEther(-100000000000000000n)).toMatchInlineSnapshot(
      '"-0.1"',
    )
    expect(Value.formatEther(-10000000n)).toMatchInlineSnapshot(
      '"-0.00000000001"',
    )
    expect(Value.formatEther(-1000000n)).toMatchInlineSnapshot(
      '"-0.000000000001"',
    )
    expect(Value.formatEther(-100000n)).toMatchInlineSnapshot(
      '"-0.0000000000001"',
    )
    expect(Value.formatEther(-10000n)).toMatchInlineSnapshot(
      '"-0.00000000000001"',
    )
    expect(Value.formatEther(-1000n)).toMatchInlineSnapshot(
      '"-0.000000000000001"',
    )
    expect(Value.formatEther(-100n)).toMatchInlineSnapshot(
      '"-0.0000000000000001"',
    )
    expect(Value.formatEther(-10n)).toMatchInlineSnapshot(
      '"-0.00000000000000001"',
    )
    expect(Value.formatEther(-1n)).toMatchInlineSnapshot(
      '"-0.000000000000000001"',
    )
  })

  test('args: unit', () => {
    expect(Value.formatEther(69420123456700n, 'gwei')).toMatchInlineSnapshot(
      '"69420.1234567"',
    )
    expect(Value.formatEther(69420000000000n, 'gwei')).toMatchInlineSnapshot(
      '"69420"',
    )
    expect(Value.formatEther(1000000000n, 'gwei')).toMatchInlineSnapshot('"1"')
    expect(Value.formatEther(500000000n, 'gwei')).toMatchInlineSnapshot('"0.5"')
    expect(Value.formatEther(100000000n, 'gwei')).toMatchInlineSnapshot('"0.1"')
    expect(Value.formatEther(10000000n, 'gwei')).toMatchInlineSnapshot('"0.01"')
    expect(Value.formatEther(1000000n, 'gwei')).toMatchInlineSnapshot('"0.001"')
    expect(Value.formatEther(100000n, 'gwei')).toMatchInlineSnapshot('"0.0001"')
    expect(Value.formatEther(10000n, 'gwei')).toMatchInlineSnapshot('"0.00001"')
    expect(Value.formatEther(1000n, 'gwei')).toMatchInlineSnapshot('"0.000001"')
    expect(Value.formatEther(100n, 'gwei')).toMatchInlineSnapshot('"0.0000001"')
    expect(Value.formatEther(10n, 'gwei')).toMatchInlineSnapshot('"0.00000001"')
    expect(Value.formatEther(1n, 'gwei')).toMatchInlineSnapshot('"0.000000001"')
    expect(Value.formatEther(-69420123456700n, 'gwei')).toMatchInlineSnapshot(
      '"-69420.1234567"',
    )
    expect(Value.formatEther(-69420000000000n, 'gwei')).toMatchInlineSnapshot(
      '"-69420"',
    )
    expect(Value.formatEther(-1000000000n, 'gwei')).toMatchInlineSnapshot(
      '"-1"',
    )
    expect(Value.formatEther(-500000000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.5"',
    )
    expect(Value.formatEther(-100000000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.1"',
    )
    expect(Value.formatEther(-10000000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.01"',
    )
    expect(Value.formatEther(-1000000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.001"',
    )
    expect(Value.formatEther(-100000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.0001"',
    )
    expect(Value.formatEther(-10000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.00001"',
    )
    expect(Value.formatEther(-1000n, 'gwei')).toMatchInlineSnapshot(
      '"-0.000001"',
    )
    expect(Value.formatEther(-100n, 'gwei')).toMatchInlineSnapshot(
      '"-0.0000001"',
    )
    expect(Value.formatEther(-10n, 'gwei')).toMatchInlineSnapshot(
      '"-0.00000001"',
    )
    expect(Value.formatEther(-1n, 'gwei')).toMatchInlineSnapshot(
      '"-0.000000001"',
    )
  })
})

describe('fromEther', () => {
  test('default', () => {
    expect(Value.fromEther('6942069420.12345678912345')).toMatchInlineSnapshot(
      '6942069420123456789123450000n',
    )
    expect(Value.fromEther('6942069420')).toMatchInlineSnapshot(
      '6942069420000000000000000000n',
    )
    expect(Value.fromEther('1')).toMatchInlineSnapshot('1000000000000000000n')
    expect(Value.fromEther('0.5')).toMatchInlineSnapshot('500000000000000000n')
    expect(Value.fromEther('0.1')).toMatchInlineSnapshot('100000000000000000n')
    expect(Value.fromEther('0.01')).toMatchInlineSnapshot('10000000000000000n')
    expect(Value.fromEther('0.001')).toMatchInlineSnapshot('1000000000000000n')
    expect(Value.fromEther('0.0001')).toMatchInlineSnapshot('100000000000000n')
    expect(Value.fromEther('0.00001')).toMatchInlineSnapshot('10000000000000n')
    expect(Value.fromEther('0.00000000001')).toMatchInlineSnapshot('10000000n')
    expect(Value.fromEther('0.000000000001')).toMatchInlineSnapshot('1000000n')
    expect(Value.fromEther('0.0000000000001')).toMatchInlineSnapshot('100000n')
    expect(Value.fromEther('0.00000000000001')).toMatchInlineSnapshot('10000n')
    expect(Value.fromEther('0.000000000000001')).toMatchInlineSnapshot('1000n')
    expect(Value.fromEther('0.0000000000000001')).toMatchInlineSnapshot('100n')
    expect(Value.fromEther('0.00000000000000001')).toMatchInlineSnapshot('10n')
    expect(Value.fromEther('0.000000000000000001')).toMatchInlineSnapshot('1n')
    expect(Value.fromEther('-6942069420.12345678912345')).toMatchInlineSnapshot(
      '-6942069420123456789123450000n',
    )
    expect(Value.fromEther('-6942069420')).toMatchInlineSnapshot(
      '-6942069420000000000000000000n',
    )
    expect(Value.fromEther('-1')).toMatchInlineSnapshot('-1000000000000000000n')
    expect(Value.fromEther('-0.5')).toMatchInlineSnapshot(
      '-500000000000000000n',
    )
    expect(Value.fromEther('-0.1')).toMatchInlineSnapshot(
      '-100000000000000000n',
    )
    expect(Value.fromEther('-0.00000000001')).toMatchInlineSnapshot(
      '-10000000n',
    )
    expect(Value.fromEther('-0.000000000001')).toMatchInlineSnapshot(
      '-1000000n',
    )
    expect(Value.fromEther('-0.0000000000001')).toMatchInlineSnapshot(
      '-100000n',
    )
    expect(Value.fromEther('-0.00000000000001')).toMatchInlineSnapshot(
      '-10000n',
    )
    expect(Value.fromEther('-0.000000000000001')).toMatchInlineSnapshot(
      '-1000n',
    )
    expect(Value.fromEther('-0.0000000000000001')).toMatchInlineSnapshot(
      '-100n',
    )
    expect(Value.fromEther('-0.00000000000000001')).toMatchInlineSnapshot(
      '-10n',
    )
    expect(Value.fromEther('-0.000000000000000001')).toMatchInlineSnapshot(
      '-1n',
    )
  })

  test('args: unit', () => {
    expect(Value.fromEther('69420.1234567', 'gwei')).toMatchInlineSnapshot(
      '69420123456700n',
    )
    expect(Value.fromEther('69420', 'gwei')).toMatchInlineSnapshot(
      '69420000000000n',
    )
    expect(Value.fromEther('1', 'gwei')).toMatchInlineSnapshot('1000000000n')
    expect(Value.fromEther('0.5', 'gwei')).toMatchInlineSnapshot('500000000n')
    expect(Value.fromEther('0.1', 'gwei')).toMatchInlineSnapshot('100000000n')
    expect(Value.fromEther('0.01', 'gwei')).toMatchInlineSnapshot('10000000n')
    expect(Value.fromEther('0.001', 'gwei')).toMatchInlineSnapshot('1000000n')
    expect(Value.fromEther('0.0001', 'gwei')).toMatchInlineSnapshot('100000n')
    expect(Value.fromEther('0.00001', 'gwei')).toMatchInlineSnapshot('10000n')
    expect(Value.fromEther('0.000001', 'gwei')).toMatchInlineSnapshot('1000n')
    expect(Value.fromEther('0.0000001', 'gwei')).toMatchInlineSnapshot('100n')
    expect(Value.fromEther('0.00000001', 'gwei')).toMatchInlineSnapshot('10n')
    expect(Value.fromEther('0.000000001', 'gwei')).toMatchInlineSnapshot('1n')

    expect(Value.fromEther('-6942060.123456', 'gwei')).toMatchInlineSnapshot(
      '-6942060123456000n',
    )
    expect(Value.fromEther('-6942069420', 'gwei')).toMatchInlineSnapshot(
      '-6942069420000000000n',
    )
    expect(Value.fromEther('-1', 'gwei')).toMatchInlineSnapshot('-1000000000n')
    expect(Value.fromEther('-0.5', 'gwei')).toMatchInlineSnapshot('-500000000n')
    expect(Value.fromEther('-0.1', 'gwei')).toMatchInlineSnapshot('-100000000n')
    expect(Value.fromEther('-0.01', 'gwei')).toMatchInlineSnapshot('-10000000n')
    expect(Value.fromEther('-0.001', 'gwei')).toMatchInlineSnapshot('-1000000n')
    expect(Value.fromEther('-0.0001', 'gwei')).toMatchInlineSnapshot('-100000n')
    expect(Value.fromEther('-0.00001', 'gwei')).toMatchInlineSnapshot('-10000n')
    expect(Value.fromEther('-0.000001', 'gwei')).toMatchInlineSnapshot('-1000n')
    expect(Value.fromEther('-0.0000001', 'gwei')).toMatchInlineSnapshot('-100n')
    expect(Value.fromEther('-0.00000001', 'gwei')).toMatchInlineSnapshot('-10n')
    expect(Value.fromEther('-0.000000001', 'gwei')).toMatchInlineSnapshot('-1n')
  })

  test('rounding (unit: gwei)', () => {
    expect(Value.fromEther('0.0000000001', 'gwei')).toMatchInlineSnapshot('0n')
    expect(Value.fromEther('0.00000000059', 'gwei')).toMatchInlineSnapshot('1n')
    expect(Value.fromEther('1.00000000059', 'gwei')).toMatchInlineSnapshot(
      '1000000001n',
    )
    expect(Value.fromEther('69.59000000059', 'gwei')).toMatchInlineSnapshot(
      '69590000001n',
    )
    expect(Value.fromEther('1.2345678912345222', 'gwei')).toMatchInlineSnapshot(
      '1234567891n',
    )
    expect(Value.fromEther('-0.0000000001', 'gwei')).toMatchInlineSnapshot('0n')
    expect(Value.fromEther('-0.00000000059', 'gwei')).toMatchInlineSnapshot(
      '-1n',
    )
    expect(Value.fromEther('-1.00000000059', 'gwei')).toMatchInlineSnapshot(
      '-1000000001n',
    )
    expect(Value.fromEther('-69.59000000059', 'gwei')).toMatchInlineSnapshot(
      '-69590000001n',
    )
    expect(
      Value.fromEther('-1.2345678912345222', 'gwei'),
    ).toMatchInlineSnapshot('-1234567891n')
  })

  test('rounding (unit: wei)', () => {
    expect(Value.fromEther('0.0000000000000000001')).toMatchInlineSnapshot('0n')
    expect(Value.fromEther('0.00000000000000000059')).toMatchInlineSnapshot(
      '1n',
    )
    expect(Value.fromEther('1.00000000000000000059')).toMatchInlineSnapshot(
      '1000000000000000001n',
    )
    expect(Value.fromEther('69.59000000000000000059')).toMatchInlineSnapshot(
      '69590000000000000001n',
    )
    expect(
      Value.fromEther('1.2345678000000000912345222'),
    ).toMatchInlineSnapshot('1234567800000000091n')
    expect(Value.fromEther('-0.0000000000000000001')).toMatchInlineSnapshot(
      '0n',
    )
    expect(Value.fromEther('-0.00000000000000000059')).toMatchInlineSnapshot(
      '-1n',
    )
    expect(Value.fromEther('-1.00000000000000000059')).toMatchInlineSnapshot(
      '-1000000000000000001n',
    )
    expect(Value.fromEther('-69.59000000000000000059')).toMatchInlineSnapshot(
      '-69590000000000000001n',
    )
    expect(
      Value.fromEther('-1.2345678000000000912345222'),
    ).toMatchInlineSnapshot('-1234567800000000091n')
  })

  test('error: invalid decimal number', () => {
    expect(() =>
      Value.fromEther('123.456.789'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`123.456.789\` is not a valid decimal number.]`,
    )
  })
})

describe('formatGwei', () => {
  test('default', () => {
    expect(Value.formatGwei(69420123456700n)).toMatchInlineSnapshot(
      '"69420.1234567"',
    )
    expect(Value.formatGwei(69420000000000n)).toMatchInlineSnapshot('"69420"')
    expect(Value.formatGwei(1000000000n)).toMatchInlineSnapshot('"1"')
    expect(Value.formatGwei(500000000n)).toMatchInlineSnapshot('"0.5"')
    expect(Value.formatGwei(100000000n)).toMatchInlineSnapshot('"0.1"')
    expect(Value.formatGwei(10000000n)).toMatchInlineSnapshot('"0.01"')
    expect(Value.formatGwei(1000000n)).toMatchInlineSnapshot('"0.001"')
    expect(Value.formatGwei(100000n)).toMatchInlineSnapshot('"0.0001"')
    expect(Value.formatGwei(10000n)).toMatchInlineSnapshot('"0.00001"')
    expect(Value.formatGwei(1000n)).toMatchInlineSnapshot('"0.000001"')
    expect(Value.formatGwei(100n)).toMatchInlineSnapshot('"0.0000001"')
    expect(Value.formatGwei(10n)).toMatchInlineSnapshot('"0.00000001"')
    expect(Value.formatGwei(1n)).toMatchInlineSnapshot('"0.000000001"')
    expect(Value.formatGwei(-69420123456700n)).toMatchInlineSnapshot(
      '"-69420.1234567"',
    )
    expect(Value.formatGwei(-69420000000000n)).toMatchInlineSnapshot('"-69420"')
    expect(Value.formatGwei(-1000000000n)).toMatchInlineSnapshot('"-1"')
    expect(Value.formatGwei(-500000000n)).toMatchInlineSnapshot('"-0.5"')
    expect(Value.formatGwei(-100000000n)).toMatchInlineSnapshot('"-0.1"')
    expect(Value.formatGwei(-10000000n)).toMatchInlineSnapshot('"-0.01"')
    expect(Value.formatGwei(-1000000n)).toMatchInlineSnapshot('"-0.001"')
    expect(Value.formatGwei(-100000n)).toMatchInlineSnapshot('"-0.0001"')
    expect(Value.formatGwei(-10000n)).toMatchInlineSnapshot('"-0.00001"')
    expect(Value.formatGwei(-1000n)).toMatchInlineSnapshot('"-0.000001"')
    expect(Value.formatGwei(-100n)).toMatchInlineSnapshot('"-0.0000001"')
    expect(Value.formatGwei(-10n)).toMatchInlineSnapshot('"-0.00000001"')
    expect(Value.formatGwei(-1n)).toMatchInlineSnapshot('"-0.000000001"')
  })
})

describe('fromGwei', () => {
  test('default', () => {
    expect(Value.fromGwei('69420.1234567')).toMatchInlineSnapshot(
      '69420123456700n',
    )
    expect(Value.fromGwei('69420')).toMatchInlineSnapshot('69420000000000n')
    expect(Value.fromGwei('1')).toMatchInlineSnapshot('1000000000n')
    expect(Value.fromGwei('0.5')).toMatchInlineSnapshot('500000000n')
    expect(Value.fromGwei('0.1')).toMatchInlineSnapshot('100000000n')
    expect(Value.fromGwei('0.01')).toMatchInlineSnapshot('10000000n')
    expect(Value.fromGwei('0.001')).toMatchInlineSnapshot('1000000n')
    expect(Value.fromGwei('0.0001')).toMatchInlineSnapshot('100000n')
    expect(Value.fromGwei('0.00001')).toMatchInlineSnapshot('10000n')
    expect(Value.fromGwei('0.000001')).toMatchInlineSnapshot('1000n')
    expect(Value.fromGwei('0.0000001')).toMatchInlineSnapshot('100n')
    expect(Value.fromGwei('0.00000001')).toMatchInlineSnapshot('10n')
    expect(Value.fromGwei('0.000000001')).toMatchInlineSnapshot('1n')

    expect(Value.fromGwei('-6942060.123456')).toMatchInlineSnapshot(
      '-6942060123456000n',
    )
    expect(Value.fromGwei('-6942069420')).toMatchInlineSnapshot(
      '-6942069420000000000n',
    )
    expect(Value.fromGwei('-1')).toMatchInlineSnapshot('-1000000000n')
    expect(Value.fromGwei('-0.5')).toMatchInlineSnapshot('-500000000n')
    expect(Value.fromGwei('-0.1')).toMatchInlineSnapshot('-100000000n')
    expect(Value.fromGwei('-0.01')).toMatchInlineSnapshot('-10000000n')
    expect(Value.fromGwei('-0.001')).toMatchInlineSnapshot('-1000000n')
    expect(Value.fromGwei('-0.0001')).toMatchInlineSnapshot('-100000n')
    expect(Value.fromGwei('-0.00001')).toMatchInlineSnapshot('-10000n')
    expect(Value.fromGwei('-0.000001')).toMatchInlineSnapshot('-1000n')
    expect(Value.fromGwei('-0.0000001')).toMatchInlineSnapshot('-100n')
    expect(Value.fromGwei('-0.00000001')).toMatchInlineSnapshot('-10n')
    expect(Value.fromGwei('-0.000000001')).toMatchInlineSnapshot('-1n')
  })

  test('rounding', () => {
    expect(Value.fromGwei('0.0000000001')).toMatchInlineSnapshot('0n')
    expect(Value.fromGwei('0.00000000059')).toMatchInlineSnapshot('1n')
    expect(Value.fromGwei('1.00000000059')).toMatchInlineSnapshot('1000000001n')
    expect(Value.fromGwei('69.59000000059')).toMatchInlineSnapshot(
      '69590000001n',
    )
    expect(Value.fromGwei('1.2345678912345222')).toMatchInlineSnapshot(
      '1234567891n',
    )
    expect(Value.fromGwei('-0.0000000001')).toMatchInlineSnapshot('0n')
    expect(Value.fromGwei('-0.00000000059')).toMatchInlineSnapshot('-1n')
    expect(Value.fromGwei('-1.00000000059')).toMatchInlineSnapshot(
      '-1000000001n',
    )
    expect(Value.fromGwei('-69.59000000059')).toMatchInlineSnapshot(
      '-69590000001n',
    )
    expect(Value.fromGwei('-1.2345678912345222')).toMatchInlineSnapshot(
      '-1234567891n',
    )
  })

  test('error: invalid decimal number', () => {
    expect(() =>
      Value.fromGwei('123.456.789'),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Value.InvalidDecimalNumberError: Value \`123.456.789\` is not a valid decimal number.]`,
    )
  })
})
