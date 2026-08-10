import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { readContract } from '../../src/actions/public/readContract.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { sendTransaction } from '../../src/actions/wallet/sendTransaction.js'
import { baseSepolia } from '../../src/chains/index.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { accountConfigurationAbi } from '../../src/experimental/eip8130/abis.js'
import { actorScope } from '../../src/experimental/eip8130/constants.js'
import { getEip8130Deployment } from '../../src/experimental/eip8130/deployments.js'
import { authorizeActor, key } from '../../src/experimental/eip8130/keys.js'
import { encodeApplySignedActorChangesData } from '../../src/experimental/eip8130/utils/accountConfigCalls.js'
import { computeAddress } from '../../src/experimental/eip8130/utils/computeAddress.js'
import { erc1167Bytecode } from '../../src/experimental/eip8130/utils/proxy.js'
import { signActorChanges } from '../../src/experimental/eip8130/utils/signActorChanges.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'
const SALT_LABEL = process.env.SALT_LABEL ?? 'viem-eip8130-demo-1'

describe.runIf(PRIVATE_KEY)(
  'authorize a P-256 session key on Base Sepolia',
  () => {
    test('applySignedActorChanges authorizes a scoped P-256 actor', async () => {
      const owner = privateKeyToAccount(PRIVATE_KEY!)
      const client = createClient({
        account: owner,
        chain: baseSepolia,
        transport: http(RPC_URL),
      })

      const deployment = getEip8130Deployment(baseSepolia.id)!

      // Re-derive the account deployed by setupAccount.test.ts.
      const code = erc1167Bytecode(deployment.accounts.erc4337)
      const initialActors = [key.k1(owner.address)]
      const userSalt = keccak256(stringToHex(SALT_LABEL))
      const account = computeAddress({ userSalt, code, initialActors })

      const deployed = await getCode(client, { address: account })
      if (!deployed || deployed === '0x')
        throw new Error('account not deployed; run setupAccount first')

      // A new P-256 session key (any 32-byte x/y; on-curve validity is only
      // checked by the authenticator at use-time, not at authorization).
      const x = keccak256(stringToHex('viem-eip8130-p256-x'))
      const y = keccak256(stringToHex('viem-eip8130-p256-y'))
      const sessionKey = key.p256({ x, y })

      const change = authorizeActor(sessionKey, { scope: actorScope.sender })

      // applySignedActorChanges consumes the current channel sequence (the
      // post-increment read). createAccount sets the local channel to 1.
      const seq = await readContract(client, {
        abi: accountConfigurationAbi,
        address: deployment.accountConfiguration,
        functionName: 'getChangeSequences',
        args: [account],
      })

      const chainId = baseSepolia.id
      const signed = await signActorChanges({
        signer: owner,
        account,
        chainId,
        sequence: Number(seq.local),
        actorChanges: [change],
      })

      console.log('\n— EIP-8130 authorize session key (Base Sepolia) —')
      console.log('account:         ', account)
      console.log('session actorId: ', sessionKey.actorId)
      console.log('p256 authenticator:', sessionKey.authenticator)
      console.log('local sequence:  ', seq.local.toString())

      const data = encodeApplySignedActorChangesData({
        account,
        chainId,
        actorChanges: [change],
        auth: signed.auth,
      })

      const hash = await sendTransaction(client, {
        to: deployment.accountConfiguration,
        data,
        chain: baseSepolia,
        account: owner,
      })
      console.log(
        'tx:              ',
        `https://sepolia.basescan.org/tx/${hash}`,
      )

      const receipt = await waitForTransactionReceipt(client, { hash })
      console.log('status:          ', receipt.status)
      expect(receipt.status).toBe('success')

      // Verify the actor was written with the expected authenticator + scope.
      let config: { authenticator: string; scope: number } | undefined
      for (let i = 0; i < 10; i++) {
        config = (await readContract(client, {
          abi: accountConfigurationAbi,
          address: deployment.accountConfiguration,
          functionName: 'getActorConfig',
          args: [account, sessionKey.actorId],
        })) as { authenticator: string; scope: number }
        if (
          config.authenticator.toLowerCase() ===
          sessionKey.authenticator.toLowerCase()
        )
          break
        await new Promise((r) => setTimeout(r, 1500))
      }
      console.log('actor config:    ', config)
      expect(config?.authenticator.toLowerCase()).toBe(
        sessionKey.authenticator.toLowerCase(),
      )
      expect(Number(config?.scope)).toBe(actorScope.sender)
    }, 120_000)
  },
)
