import {
  decodeAbiParameters,
  encodeAbiParameters,
  parseAbiParameters,
} from '../utils/abi/index.js'
import { sign } from '../accounts/utils/sign.js'
import { signatureToHex } from '../accounts/utils/signatureToHex.js'
import { stringToHex } from '../utils/encoding/index.js'
import { keccak256 } from '../utils/hash/index.js'
import { accounts } from './constants.js'
import { createHttpServer } from './utils.js'
import type { Hex } from '../types/index.js'

export function createCcipServer() {
  return createHttpServer(async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })
    const signature = signatureToHex(
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
