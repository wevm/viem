import {
  Abi,
  AbiFunction,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype'
import { AbiCoder } from 'ethers/lib/utils'
import { bench, describe, test } from 'vitest'

import { mixedAbi } from '../../../test'
import { encodeAbi } from './encodeAbi'

export function getFunctionInputs<
  TAbi extends Abi,
  TName extends ExtractAbiFunctionNames<TAbi>,
>({
  abi,
  name,
}: {
  abi: TAbi
  name: TName
}): ExtractAbiFunction<TAbi, TName>['inputs'] {
  return (
    abi.find(
      (abi) => abi.type === 'function' && abi.name === name,
    ) as AbiFunction & {
      type: 'function'
    }
  )?.inputs!
}

describe('ABI Encode (static struct)', () => {
  bench('viem: `encodeAbi`', () => {
    encodeAbi({
      params: getFunctionInputs({
        abi: mixedAbi,
        name: 'staticStruct2',
      }),
      values: [
        {
          foo: {
            x: 420n,
            y: true,
            z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          },
          baz: {
            x: 69n,
            y: false,
            z: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
          },
          x: [1, 2],
        },
      ],
    })
  })

  bench('ethers: `AbiCoder.encode`', () => {
    const coder = new AbiCoder()
    coder.encode(
      getFunctionInputs({
        abi: mixedAbi,
        name: 'staticStruct2',
      }),
      [
        {
          foo: {
            x: 420n,
            y: true,
            z: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          },
          baz: {
            x: 69n,
            y: false,
            z: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b',
          },
          x: [1, 2],
        },
      ],
    )
  })
})
