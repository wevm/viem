import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { readContract } from '../../src/actions/public/readContract.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { writeContract } from '../../src/actions/wallet/writeContract.js'
import { baseSepolia } from '../../src/chains/index.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { accountConfigurationAbi } from '../../src/experimental/eip8130/abis.js'
import { getEip8130Deployment } from '../../src/experimental/eip8130/deployments.js'
import { key } from '../../src/experimental/eip8130/keys.js'
import { computeAddress8130 } from '../../src/experimental/eip8130/utils/computeAddress.js'
import { erc1167Bytecode } from '../../src/experimental/eip8130/utils/proxy.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'
const SALT_LABEL = process.env.SALT_LABEL ?? 'viem-eip8130-demo-1'

describe.runIf(PRIVATE_KEY)('setup an EIP-8130 account on Base Sepolia', () => {
  test('computeAddress matches on-chain and createAccount lands', async () => {
    const owner = privateKeyToAccount(PRIVATE_KEY!)
    const client = createClient({
      account: owner,
      chain: baseSepolia,
      transport: http(RPC_URL),
    })

    const deployment = getEip8130Deployment(baseSepolia.id)!
    const code = erc1167Bytecode(deployment.accounts.erc4337)
    const initialActors = [key.k1(owner.address)]
    const userSalt = keccak256(stringToHex(SALT_LABEL))
    const initialActorsArg = initialActors.map((a) => ({
      actorId: a.actorId,
      authenticator: a.authenticator,
    }))

    const local = computeAddress8130({ userSalt, code, initialActors })
    const onchain = await readContract(client, {
      abi: accountConfigurationAbi,
      address: deployment.accountConfiguration,
      functionName: 'computeAddress',
      args: [userSalt, code, initialActorsArg],
    })

    console.log('\n— EIP-8130 account setup (Base Sepolia) —')
    console.log('owner (EOA):     ', owner.address)
    console.log('account (local): ', local)
    console.log('account (onchain):', onchain)
    expect(local.toLowerCase()).toBe(onchain.toLowerCase())

    const existing = await getCode(client, { address: local })
    if (existing && existing !== '0x') {
      console.log('already deployed; skipping createAccount.')
      return
    }

    console.log('sending createAccount...')
    const hash = await writeContract(client, {
      abi: accountConfigurationAbi,
      address: deployment.accountConfiguration,
      functionName: 'createAccount',
      args: [userSalt, code, initialActorsArg],
      chain: baseSepolia,
      account: owner,
    })
    console.log('tx:              ', `https://sepolia.basescan.org/tx/${hash}`)

    const receipt = await waitForTransactionReceipt(client, { hash })
    console.log('status:          ', receipt.status)
    console.log(
      'account:         ',
      `https://sepolia.basescan.org/address/${local}`,
    )
    expect(receipt.status).toBe('success')

    // Public RPCs are load-balanced; poll to avoid reading a lagging replica.
    let deployed: `0x${string}` | undefined
    for (let i = 0; i < 10; i++) {
      deployed = await getCode(client, { address: local })
      if (deployed && deployed !== '0x') break
      await new Promise((r) => setTimeout(r, 1500))
    }
    console.log('code:            ', deployed)
    expect(deployed && deployed !== '0x').toBeTruthy()
  }, 120_000)
})
