import { expect, test } from 'vitest'
import { wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { encodeFunctionData, parseEther } from '../../utils/index.js'
import { createAccessList } from './createAccessList.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const result = await createAccessList(client, {
    data: encodeFunctionData({
      abi: wagmiContractConfig.abi,
      functionName: 'name',
    }),
    to: wagmiContractConfig.address,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('args: blockNumber', async () => {
  const result = await createAccessList(client, {
    blockNumber: 22263623n,
    data: encodeFunctionData({
      abi: wagmiContractConfig.abi,
      functionName: 'name',
    }),
    to: wagmiContractConfig.address,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('behavior: revert', async () => {
  await expect(() =>
    createAccessList(client, {
      data: encodeFunctionData({
        abi: wagmiContractConfig.abi,
        functionName: 'safeTransferFrom',
        args: [accounts[0].address, accounts[1].address, parseEther('1')],
      }),
      to: wagmiContractConfig.address,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [CallExecutionError: Execution reverted with reason: ERC721: operator query for nonexistent token.

    Raw Call Arguments:
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      data:  0x42842e0e000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000

    Details: execution reverted: ERC721: operator query for nonexistent token
    Version: viem@x.y.z]
  `)
})
