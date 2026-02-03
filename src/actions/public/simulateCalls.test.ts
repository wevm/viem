import { expect, test } from 'vitest'
import {
  baycContractConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { erc20Abi, erc721Abi } from '../../constants/abis.js'
import { parseEther } from '../../utils/index.js'
import { simulateCalls } from './simulateCalls.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const { results } = await simulateCalls(client, {
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcContractConfig.address,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcContractConfig.address,
      },
      {
        abi: erc721Abi,
        functionName: 'name',
        to: baycContractConfig.address,
      },
    ],
  })

  expect(results).toMatchInlineSnapshot(`
    [
      {
        "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        "gasUsed": 31414n,
        "logs": [],
        "result": "USD Coin",
        "status": "success",
      },
      {
        "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000045553444300000000000000000000000000000000000000000000000000000000",
        "gasUsed": 31434n,
        "logs": [],
        "result": "USDC",
        "status": "success",
      },
      {
        "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        "gasUsed": 24292n,
        "logs": [],
        "result": "BoredApeYachtClub",
        "status": "success",
      },
    ]
  `)
})

test('behavior: with mutation calls', async () => {
  const { results } = await simulateCalls(client, {
    account: accounts[0].address,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
        value: parseEther('1'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
    ],
    stateOverrides: [
      {
        address: accounts[0].address,
        balance: parseEther('10000'),
      },
    ],
  })

  expect(
    results.map((result) => ({ ...result, logs: null })),
  ).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": null,
        "result": null,
        "status": "success",
      },
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": null,
        "result": null,
        "status": "success",
      },
      {
        "data": "0x",
        "gasUsed": 78394n,
        "logs": null,
        "result": null,
        "status": "success",
      },
    ]
  `)
})

test('behavior: with mutation calls + asset changes', async () => {
  const account = '0xdead000000000000000042069420694206942069' as const
  const { assetChanges, results } = await simulateCalls(client, {
    account,
    traceAssetChanges: true,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
        value: parseEther('1'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
      {
        abi: erc20Abi,
        functionName: 'transfer',
        to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        args: [accounts[1].address, parseEther('1')],
      },
    ],
    stateOverrides: [
      {
        address: account,
        balance: parseEther('10000'),
      },
    ],
  })

  expect(
    assetChanges.map((change) => ({
      ...change,
      value: { diff: change.value.diff },
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "token": {
          "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "decimals": 18,
          "symbol": "ETH",
        },
        "value": {
          "diff": -2000000000000000000n,
        },
      },
      {
        "token": {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "decimals": 1,
          "symbol": "WAGMI",
        },
        "value": {
          "diff": 1n,
        },
      },
      {
        "token": {
          "address": "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
          "decimals": 18,
          "symbol": "SHIB",
        },
        "value": {
          "diff": -1000000000000000000n,
        },
      },
    ]
  `)
  expect(
    results.map((result) => ({ ...result, logs: null })),
  ).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": null,
        "result": null,
        "status": "success",
      },
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": null,
        "result": null,
        "status": "success",
      },
      {
        "data": "0x",
        "gasUsed": 78394n,
        "logs": null,
        "result": null,
        "status": "success",
      },
      {
        "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
        "gasUsed": 51859n,
        "logs": null,
        "result": true,
        "status": "success",
      },
    ]
  `)
})

test('behavior: mutation calls with insufficient balance', async () => {
  await expect(() =>
    simulateCalls(client, {
      account: '0x0000000000000000000000000000000000696969',
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('1'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
        },
      ],
    }),
  ).rejects.toThrowError(
    'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
  )
})

test('behavior: contract function does not exist', async () => {
  const { results } = await simulateCalls(client, {
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
  })
  expect(results).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "mint" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "mint",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
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
  const { results } = await simulateCalls(client, {
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
  })
  expect(results).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "<unknown>" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "<unknown>",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
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
  const { results } = await simulateCalls(client, {
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
  })
  expect(results).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000",
        "error": [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

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

test('behavior: stress', async () => {
  const calls = []
  for (let i = 0; i < 1_000; i++) {
    calls.push({
      abi: erc20Abi,
      functionName: 'name',
      to: usdcContractConfig.address,
    })
  }

  await simulateCalls(client, {
    calls,
  })
})

test('behavior: account not provided with traceAssetChanges', async () => {
  await expect(() =>
    simulateCalls(client, {
      traceAssetChanges: true,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('1'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
        },
        {
          abi: erc20Abi,
          functionName: 'transfer',
          to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
          args: [accounts[1].address, parseEther('1')],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`account\` is required when \`traceAssetChanges\` is true

    Version: viem@x.y.z]
  `)
})
