---
"viem": patch
---

Fixed `Actions.zone.deposit` on the moderato Zone A and Zone B portals, which only implement `deposit(address,address,uint128,bytes32)`, and made `Actions.zone.encryptedDeposit` throw before sending to those portals.
