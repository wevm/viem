import { encodeFunctionData, type Hex, zeroAddress, zeroHash } from 'viem'
import { Abis } from 'viem/tempo/zones'
import { expectTypeOf, test } from 'vitest'

test('zoneFactory supports both parameter shapes', () => {
  const sequencerSet = encodeFunctionData({
    abi: Abis.zoneFactory,
    functionName: 'createZone',
    args: [
      {
        initialToken: zeroAddress,
        admin: zeroAddress,
        sequencers: [zeroAddress],
        threshold: 1,
        rpcUrl: '',
      },
    ],
  })
  const sequencer = encodeFunctionData({
    abi: Abis.zoneFactory,
    functionName: 'createZone',
    args: [
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
    ],
  })

  expectTypeOf(sequencerSet).toEqualTypeOf<Hex>()
  expectTypeOf(sequencer).toEqualTypeOf<Hex>()
})
