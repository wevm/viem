import { expect, test } from 'vitest'
import { mockClientPublicActionsL2 } from '../../../../test/src/zksync.js'
import { zkLocalChainL2 } from '../../../chains/definitions/zkLocalChainL2.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { getProtocolVersion } from './getProtocolVersion.js'

const clientL2 = createClient({
  chain: zkLocalChainL2,
  transport: http(),
})

mockClientPublicActionsL2(clientL2)

test('default', async () => {
  const protocolVersion = await getProtocolVersion(clientL2, {})
  expect(protocolVersion).toMatchInlineSnapshot(`
    {
      "base_system_contracts": {
        "bootloader": "0x010008e742608b21bf7eb23c1a9d0602047e3618b464c9b59c0fba3b3d7ab66e",
        "default_aa": "0x01000563374c277a2c1e34659a2a1e87371bb6d852ce142022d497bfb50b9e32",
      },
      "l2_system_upgrade_tx_hash": "0x0b198075f23eba8137d7c071e5b9e594a4acabb85dfbd59b4b5dd326a54671ed",
      "timestamp": 0,
      "verification_keys_hashes": {
        "params": {
          "recursion_circuits_set_vks_hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "recursion_leaf_level_vk_hash": "0x435202d277dd06ef3c64ddd99fda043fc27c2bd8b7c66882966840202c27f4f6",
          "recursion_node_level_vk_hash": "0xf520cd5b37e74e19fdb369c8d676a04dce8a19457497ac6686d2bb95d94109c8",
        },
        "recursion_scheduler_level_vk_hash": "0x1d485be42d712856dfe85b3cf7823f020fa5f83cb41c83f9da307fdc2089beee",
      },
      "version_id": 24,
    }
  `)
})
