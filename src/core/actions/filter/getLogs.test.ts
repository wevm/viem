import * as AbiEvent from 'ox/AbiEvent'
import * as Address from 'ox/Address'
import type * as Hex from 'ox/Hex'
import { z } from 'ox/zod'
import { Actions } from 'viem'
import { expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

const { address } = await contract.deploy(client, {
  bytecode: generated.Events.bytecode.object,
})

async function transfer(from: Hex.Hex, to: Hex.Hex, value: bigint) {
  await Actions.contract.write(client, {
    abi: generated.Events.abi,
    account: a,
    address,
    args: [from, to, value],
    functionName: 'emitTransfer',
  })
  await Actions.test.block.mine(client, { blocks: 1 })
}

test('default: returns all logs for the filter', async () => {
  const fromBlock = await Actions.block.getNumber(client, { cacheTime: 0 })
  const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_newFilter')
  const id = await client.request({
    method: 'eth_newFilter',
    params: z.RpcSchema.encodeParams(item, [
      { address, fromBlock, topics: AbiEvent.encode(transferEvent).topics },
    ]),
  })
  const filter = {
    id,
    request: client.request,
    type: 'event',
    abiEvent: transferEvent,
  } as const

  await transfer(a, b, 1n)
  await transfer(a, c, 1n)

  // Unlike `getChanges`, `getLogs` is not drained by polling.
  const first = await Actions.filter.getLogs(client, { filter })
  const second = await Actions.filter.getLogs(client, { filter })
  expect(first.length).toBe(2)
  expect(second.length).toBe(2)
  expect(first[0]!.args).toEqual({
    from: Address.checksum(a),
    to: Address.checksum(b),
    value: 1n,
  })
  expect(first[1]!.args.to).toBe(Address.checksum(c))

  await Actions.filter.uninstall(client, { filter })
})
