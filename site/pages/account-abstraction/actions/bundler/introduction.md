# Introduction to Bundler Actions [A brief introduction to Bundler Actions in viem.]

Bundler Actions are actions that map to **ERC-4337 Bundler** JSON-RPC methods (`eth_sendUserOperation`, `eth_estimateUserOperationGas`, etc). They are used with a [Bundler Client](/account-abstraction/clients/bundler).

Bundler Actions are used to prepare, estimate, send, and retrieve **User Operations**. Examples of Bundler Actions include [estimating the gas values for a User Operation](/account-abstraction/actions/bundler/estimateUserOperationGas), [sending a User Operation](/account-abstraction/actions/bundler/sendUserOperation), and [waiting for a User Operation receipt](/account-abstraction/actions/bundler/waitForUserOperationReceipt).

Bundler Actions provide the main interface for Account Abstraction workflows. They can work with a [Smart Account](/account-abstraction/accounts/smart), a [Paymaster Client](/account-abstraction/clients/paymaster), and the underlying Public Client to construct User Operations before submitting them to a bundler.
