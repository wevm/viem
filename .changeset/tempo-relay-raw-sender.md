---
"viem": patch
---

Fixed `Relay.feePayer` to recover raw sponsorship senders from their signatures before validation or signing, rejecting mismatched sender placeholders, invalid P256 or WebAuthn signatures, and access keys the sender has not authorized.
