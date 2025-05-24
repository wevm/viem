import { expect, test } from 'vitest'

import {
  usdcContractConfig,
  wagmiContractConfig,
} from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import { maxUint256 } from '../../constants/number.js'
import { parseEther, parseGwei } from '../../utils/index.js'
import { simulateBlocks } from './simulateBlocks.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            account: accounts[0].address,
            to: accounts[1].address,
            value: parseEther('1'),
          },
          {
            account: accounts[0].address,
            to: accounts[2].address,
            value: parseEther('1'),
          },
          {
            abi: wagmiContractConfig.abi,
            functionName: 'name',
            to: wagmiContractConfig.address,
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })

  expect(result[0].calls).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": [],
        "result": null,
        "status": "success",
      },
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": [],
        "result": null,
        "status": "success",
      },
      {
        "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        "gasUsed": 24371n,
        "logs": [],
        "result": "wagmi",
        "status": "success",
      },
    ]
  `)
})

test('args: blockOverrides', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            account: accounts[0].address,
            to: accounts[1].address,
            value: parseEther('1'),
          },
        ],
        blockOverrides: {
          baseFeePerGas: parseGwei('100'),
          gasLimit: 60_000_000n,
        },
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })

  expect(result[0].baseFeePerGas).toBe(parseGwei('100'))
  expect(result[0].gasLimit).toBe(60_000_000n)
})

test('behavior: fee cap too high', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[0].address,
              to: accounts[1].address,
              value: parseEther('1'),
              maxFeePerGas: maxUint256 + 1n,
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@x.y.z]
  `)
})

test('behavior: tip higher than fee cap', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[0].address,
              to: accounts[1].address,
              value: parseEther('1'),
              maxPriorityFeePerGas: parseGwei('11'),
              maxFeePerGas: parseGwei('10'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Version: viem@x.y.z]
  `,
  )
})

test('behavior: gas too low', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[0].address,
              to: accounts[1].address,
              value: parseEther('1'),
              gas: 100n,
            },
          ],
          stateOverrides: [
            {
              address: accounts[0].address,
              balance: parseEther('10000'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [IntrinsicGasTooHighError: The amount of gas provided for the transaction exceeds the limit allowed for the block.

    Details: intrinsic gas too high -- CallGasCostMoreThanGasLimit
    Version: viem@x.y.z]
  `,
  )
})

test('behavior: insufficient funds', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: '0x0000000000000000000000000000000000696969',
              to: accounts[1].address,
              value: parseEther('1'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowError('Insufficient funds for gas * price + value')
})

test('behavior: contract function does not exist', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: usdcContractConfig.address,
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })
  expect(result[0].calls).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    execution failed

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()

    Version: viem@x.y.z],
        "gasUsed": 28585n,
        "logs": [],
        "status": "failure",
      },
    ]
  `,
  )
})

test('behavior: contract function does not exist', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            data: '0xdeadbeef',
            to: wagmiContractConfig.address,
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })
  expect(result[0].calls).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "<unknown>" reverted with the following reason:
    execution failed

    Contract Call:
      address:  0x0000000000000000000000000000000000000000

    Version: viem@x.y.z],
        "gasUsed": 21277n,
        "logs": [],
        "status": "failure",
      },
    ]
  `,
  )
})

test('behavior: contract revert', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: wagmiContractConfig.address,
            args: [1n],
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })
  expect(result[0].calls).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000",
        "error": [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    execution failed

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (1)

    Version: viem@x.y.z],
        "gasUsed": 23813n,
        "logs": [],
        "status": "failure",
      },
    ]
  `,
  )
})
