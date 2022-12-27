import { expect, test } from 'vitest'

import { accounts, initialBlockNumber, publicClient } from '../../../test'
import { parseEther, parseGwei } from '../../utils'
import { estimateGas } from './estimateGas'

const wethContractAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

test('estimates gas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: blockNumber', async () => {
  expect(
    await estimateGas(publicClient, {
      blockNumber: initialBlockNumber,
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: data', async () => {
  expect(
    await estimateGas(publicClient, {
      data: '0x00000000000000000000000000000000000000000000000004fefa17b7240000',
      from: accounts[0].address,
      to: wethContractAddress,
    }),
  ).toMatchInlineSnapshot('26145n')
})

test('args: gasPrice', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      gasPrice: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxFeePerGas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      maxFeePerGas: parseGwei('33'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: maxPriorityFeePerGas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      maxPriorityFeePerGas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})

test('args: gas', async () => {
  expect(
    await estimateGas(publicClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      gas: parseGwei('2'),
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot('21000n')
})
