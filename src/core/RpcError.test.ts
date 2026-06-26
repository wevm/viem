import { describe, expect, test } from 'vitest'

import { mainnet } from '../chains/definitions/mainnet.js'
import * as Account from './Account.js'
import * as RpcError from './RpcError.js'

describe('ExecutionRevertedError', () => {
  test('with reason', () => {
    expect(
      new RpcError.ExecutionRevertedError({
        message: 'execution reverted: bad',
      }).message,
    ).toMatchInlineSnapshot(`
      "Execution reverted with reason: bad.

      Version: viem@2.52.1"
    `)
  })

  test('without reason', () => {
    expect(new RpcError.ExecutionRevertedError().message)
      .toMatchInlineSnapshot(`
      "Execution reverted for an unknown reason.

      Version: viem@2.52.1"
    `)
  })
})

describe('FeeCapTooHighError', () => {
  test('with maxFeePerGas', () => {
    expect(
      new RpcError.FeeCapTooHighError({ maxFeePerGas: 70000000000n }).message,
    ).toMatchInlineSnapshot(`
      "The fee cap (\`maxFeePerGas\` = 70 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Version: viem@2.52.1"
    `)
  })

  test('without maxFeePerGas', () => {
    expect(new RpcError.FeeCapTooHighError().message).toContain('The fee cap')
  })
})

describe('FeeCapTooLowError', () => {
  test('default', () => {
    expect(
      new RpcError.FeeCapTooLowError({ maxFeePerGas: 1n }).message,
    ).toContain('cannot be lower than the block base fee')
  })
})

describe('NonceTooHighError', () => {
  test('with nonce', () => {
    expect(new RpcError.NonceTooHighError({ nonce: 5 }).message).toContain(
      '(5)',
    )
  })
  test('without nonce', () => {
    expect(new RpcError.NonceTooHighError().message).toContain(
      'higher than the next one expected',
    )
  })
})

describe('NonceTooLowError', () => {
  test('with nonce', () => {
    expect(new RpcError.NonceTooLowError({ nonce: 5 }).message).toContain('(5)')
  })
})

describe('NonceMaxValueError', () => {
  test('with nonce', () => {
    expect(new RpcError.NonceMaxValueError({ nonce: 5 }).message).toContain(
      '(5)',
    )
  })
})

describe('InsufficientFundsError', () => {
  test('default', () => {
    expect(new RpcError.InsufficientFundsError().message).toContain(
      'exceeds the balance of the account',
    )
  })
})

describe('IntrinsicGasTooHighError', () => {
  test('with gas', () => {
    expect(
      new RpcError.IntrinsicGasTooHighError({ gas: 21000n }).message,
    ).toContain('(21000)')
  })
  test('without gas', () => {
    expect(new RpcError.IntrinsicGasTooHighError().message).toContain(
      'exceeds the limit allowed for the block',
    )
  })
})

describe('IntrinsicGasTooLowError', () => {
  test('with gas', () => {
    expect(new RpcError.IntrinsicGasTooLowError({ gas: 1n }).message).toContain(
      '(1)',
    )
  })
  test('without gas', () => {
    expect(new RpcError.IntrinsicGasTooLowError().message).toContain('too low')
  })
})

describe('TransactionTypeNotSupportedError', () => {
  test('default', () => {
    expect(new RpcError.TransactionTypeNotSupportedError().message).toContain(
      'transaction type is not supported',
    )
  })
})

describe('TipAboveFeeCapError', () => {
  test('with fees', () => {
    expect(
      new RpcError.TipAboveFeeCapError({
        maxFeePerGas: 2000000000n,
        maxPriorityFeePerGas: 3000000000n,
      }).message,
    ).toMatchInlineSnapshot(`
      "The provided tip (\`maxPriorityFeePerGas\` = 3 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 2 gwei).

      Version: viem@2.52.1"
    `)
  })

  test('without fees', () => {
    expect(new RpcError.TipAboveFeeCapError().message).toContain(
      'The provided tip',
    )
  })
})

describe('UnknownRpcError', () => {
  test('uses cause shortMessage', () => {
    const cause = Object.assign(new Error('full'), { shortMessage: 'short' })
    expect(new RpcError.UnknownRpcError({ cause }).message).toContain('short')
  })

  test('falls back to cause message', () => {
    expect(
      new RpcError.UnknownRpcError({ cause: new Error('boom') }).message,
    ).toContain('boom')
  })
})

describe('ExecutionError', () => {
  test('wraps a recognized node error with request arguments', () => {
    const result = new RpcError.ExecutionError(
      new Error('insufficient funds for gas'),
      {
        chain: mainnet,
        from: '0x0000000000000000000000000000000000000001',
        gas: 21000n,
        maxFeePerGas: 2000000000n,
        maxPriorityFeePerGas: 1000000000n,
        nonce: 1,
        value: 1000000000000000000n,
      },
    )
    expect(result.cause).toBeInstanceOf(RpcError.InsufficientFundsError)
    expect(result.message).toMatchInlineSnapshot(`
      "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

      This error could arise when the account does not have enough funds to:
       - pay for the total gas fee,
       - pay for the value to send.
       
      The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
       - \`gas\` is the amount of gas needed for transaction to execute,
       - \`gas fee\` is the gas fee,
       - \`value\` is the amount of ether to send to the recipient.
       
      Request Arguments:
        chain:                 Ethereum (id: 1)
        from:                  0x0000000000000000000000000000000000000001
        gas:                   21000
        maxFeePerGas:          2 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 1
        value:                 1 ETH

      Details: insufficient funds for gas
      Version: viem@2.52.1"
    `)
  })

  test('resolves `from` from a provided account', () => {
    const result = new RpcError.ExecutionError(new Error('nonce too low'), {
      account: Account.from('0x0000000000000000000000000000000000000002'),
    })
    expect(result.cause).toBeInstanceOf(RpcError.NonceTooLowError)
    expect(result.message).toContain(
      '0x0000000000000000000000000000000000000002',
    )
  })

  test('keeps an unrecognized error as the cause and formats value without a chain', () => {
    const error = new Error('something unexpected')
    const result = new RpcError.ExecutionError(error, {
      value: 1000000000000000000n,
    })
    expect(result.cause).toBe(error)
    expect(result.message).toContain('something unexpected')
    expect(result.message).toContain('1 ETH')
  })

  test('falls back to a default short message for an empty cause message', () => {
    const result = new RpcError.ExecutionError(new Error(''))
    expect(result.message).toContain('An error occurred.')
  })

  test('passes non-bigint value and fees through untouched', () => {
    const result = new RpcError.ExecutionError(new Error('boom'), {
      gasPrice: '0x1',
      maxFeePerGas: '0x2',
      value: '0x3',
    })
    expect(result.message).toContain('gasPrice')
    expect(result.message).toContain('0x1')
    expect(result.message).toContain('0x2')
    expect(result.message).toContain('0x3')
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
    const result = RpcError.fromRpcError(error)
    expect(result).toBeInstanceOf(RpcError.ExecutionRevertedError)
    expect(result.message).toMatchInlineSnapshot(`
      "Execution reverted with reason: ERC721: nonexistent token.

      Details: rpc failed
      Version: viem@2.52.1"
    `)
  })

  test('execution reverted via message regex', () => {
    expect(
      RpcError.fromRpcError(new Error('execution reverted')),
    ).toBeInstanceOf(RpcError.ExecutionRevertedError)
  })

  test('execution reverted via top-level code', () => {
    expect(
      RpcError.fromRpcError(Object.assign(new Error('boom'), { code: 3 })),
    ).toBeInstanceOf(RpcError.ExecutionRevertedError)
  })

  test('execution reverted via cause code', () => {
    expect(
      RpcError.fromRpcError(
        Object.assign(new Error('boom'), {
          cause: Object.assign(new Error('inner'), { code: 3 }),
        }),
      ),
    ).toBeInstanceOf(RpcError.ExecutionRevertedError)
  })

  test('fee cap too high', () => {
    expect(
      RpcError.fromRpcError(new Error('max fee per gas higher than 2^256-1'), {
        maxFeePerGas: 1n,
      }),
    ).toBeInstanceOf(RpcError.FeeCapTooHighError)
  })

  test('fee cap too low', () => {
    expect(
      RpcError.fromRpcError(
        new Error('max fee per gas less than block base fee'),
      ),
    ).toBeInstanceOf(RpcError.FeeCapTooLowError)
  })

  test('nonce too high', () => {
    expect(
      RpcError.fromRpcError(new Error('nonce too high'), { nonce: 5 }),
    ).toBeInstanceOf(RpcError.NonceTooHighError)
  })

  test('nonce too low', () => {
    expect(
      RpcError.fromRpcError(new Error('nonce too low'), { nonce: 5 }),
    ).toBeInstanceOf(RpcError.NonceTooLowError)
  })

  test('nonce max value', () => {
    expect(
      RpcError.fromRpcError(new Error('nonce has max value')),
    ).toBeInstanceOf(RpcError.NonceMaxValueError)
  })

  test('insufficient funds', () => {
    expect(
      RpcError.fromRpcError(new Error('insufficient funds for gas')),
    ).toBeInstanceOf(RpcError.InsufficientFundsError)
  })

  test('intrinsic gas too high', () => {
    expect(
      RpcError.fromRpcError(new Error('intrinsic gas too high'), { gas: 1n }),
    ).toBeInstanceOf(RpcError.IntrinsicGasTooHighError)
  })

  test('intrinsic gas too low', () => {
    expect(
      RpcError.fromRpcError(new Error('intrinsic gas too low'), { gas: 1n }),
    ).toBeInstanceOf(RpcError.IntrinsicGasTooLowError)
  })

  test('transaction type not supported', () => {
    expect(
      RpcError.fromRpcError(new Error('transaction type not valid')),
    ).toBeInstanceOf(RpcError.TransactionTypeNotSupportedError)
  })

  test('tip above fee cap', () => {
    expect(
      RpcError.fromRpcError(
        new Error('max priority fee per gas higher than max fee per gas'),
        { maxFeePerGas: 2n, maxPriorityFeePerGas: 3n },
      ),
    ).toBeInstanceOf(RpcError.TipAboveFeeCapError)
  })

  test('unknown node error', () => {
    expect(
      RpcError.fromRpcError(new Error('something unexpected')),
    ).toBeInstanceOf(RpcError.UnknownRpcError)
  })

  test('matches on top-level details string', () => {
    expect(
      RpcError.fromRpcError(
        Object.assign(new Error(''), { details: 'insufficient funds for gas' }),
      ),
    ).toBeInstanceOf(RpcError.InsufficientFundsError)
  })

  test('collects details and walks cause chain (message-less node)', () => {
    // The cause is a plain object with `details` but no `message`, exercising
    // both the details branch and the missing-message branch.
    expect(
      RpcError.fromRpcError(
        Object.assign(new Error('outer'), {
          cause: { details: 'nonce too low' },
        }),
      ),
    ).toBeInstanceOf(RpcError.NonceTooLowError)
  })

  test('ignores non-object and message-less data payloads', () => {
    expect(
      RpcError.fromRpcError(
        Object.assign(new Error(''), { data: '0xdeadbeef' }),
      ),
    ).toBeInstanceOf(RpcError.UnknownRpcError)
    expect(
      RpcError.fromRpcError(
        Object.assign(new Error(''), { data: { code: 1 } }),
      ),
    ).toBeInstanceOf(RpcError.UnknownRpcError)
  })

  test('drops non-bigint fee/gas and non-number nonce', () => {
    const result = RpcError.fromRpcError(new Error('execution reverted'), {
      gas: '0x1',
      maxFeePerGas: 1,
      maxPriorityFeePerGas: 2,
      nonce: '0x1',
    })
    expect(result).toBeInstanceOf(RpcError.ExecutionRevertedError)
  })

  test('forwards bigint fee/gas and number nonce', () => {
    const result = RpcError.fromRpcError(new Error('nonce too low'), {
      gas: 21000n,
      maxFeePerGas: 2000000000n,
      maxPriorityFeePerGas: 1000000000n,
      nonce: 1,
    })
    expect(result).toBeInstanceOf(RpcError.NonceTooLowError)
  })
})
