---
"viem": patch
---

`viem/tempo`: `gatewayActions` paid in the Gateway currency the Client account held most of, threw `Gateway.InsufficientFundsError` (with the account's balances) when it couldn't pay, and explained how to pay in `Gateway.PaymentRequiredError`.
