import * as AbiParameters from 'ox/AbiParameters'
import * as Hash from 'ox/Hash'
import type * as Hex from 'ox/Hex'
import * as Hex_ from 'ox/Hex'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'

import { accounts } from './constants.js'
import { createServer } from './http.js'

const nameParameters = /*#__PURE__*/ AbiParameters.from('string')
const resultParameters = /*#__PURE__*/ AbiParameters.from(
  'address, bytes32, bytes',
)

/**
 * Spawns a CCIP gateway for `OffchainLookupExample`: responds with the
 * requested name's hash and a fixed signature over `keccak256('jxom.viem')`
 * from account 0, so only lookups for `jxom.viem` verify onchain.
 */
export function createCcipServer() {
  return createServer(async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })

    const data = req.url!.split('/')[2] as Hex.Hex
    const [name] = AbiParameters.decode(nameParameters, data)

    const signature = Signature.toHex(
      Secp256k1.sign({
        payload: Hash.keccak256(Hex_.fromString('jxom.viem')),
        privateKey: accounts[0].privateKey,
      }),
    )

    res.end(
      JSON.stringify({
        data: AbiParameters.encode(resultParameters, [
          accounts[0].address,
          Hash.keccak256(Hex_.fromString(name)),
          signature,
        ]),
      }),
    )
  })
}
