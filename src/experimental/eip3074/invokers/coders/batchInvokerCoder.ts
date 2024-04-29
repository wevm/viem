import type { Address } from 'abitype'
import { readContract } from '../../../../actions/public/readContract.js'
import type { Hex } from '../../../../types/misc.js'
import { encodeAbiParameters } from '../../../../utils/abi/encodeAbiParameters.js'
import { encodePacked } from '../../../../utils/abi/encodePacked.js'
import { concat } from '../../../../utils/data/concat.js'
import { size } from '../../../../utils/data/size.js'
import { invokerAbi } from '../../constants/abis.js'
import { defineInvokerCoder } from './defineInvokerCoder.js'

type Calls = readonly {
  to: Address
  data?: Hex | undefined
  value?: bigint | undefined
}[]

export type BatchInvokerArgs = Calls

export function batchInvokerCoder() {
  return defineInvokerCoder({
    async toExecData(
      args: BatchInvokerArgs,
      { authority, client, invokerAddress },
    ) {
      const nonce = await readContract(client, {
        abi: invokerAbi,
        address: invokerAddress,
        functionName: 'nextNonce',
        args: [authority],
      })

      const calls = concat(
        args.map(({ data = '0x', to, value = 0n }) =>
          encodePacked(
            ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
            [2, to, value, BigInt(size(data)), data],
          ),
        ),
      )
      return encodeAbiParameters(
        [{ type: 'uint256' }, { type: 'bytes' }],
        [nonce, calls],
      )
    },
  })
}
