import { beforeAll, describe, expect, test } from 'vitest'

import { EoaOptional } from '~contracts/generated.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { deploy } from '~test/utils.js'
import { generatePrivateKey } from '../../accounts/generatePrivateKey.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { signAuthorization } from '../wallet/signAuthorization.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getDelegation } from './getDelegation.js'

const client = anvilMainnet.getClient({ account: true })
const localAccount = privateKeyToAccount(accounts[0].privateKey)

describe('getDelegation', () => {
  let delegation: `0x${string}`

  beforeAll(async () => {
    const { contractAddress } = await deploy(client, {
      abi: EoaOptional.abi,
      bytecode: EoaOptional.bytecode.object,
    })
    delegation = contractAddress!
  })

  test('returns undefined for non-delegated EOA', async () => {
    const result = await getDelegation(client, {
      address: localAccount.address,
    })
    expect(result).toBeUndefined()
  })

  test('returns undefined for contract address', async () => {
    const result = await getDelegation(client, {
      address: delegation,
    })
    expect(result).toBeUndefined()
  })

  test('returns delegated address for EIP-7702 delegated account', async () => {
    const account = privateKeyToAccount(generatePrivateKey())

    // Create delegation
    const authorization = await signAuthorization(client, {
      account,
      address: delegation,
    })

    await sendTransaction(client, {
      authorizationList: [authorization],
      gas: 1_000_000n,
    })
    await mine(client, { blocks: 1 })

    const result = await getDelegation(client, {
      address: account.address,
    })
    expect(result).toBe(getAddress(delegation))
  })

  test('with blockNumber', async () => {
    const account = privateKeyToAccount(generatePrivateKey())

    const blockNumberBefore = await getBlockNumber(client)

    // Create delegation
    const authorization = await signAuthorization(client, {
      account,
      address: delegation,
    })

    await sendTransaction(client, {
      authorizationList: [authorization],
      gas: 1_000_000n,
    })
    await mine(client, { blocks: 1 })

    // Should be undefined at the block before delegation
    const resultBefore = await getDelegation(client, {
      address: account.address,
      blockNumber: blockNumberBefore,
    })
    expect(resultBefore).toBeUndefined()

    // Should have delegation at current block
    const resultAfter = await getDelegation(client, {
      address: account.address,
    })
    expect(resultAfter).toBe(getAddress(delegation))
  })

  test('with blockTag', async () => {
    const account = privateKeyToAccount(generatePrivateKey())

    // Create delegation
    const authorization = await signAuthorization(client, {
      account,
      address: delegation,
    })

    await sendTransaction(client, {
      authorizationList: [authorization],
      gas: 1_000_000n,
    })
    await mine(client, { blocks: 1 })

    const result = await getDelegation(client, {
      address: account.address,
      blockTag: 'latest',
    })
    expect(result).toBe(getAddress(delegation))
  })
})
