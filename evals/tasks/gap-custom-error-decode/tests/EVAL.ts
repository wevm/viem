import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { getRevertError } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const abi = [
  {
    type: 'function',
    name: 'assertRead',
    inputs: [],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'assertWrite',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'complexCustomRead',
    inputs: [],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'complexCustomWrite',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'divideByZeroRead',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'divideByZeroWrite',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'overflowRead',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'overflowWrite',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requireRead',
    inputs: [],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'requireWrite',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revertRead',
    inputs: [],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'revertWrite',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'simpleCustomRead',
    inputs: [],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'simpleCustomReadNoArgs',
    inputs: [],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'simpleCustomWrite',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'simpleCustomWriteNoArgs',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    name: 'ComplexError',
    inputs: [
      {
        name: 'foo',
        type: 'tuple',
        internalType: 'struct ErrorsExample.Foo',
        components: [
          {
            name: 'sender',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'bar',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'message',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'number',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'SimpleError',
    inputs: [
      {
        name: 'message',
        type: 'string',
        internalType: 'string',
      },
    ],
  },
  {
    type: 'error',
    name: 'SimpleErrorNoArgs',
    inputs: [],
  },
] as const

const bytecode =
  '0x6080604052348015600e575f5ffd5b5061083e8061001c5f395ff3fe608060405234801561000f575f5ffd5b50600436106100fe575f3560e01c8063940b880211610095578063c66cf13311610064578063c66cf133146101a2578063d44de866146101c0578063eb1aba20146101de578063efbbf995146101e8576100fe565b8063940b88021461017a5780639f55870914610184578063a997732e1461018e578063c041930d14610198576100fe565b80634adac6eb116100d15780634adac6eb1461013e578063699389ca1461015c57806388452b85146101665780638de18b9114610170576100fe565b806304696152146101025780631515d7681461010c57806324db9ba0146101165780634a9bc27814610134575b5f5ffd5b61010a6101f2565b005b610114610202565b005b61011e61026d565b60405161012b919061052e565b60405180910390f35b61013c61028f565b005b61014661029a565b604051610153919061052e565b60405180910390f35b6101646102dc565b005b61016e6102e7565b005b610178610322565b005b61018261038d565b005b61018c6103c8565b005b610196610403565b005b6101a061043e565b005b6101aa610470565b6040516101b7919061052e565b60405180910390f35b6101c8610492565b6040516101d5919061052e565b60405180910390f35b6101e66104d4565b005b6101f06104e4565b005b5f610200576101ff610547565b5b565b60405180604001604052805f73ffffffffffffffffffffffffffffffffffffffff168152602001604581525060456040517fdb731cf400000000000000000000000000000000000000000000000000000000815260040161026492919061068b565b60405180910390fd5b5f5f604590505f5f90505f8183610284919061071f565b905080935050505090565b5f610298575f5ffd5b565b5f5f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff90505f600190505f81836102d1919061074f565b905080935050505090565b5f6102e5575f5ffd5b565b6040517ff900639800000000000000000000000000000000000000000000000000000000815260040161031990610782565b60405180910390fd5b60405180604001604052805f73ffffffffffffffffffffffffffffffffffffffff168152602001604581525060456040517fdb731cf400000000000000000000000000000000000000000000000000000000815260040161038492919061068b565b60405180910390fd5b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103bf906107ea565b60405180910390fd5b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103fa906107ea565b60405180910390fd5b6040517ff900639800000000000000000000000000000000000000000000000000000000815260040161043590610782565b60405180910390fd5b6040517f67476b9a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f5f604590505f5f90505f8183610487919061071f565b905080935050505090565b5f5f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff90505f600190505f81836104c9919061074f565b905080935050505090565b5f6104e2576104e1610547565b5b565b6040517f67476b9a00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b5f819050919050565b61052881610516565b82525050565b5f6020820190506105415f83018461051f565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52600160045260245ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61059d82610574565b9050919050565b6105ad81610593565b82525050565b6105bc81610516565b82525050565b604082015f8201516105d65f8501826105a4565b5060208201516105e960208501826105b3565b50505050565b5f82825260208201905092915050565b7f62756767657200000000000000000000000000000000000000000000000000005f82015250565b5f6106336006836105ef565b915061063e826105ff565b602082019050919050565b5f819050919050565b5f819050919050565b5f61067561067061066b84610649565b610652565b610516565b9050919050565b6106858161065b565b82525050565b5f60808201905061069e5f8301856105c2565b81810360408301526106af81610627565b90506106be606083018461067c565b9392505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f61072982610516565b915061073483610516565b925082610744576107436106c5565b5b828204905092915050565b5f61075982610516565b915061076483610516565b925082820190508082111561077c5761077b6106f2565b5b92915050565b5f6020820190508181035f83015261079981610627565b9050919050565b7f54686973206973206120726576657274206d65737361676500000000000000005f82015250565b5f6107d46018836105ef565b91506107df826107a0565b602082019050919050565b5f6020820190508181035f830152610801816107c8565b905091905056fea264697066735822122084fe23c772f1a76095541037f7653938d6d081eaf85df19c46b2487970b9aaed64736f6c63430008230033'

async function rpc(method: string, params: unknown[]) {
  // Retry network-level failures (anvil closes idle keep-alive sockets).
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      const { result, error } = (await res.json()) as any
      if (error) throw new Error(error.message)
      return result
    } catch (err) {
      if (err instanceof TypeError && attempt < 4)
        await new Promise((resolve) => setTimeout(resolve, 250))
      else throw err
    }
  }
}

const deployer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
let address: `0x${string}`

beforeAll(async () => {
  const hash = await rpc('eth_sendTransaction', [
    { from: deployer, data: bytecode, gas: '0x2dc6c0' },
  ])
  let receipt: any
  for (let i = 0; i < 50; i++) {
    receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (receipt) break
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  if (receipt?.status !== '0x1') throw new Error('contract deploy failed')
  address = receipt.contractAddress
}, 30_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('decodes a custom error with args', async () => {
  const decoded = await getRevertError(client, {
    abi,
    address,
    functionName: 'simpleCustomRead',
  })
  expectTypeOf(decoded.errorName).toEqualTypeOf<
    'ComplexError' | 'SimpleError' | 'SimpleErrorNoArgs'
  >()
  expect(decoded).toEqual({ errorName: 'SimpleError', args: ['bugger'] })
})

test('decodes a custom error with no args', async () => {
  const decoded = await getRevertError(client, {
    abi,
    address,
    functionName: 'simpleCustomReadNoArgs',
  })
  expect(decoded).toEqual({ errorName: 'SimpleErrorNoArgs', args: [] })
})

test('decodes a custom error with struct args', async () => {
  const decoded = await getRevertError(client, {
    abi,
    address,
    functionName: 'complexCustomRead',
  })
  expect(decoded).toEqual({
    errorName: 'ComplexError',
    args: [
      {
        sender: '0x0000000000000000000000000000000000000000',
        bar: 69n,
      },
      'bugger',
      69n,
    ],
  })
})
