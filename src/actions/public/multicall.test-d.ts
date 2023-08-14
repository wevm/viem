import type { Abi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { baycContractConfig, usdcContractConfig } from '../../_test/abis.js'
import { address } from '../../_test/constants.js'
import { publicClient } from '../../_test/utils.js'
import { multicall } from './multicall.js'

test('single result', async () => {
  const res = await multicall(publicClient, {
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

test('all known', async () => {
  const res = await multicall(publicClient, {
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
  const res = await multicall(publicClient, {
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
  const res = await multicall(publicClient, {
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
    ].map((x) => ({ ...x })),
  })
  expectTypeOf(res).toEqualTypeOf<unknown[]>()

  const res2 = await multicall(publicClient, {
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
