# Introduction to Clients & Transports

## Clients

A **Client** provides access to a subset of **Actions**. A **Client** in the context of viem is similar to an [Ethers.js Provider](/TODO).

There are three types of **Clients** in viem:

- A [Public Client](/TODO) which provides access to [Public Actions](/TODO), such as `fetchBlockNumber` and `fetchBalance`. 
- A [Wallet Client](/TODO) which provides access to [Wallet Actions](/TODO), such as `sendTransaction` and `signMessage`.
- A [Test Client](/TODO) which provides access to [Test Actions](/TODO), such as `mine` and `impersonate`.

## Transports

A **Client** is instantiated with a **Transport**, which is the intermediary layer that is responsible for executing outgoing requests (ie. RPC requests).

There are three types of Transports in viem: 

- A [HTTP Transport](/TODO) that executes requests via a HTTP JSON-RPC API.
- A [WebSocket Transport](/TODO) that executes requests via a WebSocket JSON-RPC API.
- An [Ethereum Provider Transport](/TODO) that executes requests via an [EIP-1193 Provider](/TODO) (such as `window.ethereum`).