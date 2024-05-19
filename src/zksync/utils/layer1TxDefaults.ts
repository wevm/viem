import { PriorityOpTree, PriorityQueueType } from '../types/priorityQueue.js'

export function layer1TxDefaults(): {
  queueType: PriorityQueueType.Deque
  opTree: PriorityOpTree.Full
} {
  return {
    queueType: PriorityQueueType.Deque,
    opTree: PriorityOpTree.Full,
  }
}
