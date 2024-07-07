import { expect, test } from 'vitest'
import { RpcRequestError } from '../../../../errors/request.js'
import { getEntryPointError } from './getEntryPointError.js'

test('InitCodeFailedError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message:
        'useroperation reverted during simulation with reason: aa13 initcode failed or oog',
    },
    url: '',
  })
  const result = getEntryPointError(error, {
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

test('UnknownEntryPointError', () => {
  const error = new RpcRequestError({
    body: {},
    error: {
      code: -69420,
      message: 'wat man',
    },
    url: '',
  })
  const result = getEntryPointError(error, {
    factory: '0x0000000000000000000000000000000000000000',
    factoryData: '0xdeadbeef',
  })
  expect(result).toMatchInlineSnapshot(`
    [UnknownEntryPointError: An error occurred while executing user operation: RPC Request failed.

    Details: wat man
    Version: viem@x.y.z]
  `)
})
