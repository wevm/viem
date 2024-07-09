import { describe, expect, test } from 'vitest'
import { PriorityOpTree, PriorityQueueType } from '../../types/priorityQueue.js'
import { layer1TxDefaults } from './layer1TxDefaults.js'

describe('layer1TxDefaults', () => {
  test('returns correct default values', () => {
    const defaults = layer1TxDefaults()

    expect(defaults).toEqual({
      queueType: PriorityQueueType.Deque,
      opTree: PriorityOpTree.Full,
    })
  })

  test('queueType is PriorityQueueType.Deque', () => {
    const defaults = layer1TxDefaults()

    expect(defaults.queueType).toBe(PriorityQueueType.Deque)
  })

  test('opTree is PriorityOpTree.Full', () => {
    const defaults = layer1TxDefaults()

    expect(defaults.opTree).toBe(PriorityOpTree.Full)
  })
})
