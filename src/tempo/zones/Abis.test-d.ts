import { AbiEvent, AbiFunction, type Address, type Hex } from 'ox'
import { Abis } from 'viem/tempo/zones'
import { expectTypeOf, test } from 'vitest'

const zeroAddress = '0x0000000000000000000000000000000000000000'
const zeroHash =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

test('zoneFactory supports both parameter shapes', () => {
  const sequencerSet = AbiFunction.encodeData(Abis.zoneFactory, 'createZone', [
    {
      initialToken: zeroAddress,
      admin: zeroAddress,
      sequencers: [zeroAddress],
      threshold: 1,
      rpcUrl: '',
    },
  ])
  const sequencer = AbiFunction.encodeData(Abis.zoneFactory, 'createZone', [
    {
      initialToken: zeroAddress,
      admin: zeroAddress,
      sequencer: zeroAddress,
      verifier: zeroAddress,
      zoneParams: {
        genesisBlockHash: zeroHash,
        genesisTempoBlockHash: zeroHash,
        genesisTempoBlockNumber: 0n,
      },
      rpcUrl: '',
    },
  ])

  expectTypeOf(sequencerSet).toEqualTypeOf<Hex.Hex>()
  expectTypeOf(sequencer).toEqualTypeOf<Hex.Hex>()
})

test('zonePortal decodes withdrawal events', () => {
  const event = AbiEvent.fromAbi(Abis.zonePortal, 'WithdrawalProcessed')
  const decoded = AbiEvent.decode(event, {
    topics: [AbiEvent.getSelector(event), zeroHash, zeroHash],
    data: `${zeroHash}${zeroHash.slice(2)}${zeroHash.slice(2)}`,
  })

  expectTypeOf(decoded).toEqualTypeOf<{
    to: Address.Address
    senderTag: Hex.Hex
    token: Address.Address
    amount: bigint
    callbackSuccess: boolean
  }>()
})
