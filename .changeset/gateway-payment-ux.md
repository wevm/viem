---
"viem": patch
---

`viem/tempo`: `gatewayActions` now pays in the Gateway currency the Client account holds most of, throws `Gateway.InsufficientFundsError` (with the account's balances) when it can't pay, and explains how to pay in `Gateway.PaymentRequiredError`.
