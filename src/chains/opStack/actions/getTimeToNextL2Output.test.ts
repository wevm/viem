import { expect, test } from 'vitest'
import { publicClientMainnet } from '../../../../test/src/utils.js'
import { http, createPublicClient } from '../../../index.js'
import { optimism } from '../chains.js'
import { getTimeToNextL2Output } from './getTimeToNextL2Output.js'

const l2Client = createPublicClient({
  chain: optimism,
  transport: http(),
})

test('default', async () => {
  const l2BlockNumber = await l2Client.getBlockNumber()
  const { seconds, timestamp } = await getTimeToNextL2Output(
    publicClientMainnet,
    {
      l2BlockNumber,
      targetChain: optimism,
    },
  )
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('nextBlockNumber < l2BlockNumber', async () => {
  const l2BlockNumber = await l2Client.getBlockNumber()
  const { seconds, timestamp } = await getTimeToNextL2Output(
    publicClientMainnet,
    {
      l2BlockNumber: l2BlockNumber + 9999n,
      targetChain: optimism,
    },
  )
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('l2BlockNumber < latestBlockNumber', async () => {
  const { seconds, timestamp } = await getTimeToNextL2Output(
    publicClientMainnet,
    {
      l2BlockNumber: 69420n,
      targetChain: optimism,
    },
  )
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('args: chain', async () => {
  const l2BlockNumber = await l2Client.getBlockNumber()
  const { seconds, timestamp } = await getTimeToNextL2Output(
    publicClientMainnet,
    {
      chain: null,
      l2BlockNumber,
      targetChain: optimism,
    },
  )
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})

test('args: l2OutputOracleAddress', async () => {
  const l2BlockNumber = await l2Client.getBlockNumber()
  const { seconds, timestamp } = await getTimeToNextL2Output(
    publicClientMainnet,
    {
      l2BlockNumber,
      l2OutputOracleAddress: '0xdfe97868233d1aa22e815a266982f2cf17685a27',
    },
  )
  expect(seconds).toBeDefined()
  expect(timestamp).toBeDefined()
})
