import { describe, expect, test } from 'vitest'

import * as Bytes from './Bytes.js'
import * as Hash from './Hash.js'

describe('keccak256', () => {
  test('default', () => {
    expect(Hash.keccak256('0xdeadbeef')).toBe(
      '0xd4fd4e189132273036449fc9e11198c739161b4c0116a9a2dccdfa1c492006f1',
    )
    expect(
      Hash.keccak256(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toEqual(
      Bytes.fromHex(
        '0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0',
      ),
    )
  })

  test('options: as', () => {
    expect(
      Hash.keccak256(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        { as: 'Hex' },
      ),
    ).toBe('0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0')
    expect(Hash.keccak256('0xdeadbeef', { as: 'Bytes' })).toEqual(
      Bytes.fromHex(
        '0xd4fd4e189132273036449fc9e11198c739161b4c0116a9a2dccdfa1c492006f1',
      ),
    )
  })
})

describe('ripemd160', () => {
  test('default', () => {
    expect(Hash.ripemd160('0xdeadbeef')).toBe(
      '0x226821c2f5423e11fe9af68bd285c249db2e4b5a',
    )
    expect(
      Hash.ripemd160(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toEqual(Bytes.fromHex('0x8476ee4631b9b30ac2754b0ee0c47e161d3f724c'))
  })

  test('options: as', () => {
    expect(
      Hash.ripemd160(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        { as: 'Hex' },
      ),
    ).toBe('0x8476ee4631b9b30ac2754b0ee0c47e161d3f724c')
    expect(Hash.ripemd160('0xdeadbeef', { as: 'Bytes' })).toEqual(
      Bytes.fromHex('0x226821c2f5423e11fe9af68bd285c249db2e4b5a'),
    )
  })
})

describe('sha256', () => {
  test('default', () => {
    expect(Hash.sha256('0xdeadbeef')).toBe(
      '0x5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953',
    )
    expect(
      Hash.sha256(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
      ),
    ).toEqual(
      Bytes.fromHex(
        '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      ),
    )
  })

  test('options: as', () => {
    expect(
      Hash.sha256(
        new Uint8Array([
          72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33,
        ]),
        { as: 'Hex' },
      ),
    ).toBe('0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069')
    expect(Hash.sha256('0xdeadbeef', { as: 'Bytes' })).toEqual(
      Bytes.fromHex(
        '0x5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953',
      ),
    )
  })
})

describe('validate', () => {
  test('default', () => {
    expect(Hash.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBe(
      false,
    )
    expect(Hash.validate('0xa0cf798816d4b9b9866b5330eea46a18382f251e')).toBe(
      false,
    )
    expect(Hash.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678az')).toBe(
      false,
    )
    expect(Hash.validate('0xa5cc3c03994db5b0d9a5eEdD10Cabab0813678aff')).toBe(
      false,
    )
    expect(Hash.validate('a5cc3c03994db5b0d9a5eEdD10Cabab0813678ac')).toBe(
      false,
    )
    expect(
      Hash.validate(
        '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
      ),
    ).toBe(true)
  })
})
