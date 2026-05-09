import { expect, test } from 'vitest'
import { encodePacked } from '../../index.js'
import { opaqueDataToDepositData } from './opaqueDataToDepositData.js'

test('default', () => {
  const data_1 = {
    mint: 420n,
    value: 69n,
    gas: 21100n,
    isCreation: true,
    data: '0xdeadbeef',
  } as const
  const opaqueData_1 = encodePacked(
    ['uint', 'uint', 'uint64', 'bool', 'bytes'],
    [data_1.mint, data_1.value, data_1.gas, data_1.isCreation, data_1.data],
  )
  expect(opaqueDataToDepositData(opaqueData_1)).toEqual(data_1)

  const data_2 = {
    mint: 0n,
    value: 69n,
    gas: 21100n,
    isCreation: true,
    data: '0xdeadbeef',
  } as const
  const opaqueData_2 = encodePacked(
    ['uint', 'uint', 'uint64', 'bool', 'bytes'],
    [data_2.mint, data_2.value, data_2.gas, data_2.isCreation, data_2.data],
  )
  expect(opaqueDataToDepositData(opaqueData_2)).toEqual(data_2)

  const data_3 = {
    mint: 0n,
    value: 0n,
    gas: 21100n,
    isCreation: true,
    data: '0xdeadbeef',
  } as const
  const opaqueData_3 = encodePacked(
    ['uint', 'uint', 'uint64', 'bool', 'bytes'],
    [data_3.mint, data_3.value, data_3.gas, data_3.isCreation, data_3.data],
  )
  expect(opaqueDataToDepositData(opaqueData_3)).toEqual(data_3)

  const data_4 = {
    mint: 0n,
    value: 0n,
    gas: 0n,
    isCreation: true,
    data: '0xdeadbeef',
  } as const
  const opaqueData_4 = encodePacked(
    ['uint', 'uint', 'uint64', 'bool', 'bytes'],
    [data_4.mint, data_4.value, data_4.gas, data_4.isCreation, data_4.data],
  )
  expect(opaqueDataToDepositData(opaqueData_4)).toEqual(data_4)

  const data_5 = {
    mint: 0n,
    value: 0n,
    gas: 0n,
    isCreation: false,
    data: '0xdeadbeef',
  } as const
  const opaqueData_5 = encodePacked(
    ['uint', 'uint', 'uint64', 'bool', 'bytes'],
    [data_5.mint, data_5.value, data_5.gas, data_5.isCreation, data_5.data],
  )
  expect(opaqueDataToDepositData(opaqueData_5)).toEqual(data_5)

  const data_6 = {
    mint: 0n,
    value: 0n,
    gas: 0n,
    isCreation: false,
    data: '0x',
  } as const
  const opaqueData_6 = encodePacked(
    ['uint', 'uint', 'uint64', 'bool', 'bytes'],
    [data_6.mint, data_6.value, data_6.gas, data_6.isCreation, data_6.data],
  )
  expect(opaqueDataToDepositData(opaqueData_6)).toEqual(data_6)
})
