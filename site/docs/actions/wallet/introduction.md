---
head:
  - - meta
    - property: og:title
      content: Introduction to Wallet Actions
  - - meta
    - name: description
      content: A brief introduction to Wallet Actions in viem.
  - - meta
    - property: og:description
      content: A brief introduction to Wallet Actions in viem.

---

# Introduction to Wallet Actions

Wallet Actions are actions that map one-to-one with a "wallet" or "signable" Ethereum RPC method (`eth_requestAccounts`, `eth_sendTransaction`, etc). They are used with a [Wallet Client](/docs/clients/wallet).

Wallet Actions require special permissions and provide signing capabilities. Examples of Wallet Actions include [retrieving the user's account addresses](/docs/actions/wallet/getAddresses), [sending a transaction](/docs/actions/wallet/sendTransaction), and [signing a message](/docs/actions/wallet/signMessage).

Wallet Actions provide a secure and flexible way to access the user's accounts and perform actions on the Ethereum network. They are commonly used by dapps and other applications that need to execute transactions, interact with smart contracts, or sign messages.