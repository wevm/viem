# Introduction to Clients & Transports [A brief introduction to Clients & Transports.]

## Clients

A **Client** provides access to a subset of **Actions**. 

> A **Client** in the context of viem is similar to an [Ethers.js Provider](https://docs.ethers.org/v5/api/providers/).

There are three types of **Clients** in viem:

- A [Public Client](/docs/clients/public) which provides access to [Public Actions](/docs/actions/public/introduction), such as `getBlockNumber` and `getBalance`. 
- A [Wallet Client](/docs/clients/wallet) which provides access to [Wallet Actions](/docs/actions/wallet/introduction), such as `sendTransaction` and `signMessage`.
- A [Test Client](/docs/clients/test) which provides access to [Test Actions](/docs/actions/test/introduction), such as `mine` and `impersonate`.

## Transports

A **Client** is instantiated with a **Transport**, which is the intermediary layer that is responsible for executing outgoing requests (ie. RPC requests).

There are three types of Transports in viem: 

- A [HTTP Transport](/docs/clients/transports/http) that executes requests via a HTTP JSON-RPC API.
- A [WebSocket Transport](/docs/clients/transports/websocket) that executes requests via a WebSocket JSON-RPC API.
- A [Custom Transport](/docs/clients/transports/custom) that executes requests via an [EIP-1193 `request` function](https://eips.ethereum.org/EIPS/eip-1193).