import { InvalidStorageKeySizeError } from '../../errors/transaction.js'
import { type AccessList, InvalidAddressError } from '../../index.js'
import { serializeAccessList } from './serializeAccessList.js'
import { describe, expect, test } from 'vitest'

describe('serializeAccessList', () => {
  test('when accessList is empty', () => {
    expect(serializeAccessList([])).toEqual([])
  })

  test('when accessList contains in invalid Address', () => {
    expect(() =>
      serializeAccessList([{ address: '0x123', storageKeys: [] }]),
    ).toThrowError(new InvalidAddressError({ address: '0x123' }))
  })

  test('when accessList contains in invalid Storage Key', () => {
    const badKey = '0xI like cheese'
    expect(() =>
      serializeAccessList([
        {
          address: '0x123',
          storageKeys: [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            badKey,
          ],
        },
      ]),
    ).toThrowError(new InvalidStorageKeySizeError({ storageKey: badKey }))
  })

  test('with valid accessList', () => {
    const accessList: AccessList = [
      {
        address: '0x0000000000000000000000000000000000000000',
        storageKeys: [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        ],
      },
    ]

    expect(serializeAccessList(accessList)).toEqual([
      [
        '0x0000000000000000000000000000000000000000',
        [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
        ],
      ],
    ])
  })
})
