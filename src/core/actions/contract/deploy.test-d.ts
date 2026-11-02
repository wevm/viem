import { Abi } from 'ox'
import type { Hex, TransactionReceipt } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Client, http, walletActions } from 'viem'
import { mainnet, near } from 'viem/chains'

const client = Client.create({ transport: http() })
const mainnetClient = Client.create({ chain: mainnet, transport: http() })
const nearClient = Client.create({ chain: near, transport: http() })

const abi = Abi.from(['constructor(address to, uint256 tokenId)'])
const base = {
  abi,
  args: ['0x', 123n],
  bytecode: '0x',
} as const

test('return type is Hex', () => {
  expectTypeOf<Actions.contract.deploy.ReturnType>().toEqualTypeOf<Hex.Hex>()
})

test('sync return type is a transaction receipt', () => {
  expectTypeOf<Actions.contract.deploySync.ReturnType>().toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

test('infers constructor args', async () => {
  await Actions.contract.deploy(client, base)

  // @ts-expect-error missing args
  Actions.contract.deploy(client, {
    abi,
    bytecode: '0x',
  })

  Actions.contract.deploy(client, {
    abi,
    // @ts-expect-error wrong arg type
    args: [123n, 123n],
    bytecode: '0x',
  })
})

test('rejects args when no constructor is present', () => {
  const abi = Abi.from(['function foo()'])

  Actions.contract.deploy(client, {
    abi,
    bytecode: '0x',
  })

  Actions.contract.deploy(client, {
    abi,
    // @ts-expect-error args not allowed
    args: [123n],
    bytecode: '0x',
  })
})

test('rejects access lists', () => {
  Actions.contract.deploy(client, {
    ...base,
    // @ts-expect-error accessList not allowed
    accessList: [],
  })
})

test('CREATE2', () => {
  const options: Actions.contract.deploy.Options<typeof abi, typeof mainnet> = {
    ...base,
    salt: '0x01',
  }
  Actions.contract.deploy(mainnetClient, options)

  Actions.contract.deploy(mainnetClient, {
    ...base,
    salt: '0x01',
  })
  Actions.contract.deploySync(mainnetClient, {
    ...base,
    salt: '0x01',
  })
  mainnetClient.extend(walletActions()).contract.deploy({
    ...base,
    salt: '0x01',
  })

  Actions.contract.deploy(client, {
    ...base,
    create2Address: mainnet.contracts.create2.address,
    salt: '0x01',
  })
  Actions.contract.deploySync(client, {
    ...base,
    create2Address: mainnet.contracts.create2.address,
    salt: '0x01',
  })
  Actions.contract.deploy(client, {
    ...base,
    chain: mainnet,
    salt: '0x01',
  })

  // @ts-expect-error create2Address is required without a configured chain
  Actions.contract.deploy(client, {
    ...base,
    salt: '0x01',
  })
  // @ts-expect-error create2Address is required when the chain does not configure CREATE2
  Actions.contract.deploy(nearClient, {
    ...base,
    salt: '0x01',
  })
  // @ts-expect-error create2Address is required when overriding to a chain without CREATE2
  Actions.contract.deploy(mainnetClient, {
    ...base,
    chain: near,
    salt: '0x01',
  })
  Actions.contract.deploy(mainnetClient, {
    ...base,
    chain: near,
    create2Address: mainnet.contracts.create2.address,
    salt: '0x01',
  })
  // @ts-expect-error create2Address requires a salt
  Actions.contract.deploy(mainnetClient, {
    ...base,
    create2Address: mainnet.contracts.create2.address,
  })
  Actions.contract.deploy(client, {
    ...base,
    create2Address: mainnet.contracts.create2.address,
    // @ts-expect-error salt must be hex
    salt: '01',
  })
})

test('type: legacy', () => {
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('type: eip1559', () => {
  Actions.contract.deploy(client, {
    ...base,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('type: eip2930', () => {
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })

  // @ts-expect-error
  Actions.contract.deploy(client, {
    ...base,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('decorator: contract.deploy threads through walletActions', async () => {
  const decorated = Client.create({ transport: http() }).extend(walletActions())
  const hash = await decorated.contract.deploy(base)
  expectTypeOf(hash).toEqualTypeOf<Hex.Hex>()

  const receipt = await decorated.contract.deploySync(base)
  expectTypeOf(receipt).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})
