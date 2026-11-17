// [!region setup]
import {
  Account as ReferenceAccount,
  Client as ReferenceClient,
  http as referenceHttp,
} from 'viem'
import { mainnet as referenceChain } from 'viem/chains'

const client = ReferenceClient.create({
  account: ReferenceAccount.fromPrivateKey('0x...'),
  chain: referenceChain,
  transport: referenceHttp(),
})
// [!endregion setup]
