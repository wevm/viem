import { attest } from '@ark/attest'
import { parseAbi } from 'abitype'
import { erc20Abi } from 'abitype/abis'
import { test } from 'vitest'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { type ReadContractParameters, readContract } from './readContract.js'

const client = createClient({ chain: mainnet, transport: http() })

test('return type', () => {
  const res = readContract(client, {
    address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
  })
  attest.instantiations([63834, 'instantiations'])
  attest<Promise<bigint>>(res)
})

test('default', () => {
  type Result = ReadContractParameters<typeof erc20Abi, 'allowance'>
  const res = {} as Result
  attest.instantiations([9217, 'instantiations'])
  attest<readonly [owner: `0x${string}`, spender: `0x${string}`]>(res.args)
  attest(res.args).type.toString.snap(`readonly [
  owner: \`0x\${string}\`,
  spender: \`0x\${string}\`
]`)
})

const abi = parseAbi([
  'function foo() view returns (int8)',
  'function foo(address account) view returns (string)',
  'function foo(address sender, address account) view returns ((address foo, address bar))',
  'function bar() view returns (int8)',
])
test('overloads', () => {
  type Result = ReadContractParameters<typeof abi, 'foo'>
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
