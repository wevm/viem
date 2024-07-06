import { expect, test } from 'vitest'
import { RpcRequestError } from '../../../../errors/request.js'
import { getBundlerError } from './getBundlerError.js'

test('InitCodeFailedOrOutOfGasError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message:
        'useroperation reverted during simulation with reason: aa13 initcode failed or oog',
    },
    url: '',
  })
  const result = getBundlerError(error, {
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
  })
  expect(result).toMatchInlineSnapshot(`
    [InitCodeFailedOrOutOfGas: Failed to simulate deployment for Smart Account.

    factory: 0x0000000000000000000000000000000000000000
    factoryData: 0xdeadbeef

    Details: useroperation reverted during simulation with reason: aa13 initcode failed or oog
    Version: viem@x.y.z]
  `)
})

test('UnknownBundlerError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'wat man',
    },
    url: '',
  })
  const result = getBundlerError(error, {
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
  })
  expect(result).toMatchInlineSnapshot(`
    [UnknownBundlerError: An error occurred while executing user operation: RPC Request failed.

    Details: wat man
    Version: viem@x.y.z]
  `)
})
