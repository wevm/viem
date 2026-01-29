import { describe, expect, test } from 'vitest'

import { address } from '~test/src/constants.js'
import { parseAccount } from '../accounts/utils/parseAccount.js'
import { polygon } from '../chains/index.js'

import { BaseError } from './base.js'
import { EstimateGasExecutionError } from './estimateGas.js'

describe('EstimateGasExecutionError', () => {
  test('no args', async () => {
    expect(
      new EstimateGasExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
      }),
    ).toMatchInlineSnapshot(`
      [EstimateGasExecutionError: error

      Estimate Gas Arguments:
        from:  0xd8da6bf26964af9d7eed9e03e53415d37aa96045

      Version: viem@x.y.z]
    `)
  })

  test('w/ base args', async () => {
    expect(
      new EstimateGasExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        value: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [EstimateGasExecutionError: error

      Estimate Gas Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 ETH
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })

  test('w/ eip1559 args', async () => {
    expect(
      new EstimateGasExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        maxFeePerGas: 420n,
        maxPriorityFeePerGas: 69n,
      }),
    ).toMatchInlineSnapshot(`
      [EstimateGasExecutionError: error

      Estimate Gas Arguments:
        from:                  0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:                    0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        data:                  0x123
        gas:                   420
        maxFeePerGas:          0.00000042 gwei
        maxPriorityFeePerGas:  0.000000069 gwei
        nonce:                 69

      Version: viem@x.y.z]
    `)
  })

  test('w/ legacy args', async () => {
    expect(
      new EstimateGasExecutionError(new BaseError('error'), {
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        gasPrice: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [EstimateGasExecutionError: error

      Estimate Gas Arguments:
        from:      0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:        0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        data:      0x123
        gas:       420
        gasPrice:  0.00000042 gwei
        nonce:     69

      Version: viem@x.y.z]
    `)
  })

  test('w/ chain', async () => {
    expect(
      new EstimateGasExecutionError(new BaseError('error'), {
        chain: polygon,
        account: parseAccount(address.vitalik),
        to: address.usdcHolder,
        data: '0x123',
        gas: 420n,
        nonce: 69,
        value: 420n,
      }),
    ).toMatchInlineSnapshot(`
      [EstimateGasExecutionError: error

      Estimate Gas Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 POL
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })

  test('w/ metaMessages', async () => {
    expect(
      new EstimateGasExecutionError(
        new BaseError('error', { metaMessages: ['omggg!'] }),
        {
          chain: polygon,
          account: parseAccount(address.vitalik),
          to: address.usdcHolder,
          data: '0x123',
          gas: 420n,
          nonce: 69,
          value: 420n,
        },
      ),
    ).toMatchInlineSnapshot(`
      [EstimateGasExecutionError: error

      omggg!
       
      Estimate Gas Arguments:
        from:   0xd8da6bf26964af9d7eed9e03e53415d37aa96045
        to:     0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078
        value:  0.00000000000000042 POL
        data:   0x123
        gas:    420
        nonce:  69

      Version: viem@x.y.z]
    `)
  })
})
