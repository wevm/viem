import { sign } from '~viem/accounts/utils/sign.js'
import { parseAbiParameters } from '~viem/index.js'
import type { Hex } from '~viem/types/misc.js'
import { decodeAbiParameters } from '~viem/utils/abi/decodeAbiParameters.js'
import { encodeAbiParameters } from '~viem/utils/abi/encodeAbiParameters.js'
import { stringToHex } from '~viem/utils/encoding/toHex.js'
import { keccak256 } from '~viem/utils/hash/keccak256.js'
import { serializeSignature } from '~viem/utils/signature/serializeSignature.js'

import { accounts } from './constants.js'
import { createHttpServer } from './utils.js'

export function createCcipServer() {
  return createHttpServer(async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    const signature = serializeSignature(
      await sign({
        hash: keccak256(stringToHex('jxom.viem')),
        privateKey: accounts[0].privateKey,
      }),
    )

    const data = req.url?.split('/')[2]! as Hex
    const [name] = decodeAbiParameters(parseAbiParameters('string'), data)

    res.end(
      JSON.stringify({
        data: encodeAbiParameters(parseAbiParameters('address,bytes32,bytes'), [
          accounts[0].address,
          keccak256(stringToHex(name)),
          signature,
        ]),
      }),
    )
  })
}
