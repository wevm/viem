# Introduction to Public Actions [A brief introduction on what Public Actions are in viem.]

A Public Action is an action that maps one-to-one with a "public" Ethereum RPC method (`eth_blockNumber`, `eth_getBalance`, etc). They are used with a [Public Client](/docs/clients/public).

Public Actions do not require any special permissions nor do they provide signing capabilities to the user. Examples of Public Actions include [getting the balance of an account](/docs/actions/public/getBalance), [retrieving the details of a specific transaction](/docs/actions/public/getTransactionReceipt), and [getting the current block number](/docs/actions/public/getBlockNumber) of the network.

Public Actions provide a simple and secure way to access public data on the Ethereum blockchain. They are widely used by dapps and other applications that need to retrieve information about transactions, accounts, blocks and other data on the network.