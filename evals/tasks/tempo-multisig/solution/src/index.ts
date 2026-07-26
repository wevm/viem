import { RpcError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Addresses, Client, http } from 'viem/tempo'
import { Value } from 'viem/utils'

const client = Client.create({
  account: Account.fromSecp256k1(
    '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  ),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})

export async function example() {
  const firstOwner = Account.fromSecp256k1(
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  )
  const secondOwner = Account.fromSecp256k1(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  )
  const thirdOwner = Account.fromSecp256k1(
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
  )
  const multisig = Account.fromMultisig({
    owners: [
      { owner: firstOwner.address, weight: 1 },
      { owner: secondOwner.address, weight: 1 },
      { owner: thirdOwner.address, weight: 1 },
    ],
    threshold: 2,
  })
  const amount = Value.from('10.5', 6)
  await Actions.token.transferSync(client, {
    amount: Value.from('11.5', 6),
    to: multisig.address,
    token: Addresses.pathUsd,
  })
  const { request } = await client.transaction.prepare({
    account: multisig,
    calls: [
      Actions.token.transfer.call({
        amount,
        to: '0x4545454545454545454545454545454545454545',
        token: Addresses.pathUsd,
      }),
    ],
  })
  const signatures = await Promise.all([
    client.signTransaction({
      ...request,
      account: firstOwner,
    }),
    client.signTransaction({
      ...request,
      account: thirdOwner,
    }),
  ])
  const receipt = await client.transaction.sendSync({
    ...request,
    account: multisig,
    signatures,
  })

  const fourthOwner = Account.fromSecp256k1(
    '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  )
  const fifthOwner = Account.fromSecp256k1(
    '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  )
  const sixthOwner = Account.fromSecp256k1(
    '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  )
  const rejectedMultisig = Account.fromMultisig({
    owners: [
      { owner: fourthOwner.address, weight: 1 },
      { owner: fifthOwner.address, weight: 1 },
      { owner: sixthOwner.address, weight: 1 },
    ],
    threshold: 2,
  })
  const rejectedAmount = Value.from('3', 6)
  await Actions.token.transferSync(client, {
    amount: Value.from('4', 6),
    to: rejectedMultisig.address,
    token: Addresses.pathUsd,
  })
  const { request: rejectedRequest } = await client.transaction.prepare({
    account: rejectedMultisig,
    calls: [
      Actions.token.transfer.call({
        amount: rejectedAmount,
        to: '0x4646464646464646464646464646464646464646',
        token: Addresses.pathUsd,
      }),
    ],
  })
  const rejectedSignature = await client.signTransaction({
    ...rejectedRequest,
    account: fifthOwner,
  })
  const rejected = await client.transaction
    .sendSync({
      ...rejectedRequest,
      account: rejectedMultisig,
      signatures: [rejectedSignature],
    })
    .then(() => false)
    .catch((error: unknown) => {
      if (
        error instanceof RpcError.ExecutionError &&
        /multisig|signature|threshold|weight/i.test(error.cause.message)
      )
        return true
      throw error
    })

  return { multisig: multisig.address, receipt, rejected }
}
