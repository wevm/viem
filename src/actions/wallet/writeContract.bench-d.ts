import { attest } from '@ark/attest'
import { parseAbi } from 'abitype'
import type { erc20Abi } from 'abitype/abis'
import { test } from 'vitest'
import type { WriteContractParameters } from './writeContract.js'

test('default', () => {
  type Result = WriteContractParameters<typeof erc20Abi, 'approve'>
  const res = {} as Result
  attest.instantiations([9217, 'instantiations'])
  attest<readonly [spender: `0x${string}`, amount: bigint]>(res.args)
  attest(res.args).type.toString.snap(
    `readonly [spender: \`0x\${string}\`, amount: bigint]`,
  )
})

const abi = parseAbi([
  'function foo() returns (int8)',
  'function foo(address account) returns (string)',
  'function foo(address sender, address account) returns ((address foo, address bar))',
  'function bar() returns (int8)',
])
test('overloads', () => {
  type Result = WriteContractParameters<typeof abi, 'foo'>
  const res = {} as Result
  attest.instantiations([14699, 'instantiations'])
  attest<
    | readonly []
    | readonly [account: `0x${string}`]
    | readonly [sender: `0x${string}`, account: `0x${string}`]
    | undefined
  >(res.args)
  attest(res.args).type.toString.snap(`  | readonly []
  | readonly [account: \`0x\${string}\`]
  | readonly [sender: \`0x\${string}\`, account: \`0x\${string}\`]
  | undefined`)
})
