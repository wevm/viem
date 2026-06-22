import { describe, expect, test } from 'vitest'

import * as NodeError from './NodeError.js'

describe('ExecutionRevertedError', () => {
  test('with reason', () => {
    expect(
      new NodeError.ExecutionRevertedError({
        message: 'execution reverted: bad',
      }).message,
    ).toMatchInlineSnapshot(`
      "Execution reverted with reason: bad.

      Version: viem@2.52.1"
    `)
  })

  test('without reason', () => {
    expect(new NodeError.ExecutionRevertedError().message)
      .toMatchInlineSnapshot(`
      "Execution reverted for an unknown reason.

      Version: viem@2.52.1"
    `)
  })
})

describe('FeeCapTooHighError', () => {
  test('with maxFeePerGas', () => {
    expect(
      new NodeError.FeeCapTooHighError({ maxFeePerGas: 70000000000n }).message,
    ).toMatchInlineSnapshot(`
      "The fee cap (\`maxFeePerGas\` = 70 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@2.52.1"
    `)
  })

  test('without maxFeePerGas', () => {
    expect(new NodeError.FeeCapTooHighError().message).toContain('The fee cap')
  })
})

describe('FeeCapTooLowError', () => {
  test('default', () => {
    expect(
      new NodeError.FeeCapTooLowError({ maxFeePerGas: 1n }).message,
    ).toContain('cannot be lower than the block base fee')
  })
})

describe('NonceTooHighError', () => {
  test('with nonce', () => {
    expect(new NodeError.NonceTooHighError({ nonce: 5 }).message).toContain(
      '(5)',
    )
  })
  test('without nonce', () => {
    expect(new NodeError.NonceTooHighError().message).toContain(
      'higher than the next one expected',
    )
  })
})

describe('NonceTooLowError', () => {
  test('with nonce', () => {
    expect(new NodeError.NonceTooLowError({ nonce: 5 }).message).toContain(
      '(5)',
    )
  })
})

describe('NonceMaxValueError', () => {
  test('with nonce', () => {
    expect(new NodeError.NonceMaxValueError({ nonce: 5 }).message).toContain(
      '(5)',
    )
  })
})

describe('InsufficientFundsError', () => {
  test('default', () => {
    expect(new NodeError.InsufficientFundsError().message).toContain(
      'exceeds the balance of the account',
    )
  })
})

describe('IntrinsicGasTooHighError', () => {
  test('with gas', () => {
    expect(
      new NodeError.IntrinsicGasTooHighError({ gas: 21000n }).message,
    ).toContain('(21000)')
  })
  test('without gas', () => {
    expect(new NodeError.IntrinsicGasTooHighError().message).toContain(
      'exceeds the limit allowed for the block',
    )
  })
})

describe('IntrinsicGasTooLowError', () => {
  test('with gas', () => {
    expect(
      new NodeError.IntrinsicGasTooLowError({ gas: 1n }).message,
    ).toContain('(1)')
  })
  test('without gas', () => {
    expect(new NodeError.IntrinsicGasTooLowError().message).toContain('too low')
  })
})

describe('TransactionTypeNotSupportedError', () => {
  test('default', () => {
    expect(new NodeError.TransactionTypeNotSupportedError().message).toContain(
      'transaction type is not supported',
    )
  })
})

describe('TipAboveFeeCapError', () => {
  test('with fees', () => {
    expect(
      new NodeError.TipAboveFeeCapError({
        maxFeePerGas: 2000000000n,
        maxPriorityFeePerGas: 3000000000n,
      }).message,
    ).toMatchInlineSnapshot(`
      "The provided tip (\`maxPriorityFeePerGas\` = 3 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 2 gwei).

      Version: viem@2.52.1"
    `)
  })

  test('without fees', () => {
    expect(new NodeError.TipAboveFeeCapError().message).toContain(
      'The provided tip',
    )
  })
})

describe('UnknownNodeError', () => {
  test('uses cause shortMessage', () => {
    const cause = Object.assign(new Error('full'), { shortMessage: 'short' })
    expect(new NodeError.UnknownNodeError({ cause }).message).toContain('short')
  })

  test('falls back to cause message', () => {
    expect(
      new NodeError.UnknownNodeError({ cause: new Error('boom') }).message,
    ).toContain('boom')
  })
})

describe('fromRpcError', () => {
  test('execution reverted via nested data.code', () => {
    const error = Object.assign(new Error('rpc failed'), {
      data: {
        code: 3,
        message: 'execution reverted: ERC721: nonexistent token',
      },
    })
    const result = NodeError.fromRpcError(error)
    expect(result).toBeInstanceOf(NodeError.ExecutionRevertedError)
    expect(result.message).toMatchInlineSnapshot(`
      "Execution reverted with reason: ERC721: nonexistent token.

      Details: rpc failed
      Version: viem@2.52.1"
    `)
  })

  test('execution reverted via message regex', () => {
    expect(
      NodeError.fromRpcError(new Error('execution reverted')),
    ).toBeInstanceOf(NodeError.ExecutionRevertedError)
  })

  test('execution reverted via top-level code', () => {
    expect(
      NodeError.fromRpcError(Object.assign(new Error('boom'), { code: 3 })),
    ).toBeInstanceOf(NodeError.ExecutionRevertedError)
  })

  test('execution reverted via cause code', () => {
    expect(
      NodeError.fromRpcError(
        Object.assign(new Error('boom'), {
          cause: Object.assign(new Error('inner'), { code: 3 }),
        }),
      ),
    ).toBeInstanceOf(NodeError.ExecutionRevertedError)
  })

  test('fee cap too high', () => {
    expect(
      NodeError.fromRpcError(new Error('max fee per gas higher than 2^256-1'), {
        maxFeePerGas: 1n,
      }),
    ).toBeInstanceOf(NodeError.FeeCapTooHighError)
  })

  test('fee cap too low', () => {
    expect(
      NodeError.fromRpcError(
        new Error('max fee per gas less than block base fee'),
      ),
    ).toBeInstanceOf(NodeError.FeeCapTooLowError)
  })

  test('nonce too high', () => {
    expect(
      NodeError.fromRpcError(new Error('nonce too high'), { nonce: 5 }),
    ).toBeInstanceOf(NodeError.NonceTooHighError)
  })

  test('nonce too low', () => {
    expect(
      NodeError.fromRpcError(new Error('nonce too low'), { nonce: 5 }),
    ).toBeInstanceOf(NodeError.NonceTooLowError)
  })

  test('nonce max value', () => {
    expect(
      NodeError.fromRpcError(new Error('nonce has max value')),
    ).toBeInstanceOf(NodeError.NonceMaxValueError)
  })

  test('insufficient funds', () => {
    expect(
      NodeError.fromRpcError(new Error('insufficient funds for gas')),
    ).toBeInstanceOf(NodeError.InsufficientFundsError)
  })

  test('intrinsic gas too high', () => {
    expect(
      NodeError.fromRpcError(new Error('intrinsic gas too high'), { gas: 1n }),
    ).toBeInstanceOf(NodeError.IntrinsicGasTooHighError)
  })

  test('intrinsic gas too low', () => {
    expect(
      NodeError.fromRpcError(new Error('intrinsic gas too low'), { gas: 1n }),
    ).toBeInstanceOf(NodeError.IntrinsicGasTooLowError)
  })

  test('transaction type not supported', () => {
    expect(
      NodeError.fromRpcError(new Error('transaction type not valid')),
    ).toBeInstanceOf(NodeError.TransactionTypeNotSupportedError)
  })

  test('tip above fee cap', () => {
    expect(
      NodeError.fromRpcError(
        new Error('max priority fee per gas higher than max fee per gas'),
        { maxFeePerGas: 2n, maxPriorityFeePerGas: 3n },
      ),
    ).toBeInstanceOf(NodeError.TipAboveFeeCapError)
  })

  test('unknown node error', () => {
    expect(
      NodeError.fromRpcError(new Error('something unexpected')),
    ).toBeInstanceOf(NodeError.UnknownNodeError)
  })

  test('matches on top-level details string', () => {
    expect(
      NodeError.fromRpcError(
        Object.assign(new Error(''), { details: 'insufficient funds for gas' }),
      ),
    ).toBeInstanceOf(NodeError.InsufficientFundsError)
  })

  test('collects details and walks cause chain (message-less node)', () => {
    // The cause is a plain object with `details` but no `message`, exercising
    // both the details branch and the missing-message branch.
    expect(
      NodeError.fromRpcError(
        Object.assign(new Error('outer'), {
          cause: { details: 'nonce too low' },
        }),
      ),
    ).toBeInstanceOf(NodeError.NonceTooLowError)
  })

  test('ignores non-object and message-less data payloads', () => {
    expect(
      NodeError.fromRpcError(
        Object.assign(new Error(''), { data: '0xdeadbeef' }),
      ),
    ).toBeInstanceOf(NodeError.UnknownNodeError)
    expect(
      NodeError.fromRpcError(
        Object.assign(new Error(''), { data: { code: 1 } }),
      ),
    ).toBeInstanceOf(NodeError.UnknownNodeError)
  })

  test('drops non-bigint fee/gas and non-number nonce', () => {
    const result = NodeError.fromRpcError(new Error('execution reverted'), {
      gas: '0x1',
      maxFeePerGas: 1,
      maxPriorityFeePerGas: 2,
      nonce: '0x1',
    })
    expect(result).toBeInstanceOf(NodeError.ExecutionRevertedError)
  })

  test('forwards bigint fee/gas and number nonce', () => {
    const result = NodeError.fromRpcError(new Error('nonce too low'), {
      gas: 21000n,
      maxFeePerGas: 2000000000n,
      maxPriorityFeePerGas: 1000000000n,
      nonce: 1,
    })
    expect(result).toBeInstanceOf(NodeError.NonceTooLowError)
  })
})
