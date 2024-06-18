---
description: Signs a personal sign message via Solady's ERC-1271 format.
---

# signMessage

Signs a [EIP-191](https://eips.ethereum.org/EIPS/eip-191) personal sign message via Solady's [ERC1271 `PersonalSign` format](https://github.com/Vectorized/solady/blob/678c9163550810b08f0ffb09624c9f7532392303/src/accounts/ERC1271.sol#L154-L166).

This Action is suitable to sign messages for Smart Accounts that implement (or conform to) Solady's [ERC1271.sol](https://github.com/Vectorized/solady/blob/main/src/accounts/ERC1271.sol).

With the calculated signature, you can use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage) to verify the signature

## Usage

