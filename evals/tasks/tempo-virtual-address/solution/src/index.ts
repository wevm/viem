import {
  Account,
  Actions,
  Client,
  http,
  VirtualAddress,
  VirtualMaster,
} from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0x2e0834786285daccd064ca17f1654f67b4aef298acbb82cef9ec422fb4975622',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const mined = await VirtualMaster.mineSaltAsync({
    address: client.account.address,
    start: 0x2807fa600n,
  })
  if (!mined) throw new Error('no valid salt found')
  const registration = await Actions.virtualAddress.registerMasterSync(client, {
    salt: mined.salt,
  })
  const virtualAddress = VirtualAddress.from({
    masterId: registration.masterId,
    userTag: '0x010203040506',
  })
  const [resolved, direct, unknown] = await Promise.all([
    Actions.virtualAddress.resolve(client, {
      address: virtualAddress,
    }),
    Actions.virtualAddress.resolve(client, {
      address: registration.masterAddress,
    }),
    Actions.virtualAddress.resolve(client, {
      address: '0xdeadbeeffdfdfdfdfdfdfdfdfdfd010203040506',
    }),
  ])
  return { direct, registration, resolved, unknown, virtualAddress }
}
