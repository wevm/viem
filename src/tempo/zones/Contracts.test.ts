import { describe, expect, test } from 'vitest'
import * as Contracts from './Contracts.js'

describe('Zone contracts', () => {
  test('pairs system addresses with current ABIs', () => {
    expect(Contracts.systemContracts).toHaveLength(5)
    expect(
      Contracts.portalImplementation.abi.some(
        (item) => item.type === 'function' && item.name === 'submitBatch',
      ),
    ).toBe(true)
    expect(
      Contracts.messenger.abi.some(
        (item) => item.type === 'function' && item.name === 'relayMessage',
      ),
    ).toBe(true)
    expect(
      Contracts.verifier.abi.some(
        (item) => item.type === 'function' && item.name === 'verify',
      ),
    ).toBe(true)
  })
})
