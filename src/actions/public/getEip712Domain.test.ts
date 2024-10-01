import { expect, test } from 'vitest'
import { SoladyAccountFactory07 } from '~contracts/generated.js'
import { anvilMainnet } from '~test/src/anvil.js'
import { accounts } from '~test/src/constants.js'
import { deploySoladyAccount_07 } from '~test/src/utils.js'
import { encodeFunctionData, pad } from '../../utils/index.js'
import { mine } from '../test/mine.js'
import { writeContract } from '../wallet/writeContract.js'
import { getEip712Domain } from './getEip712Domain.js'
import { readContract } from './readContract.js'
import { simulateContract } from './simulateContract.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const { result: address, request } = await simulateContract(client, {
    account: accounts[0].address,
    abi: SoladyAccountFactory07.abi,
    address: factoryAddress,
    functionName: 'createAccount',
    args: [accounts[0].address, pad('0x0')],
  })
  await writeContract(client, request)
  await mine(client, { blocks: 1 })

  const { domain, ...rest } = await getEip712Domain(client, {
    address,
  })
  const { verifyingContract, ...restDomain } = domain
  expect(verifyingContract).toBeDefined()
  expect(rest).toMatchInlineSnapshot(`
      {
        "extensions": [],
        "fields": "0x0f",
      }
    `)
  expect(restDomain).toMatchInlineSnapshot(`
    {
      "chainId": 1,
      "name": "SoladyAccount",
      "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "version": "1",
    }
  `)
})

test('counterfactual call', async () => {
  const { factoryAddress } = await deploySoladyAccount_07()

  const address = await readContract(client, {
    account: accounts[0].address,
    abi: SoladyAccountFactory07.abi,
    address: factoryAddress,
    functionName: 'getAddress',
    args: [pad('0x0')],
  })

  const { domain, ...rest } = await getEip712Domain(client, {
    address,
    factory: factoryAddress,
    factoryData: encodeFunctionData({
      abi: SoladyAccountFactory07.abi,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x0')],
    }),
  })
  const { verifyingContract, ...restDomain } = domain
  expect(verifyingContract).toBeDefined()
  expect(rest).toMatchInlineSnapshot(`
      {
        "extensions": [],
        "fields": "0x0f",
      }
    `)
  expect(restDomain).toMatchInlineSnapshot(`
    {
      "chainId": 1,
      "name": "SoladyAccount",
      "salt": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "version": "1",
    }
  `)
})

test('error: non-existent', async () => {
  await expect(() =>
    getEip712Domain(client, {
      address: '0x0000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [Eip712DomainNotFoundError: No EIP-712 domain found on contract "0x0000000000000000000000000000000000000000".

    Ensure that:
    - The contract is deployed at the address "0x0000000000000000000000000000000000000000".
    - \`eip712Domain()\` function exists on the contract.
    - \`eip712Domain()\` function matches signature to ERC-5267 specification.

    Version: viem@x.y.z]
  `,
  )
})

test('error: default', async () => {
  await expect(() =>
    getEip712Domain(client, {
      address: '0x00000000000000000000000000000000000000000',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [ContractFunctionExecutionError: Address "0x00000000000000000000000000000000000000000" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.
     
    Raw Call Arguments:
      to:    0x00000000000000000000000000000000000000000
      data:  0x84b0196e
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  eip712Domain()

    Docs: https://viem.sh/docs/contract/readContract
    Version: viem@x.y.z]
  `,
  )
})
