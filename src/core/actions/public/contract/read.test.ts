import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { describe, expect, test } from 'vitest'

import { Actions, ContractError } from 'viem'
const client = anvil.getClient(anvil.mainnet)

const { abi } = generated.Erc721
const { address, blockNumber } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})

const errors = {
  abi: generated.ErrorsExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
  ).address,
}

test('default', async () => {
  expect(
    await Actions.contract.read(client, {
      abi,
      address,
      functionName: 'name',
    }),
  ).toBe('wagmi')
})

test('args: function with return value', async () => {
  expect(
    await Actions.contract.read(client, {
      abi,
      address,
      functionName: 'symbol',
    }),
  ).toBe('WAGMI')
  expect(
    await Actions.contract.read(client, {
      abi,
      address,
      functionName: 'totalSupply',
    }),
  ).toBe(1n)
})

test('args: blockNumber', async () => {
  expect(
    await Actions.contract.read(client, {
      abi,
      address,
      blockNumber,
      functionName: 'name',
    }),
  ).toBe('wagmi')
})

test('args: args', async () => {
  await expect(() =>
    Actions.contract.read(client, {
      abi,
      address,
      args: [123n],
      functionName: 'ownerOf',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "ownerOf" reverted with the following reason:
      Execution reverted for an unknown reason.

      Contract Call:
        address:   0x081f08945fd17c5470f7bcee23fb57ab1099428e
        function:  function ownerOf(uint256) pure returns (address)
        args:             (123)
       
      Raw Call Arguments:
        data:  0x6352211e000000000000000000000000000000000000000000000000000000000000007b
        to:    0x081f08945fd17c5470f7bcee23fb57ab1099428e

      Details: execution reverted
      Version: viem@2.52.1]
    `)
})

test('error: reverts', async () => {
  await expect(() =>
    Actions.contract.read(client, {
      abi,
      address,
      args: [1n],
      functionName: 'ownerOf',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "ownerOf" reverted with the following reason:
      Execution reverted for an unknown reason.

      Contract Call:
        address:   0x081f08945fd17c5470f7bcee23fb57ab1099428e
        function:  function ownerOf(uint256) pure returns (address)
        args:             (1)
       
      Raw Call Arguments:
        data:  0x6352211e0000000000000000000000000000000000000000000000000000000000000001
        to:    0x081f08945fd17c5470f7bcee23fb57ab1099428e

      Details: execution reverted
      Version: viem@2.52.1]
    `)
})

test('args: deployless (code)', async () => {
  expect(
    await Actions.contract.read(client, {
      abi,
      code: generated.Erc721.bytecode.object,
      functionName: 'name',
    }),
  ).toBe('wagmi')
})

test('error: zero data (not a contract)', async () => {
  await expect(() =>
    Actions.contract.read(client, {
      abi,
      address: '0x0000000000000000000000000000000000000000',
      functionName: 'name',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "name" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "name",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  function name() view returns (string)

      Details: Cannot decode zero data ("0x") with ABI parameters.
      Version: viem@2.52.1]
    `)
})

test('error: aborted request is not wrapped', async () => {
  const controller = new AbortController()
  controller.abort()
  const error = await Actions.contract
    .read(client, {
      abi,
      address,
      functionName: 'name',
      requestOptions: { signal: controller.signal },
    })
    .catch((error) => error)
  expect(error).not.toBeInstanceOf(ContractError.ContractFunctionExecutionError)
})

describe('reverts', () => {
  test('revert message', async () => {
    await expect(() =>
      Actions.contract.read(client, {
        ...errors,
        functionName: 'revertRead',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "revertRead" reverted with the following reason:
        This is a revert message

        Contract Call:
          address:   0xf102f0173707c6726543d65fa38025eb72026c37
          function:  function revertRead() pure
         
        Raw Call Arguments:
          data:  0x9f558709
          to:    0xf102f0173707c6726543d65fa38025eb72026c37

        Details: execution reverted: This is a revert message
        Version: viem@2.52.1]
      `)
  })

  test('panic: assert', async () => {
    await expect(() =>
      Actions.contract.read(client, {
        ...errors,
        functionName: 'assertRead',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "assertRead" reverted with the following reason:
        An \`assert\` condition failed.

        Contract Call:
          address:   0xf102f0173707c6726543d65fa38025eb72026c37
          function:  function assertRead() pure
         
        Raw Call Arguments:
          data:  0xeb1aba20
          to:    0xf102f0173707c6726543d65fa38025eb72026c37

        Details: execution reverted: panic: assertion failed (0x01)
        Version: viem@2.52.1]
      `)
  })

  test('panic: overflow', async () => {
    await expect(() =>
      Actions.contract.read(client, {
        ...errors,
        functionName: 'overflowRead',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "overflowRead" reverted with the following reason:
        Arithmetic operation resulted in underflow or overflow.

        Contract Call:
          address:   0xf102f0173707c6726543d65fa38025eb72026c37
          function:  function overflowRead() pure returns (uint256)
         
        Raw Call Arguments:
          data:  0x4adac6eb
          to:    0xf102f0173707c6726543d65fa38025eb72026c37

        Details: execution reverted: panic: arithmetic underflow or overflow (0x11)
        Version: viem@2.52.1]
      `)
  })

  test('panic: divide by zero', async () => {
    await expect(() =>
      Actions.contract.read(client, {
        ...errors,
        functionName: 'divideByZeroRead',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "divideByZeroRead" reverted with the following reason:
        Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

        Contract Call:
          address:   0xf102f0173707c6726543d65fa38025eb72026c37
          function:  function divideByZeroRead() pure returns (uint256)
         
        Raw Call Arguments:
          data:  0x24db9ba0
          to:    0xf102f0173707c6726543d65fa38025eb72026c37

        Details: execution reverted: panic: division or modulo by zero (0x12)
        Version: viem@2.52.1]
      `)
  })

  test('require', async () => {
    await expect(() =>
      Actions.contract.read(client, {
        ...errors,
        functionName: 'requireRead',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "requireRead" reverted with the following reason:
        Execution reverted for an unknown reason.

        Contract Call:
          address:   0xf102f0173707c6726543d65fa38025eb72026c37
          function:  function requireRead() pure
         
        Raw Call Arguments:
          data:  0x699389ca
          to:    0xf102f0173707c6726543d65fa38025eb72026c37

        Details: execution reverted
        Version: viem@2.52.1]
      `)
  })

  // Custom-error `Details:` lines carry anvil's raw (binary) revert payload,
  // which is not safe to embed in a snapshot, so assert viem's decoded fields
  // (`shortMessage`, decoded `Error:` meta, structured `cause.data`) instead.
  test('custom error: with args', async () => {
    const error = (await Actions.contract
      .read(client, {
        ...errors,
        functionName: 'simpleCustomRead',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    expect(error.shortMessage).toBe(
      'The contract function "simpleCustomRead" reverted.',
    )
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.name).toBe('ContractFunctionRevertedError')
    expect(cause.data).toMatchInlineSnapshot(`
        {
          "args": [
            "bugger",
          ],
          "name": "SimpleError",
        }
      `)
    expect(cause.metaMessages).toMatchInlineSnapshot(`
        [
          "Error: error SimpleError(string message)",
          "                  (bugger)",
        ]
      `)
  })

  test('custom error: no args', async () => {
    const error = (await Actions.contract
      .read(client, {
        ...errors,
        functionName: 'simpleCustomReadNoArgs',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    expect(error.shortMessage).toBe(
      'The contract function "simpleCustomReadNoArgs" reverted.',
    )
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.data).toMatchInlineSnapshot(`
        {
          "args": [],
          "name": "SimpleErrorNoArgs",
        }
      `)
    expect(cause.metaMessages).toMatchInlineSnapshot(`
        [
          "Error: error SimpleErrorNoArgs()",
          "",
        ]
      `)
  })

  test('custom error: complex', async () => {
    const error = (await Actions.contract
      .read(client, {
        ...errors,
        functionName: 'complexCustomRead',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    expect(error.shortMessage).toBe(
      'The contract function "complexCustomRead" reverted.',
    )
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.data).toMatchInlineSnapshot(`
        {
          "args": [
            {
              "bar": 69n,
              "sender": "0x0000000000000000000000000000000000000000",
            },
            "bugger",
            69n,
          ],
          "name": "ComplexError",
        }
      `)
    expect(cause.metaMessages).toMatchInlineSnapshot(`
        [
          "Error: error ComplexError((address sender, uint256 bar) foo, string message, uint256 number)",
          "                   ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)",
        ]
      `)
  })

  test('custom error: not on abi', async () => {
    const error = (await Actions.contract
      .read(client, {
        ...errors,
        abi: errors.abi.filter((item) => item.name !== 'SimpleError'),
        functionName: 'simpleCustomRead',
      })
      .catch((error) => error)) as ContractError.ContractFunctionExecutionError
    expect(error.name).toBe('ContractFunctionExecutionError')
    const cause = error.cause as ContractError.ContractFunctionRevertedError
    expect(cause.signature).toBe('0xf9006398')
    expect(cause.metaMessages).toMatchInlineSnapshot(`
        [
          "Unable to decode signature "0xf9006398" as it was not found on the provided ABI.",
          "Make sure you are using the correct ABI and that the error exists on it.",
        ]
      `)
  })
})
