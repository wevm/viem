// [!region setup]
import { Expiry, Provider, tempoWallet } from 'accounts'
import { Value } from 'viem'
import { Client, custom, gatewayActions } from 'viem/tempo'

const escrow = '0x4d50500000000000000000000000000000000000'
export const mach = '0x20c000000000000000000000f37de3740adec032'

// Up to 5 MACH for a day, only on the payment-channel escrow.
export const authorize: Provider.create.AuthorizeAccessKey = () => ({
  expiry: Expiry.days(1),
  limits: [{ limit: Value.from('5', 6), token: mach }],
  scopes: [
    { address: escrow, selector: '0xedc53b00' }, // open
    { address: escrow, selector: '0xdc48471e' }, // topUp
    { address: escrow, selector: '0x675402e5' }, // requestClose
    { address: escrow, selector: '0x41e2c664' }, // withdraw
  ],
})

export const provider = Provider.create({
  accessKey: { authorize },
  adapter: tempoWallet(),
})

export const client = Client.create({
  transport: custom(provider),
}).extend(gatewayActions())
// [!endregion setup]
