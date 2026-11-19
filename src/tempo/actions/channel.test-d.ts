import { expectTypeOf, test } from 'vitest'
import { readContract } from '../../actions/public/readContract.js'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { decorator } from '../Decorator.js'
import { Channel } from '../index.js'
import * as channelActions from './channel.js'

const client = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempoModerato,
  transport: custom({
    async request() {
      return null
    },
  }),
}).extend(decorator())

const channel = Channel.from({
  expiringNonceHash: `0x${'00'.repeat(32)}`,
  payee: '0x0000000000000000000000000000000000000002',
  payer: client.account.address,
  salt: `0x${'00'.repeat(32)}`,
  token: '0x20c0000000000000000000000000000000000001',
})

const args = {
  channel,
  cumulativeAmount: 1n,
  signature: '0x01',
} as const

test('verifyVoucher returns a boolean', async () => {
  expectTypeOf(
    await channelActions.verifyVoucher(client, args),
  ).toEqualTypeOf<boolean>()
  expectTypeOf(
    await client.channel.verifyVoucher({ ...args, blockTag: 'latest' }),
  ).toEqualTypeOf<boolean>()
})

test('verifyVoucher.call works with readContract', async () => {
  const call = channelActions.verifyVoucher.call(args)
  expectTypeOf(call.functionName).toEqualTypeOf<'verifyVoucher'>()
  expectTypeOf(await readContract(client, call)).toEqualTypeOf<boolean>()
})

test('verifyVoucher requires a channel descriptor and signature', async () => {
  // @ts-expect-error missing signature
  await channelActions.verifyVoucher(client, {
    channel,
    cumulativeAmount: 1n,
  })
  channelActions.verifyVoucher.call({
    ...args,
    // @ts-expect-error a channel ID is not a channel descriptor
    channel: `0x${'00'.repeat(32)}`,
  })
})
