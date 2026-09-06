---
"viem": patch
---

Fixed the SIWE scheme check accepting a comma. `[a-zA-Z0-9+-.]` reads `+-.` as a character range (`+` `,` `-` `.`), so `createSiweMessage` did not reject a scheme such as `ht,tps` despite validating against RFC 3986, and `parseSiweMessage` returned it as `scheme`.
