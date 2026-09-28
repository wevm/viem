import { Account } from 'viem/tempo'

export const root = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)

export const accessKey = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000002',
  { access: root },
)

export const multisig = Account.fromMultisig({
  owners: [{ owner: root.address, weight: 1 }],
  threshold: 1,
})
