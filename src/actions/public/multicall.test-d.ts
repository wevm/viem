import { type Abi, type Address, parseAbi } from 'abitype'
import { erc20Abi, seaportAbi, wagmiMintExampleAbi } from 'abitype/abis'
import { expectTypeOf, test } from 'vitest'

import { baycContractConfig, usdcContractConfig } from '~test/src/abis.js'
import { address } from '~test/src/constants.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import type { MulticallResponse } from '../../types/multicall.js'
import { multicall } from './multicall.js'

const client = anvilMainnet.getClient()

test('single result', async () => {
  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
    ],
  })
  expectTypeOf(res).toEqualTypeOf<[bigint]>()
})

test('const asserted', async () => {
  const contracts = [
    {
      ...usdcContractConfig,
      functionName: 'totalSupply',
    },
    {
      ...usdcContractConfig,
      functionName: 'balanceOf',
      args: [address.vitalik],
    },
    {
      ...baycContractConfig,
      functionName: 'name',
    },
  ] as const
  const res = await multicall(client, { allowFailure: false, contracts })
  expectTypeOf(res).toEqualTypeOf<[bigint, bigint, string]>()
})

test('all known', async () => {
  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: [address.vitalik],
      },
      {
        ...baycContractConfig,
        functionName: 'name',
      },
    ],
  })
  expectTypeOf(res).toEqualTypeOf<[bigint, bigint, string]>()
})

test('mixed', async () => {
  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        abi: usdcContractConfig.abi as Abi,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: [address.vitalik],
      },
      {
        ...baycContractConfig,
        functionName: 'name',
      },
    ],
  })
  expectTypeOf(res).toEqualTypeOf<[bigint, unknown, bigint, string]>()
})

test('dynamic', async () => {
  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: [address.vitalik],
      },
      {
        ...baycContractConfig,
        functionName: 'name',
      },
    ].map((x) => x),
  })
  expectTypeOf(res).toEqualTypeOf<
    (string | number | bigint | boolean | void)[]
  >()

  const res2 = await multicall(client, {
    allowFailure: false,
    contracts: (
      [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'name',
        },
      ] as const
    ).map((x) => ({ ...x })),
  })
  expectTypeOf(res2).toEqualTypeOf<(string | bigint)[]>()
})

test('with unknown', async () => {
  const abi__unknown = [
    {
      type: 'function',
      name: 'balanceOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'decimals',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint8' }],
    },
  ]

  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        address: '0x',
        abi: abi__unknown,
        functionName: 'allowance',
        args: ['0x', '0x'],
      },
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: [address.vitalik],
      },
      {
        ...baycContractConfig,
        functionName: 'name',
      },
    ],
  })
  expectTypeOf(res).toEqualTypeOf<[bigint, unknown, bigint, string]>()
})

test('many contracts of differing types', async () => {
  const abi__unknown = [
    {
      type: 'function',
      name: 'balanceOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'decimals',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint8' }],
    },
  ]

  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        address: '0x',
        abi: seaportAbi,
        functionName: 'getContractOffererNonce',
        args: ['0x'],
      },
      {
        address: '0x',
        abi: wagmiMintExampleAbi,
        functionName: 'totalSupply',
        args: [],
      },
      {
        address: '0x',
        functionName: 'balanceOf',
        args: ['0x'],
        abi: wagmiMintExampleAbi,
      },
      {
        address: '0x',
        abi: wagmiMintExampleAbi,
        functionName: 'tokenURI',
        args: [123n],
      },
      {
        address: '0x',
        abi: seaportAbi as Abi,
        functionName: 'name',
      },
      {
        address: '0x',
        abi: erc20Abi,
        functionName: 'allowance',
        args: ['0x', '0x'],
      },
      {
        address: '0x',
        abi: abi__unknown,
        functionName: 'allowance',
        args: ['0x', '0x'],
      },
      {
        address: '0x',
        abi: parseAbi([
          'function foo() view returns (int8)',
          'function foo(address) view returns (string)',
          'function foo(address, address) view returns ((address foo, address bar))',
          'function bar() view returns (int8)',
        ]),
        functionName: 'foo',
        args: ['0x', '0x'],
      },
    ],
  })
  res
  // ^?
  expectTypeOf(res).toEqualTypeOf<
    [
      bigint,
      bigint,
      bigint,
      string,
      unknown,
      bigint,
      unknown,
      {
        foo: `0x${string}`
        bar: `0x${string}`
      },
    ]
  >()
})

test('overloads', async () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  const res = await multicall(client, {
    allowFailure: false,
    contracts: [
      {
        address: '0x',
        abi,
        functionName: 'foo',
      },
      {
        address: '0x',
        abi,
        functionName: 'foo',
        args: ['0x'],
      },
      {
        address: '0x',
        abi,
        functionName: 'foo',
        args: ['0x', '0x'],
      },
    ],
  })

  expectTypeOf(res).toEqualTypeOf<
    [number, string, { foo: Address; bar: Address }]
  >()
})

test('MulticallParameters', async () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  type Result = Parameters<
    typeof multicall<
      [
        {
          address: '0x'
          abi: typeof abi
          functionName: 'foo'
        },
      ],
      typeof client.chain
    >
  >[1]['contracts'][0]
  expectTypeOf<Result>().toEqualTypeOf<{
    address: Address
    abi: typeof abi
    functionName: 'foo' | 'bar'
    args?:
      | readonly []
      | readonly [`0x${string}`]
      | readonly [`0x${string}`, `0x${string}`]
      | undefined
  }>()
})

test('allowFailure: true', async () => {
  const res = await multicall(client, {
    allowFailure: true,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'symbol',
      },
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: ['0x'],
      },
    ],
  })
  expectTypeOf(res).toEqualTypeOf<
    [
      MulticallResponse<bigint>,
      MulticallResponse<string>,
      MulticallResponse<bigint>,
    ]
  >()
})
