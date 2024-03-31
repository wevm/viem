---
"viem": patch
---

Fixed regression where `getAddress` threw an error for non-checksum addresses instead of converting to a valid checksum address.
