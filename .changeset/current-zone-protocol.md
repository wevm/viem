---
"viem": minor
---

Updated Zone actions for the current protocol.

- **Breaking (viem/tempo):** Removed the plaintext `zone.deposit` and `zone.depositSync` actions in favor of the existing encrypted deposit actions and preparation helpers.

  ```diff
  - await client.zone.deposit(parameters)
  + await client.zone.encryptedDeposit(parameters)

  - await client.zone.depositSync(parameters)
  + await client.zone.encryptedDepositSync(parameters)
  ```

  ```diff
  - const calls = client.zone.deposit.calls(args)
  + const prepared = await client.zone.encryptedDeposit.prepare({
  +   ...args,
  +   sender: client.account.address,
  + })
  + const calls = client.zone.encryptedDeposit.calls(prepared)
  ```

- **Breaking (viem/tempo):** Added deposit memo validation and rejected prepared deposits whose sender or parent-chain ID did not match the broadcasting account or client chain.

- **Breaking (viem/tempo):** Required `zone_getZoneInfo` responses to include `tempoBlockNumber`, removing the fallback to the obsolete `zone_getDepositStatus` RPC method.

- Fixed authorization token scopes for Moderato Zones using the chain's `sourceId`, while preserving legacy `Zone.a` and `Zone.b` scopes.

- Fixed portal address derivation for current Zone 6/7 chain IDs while preserving legacy addresses for raw Zone IDs `6` and `7`.

  ```diff
   const hash = await client.zone.encryptedDeposit({
     ...parameters,
     zoneId: 6,
  +  portalAddress: Addresses.zonePortal(1_424_310_006), // Current Moderato Zone 6.
   })
  ```

- Added `isAccessEnforced` and `isGatewayOpen` to `zone.getZoneInfo` results.

- Corrected the deposit-outcome guide to correlate inbox events using `DepositMade.newCurrentDepositQueueHash`.
