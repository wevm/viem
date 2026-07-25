Our Tempo payments platform accepts deposits through TIP-1022 virtual
addresses.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the master account derived from
private key
`0x2e0834786285daccd064ca17f1654f67b4aef298acbb82cef9ec422fb4975622`.
Starting at salt `0x2807fa600`, mine a valid registration salt and register
the account as a master. Derive its virtual address for six-byte user tag
`0x010203040506`, then resolve that address through the registry.

Also resolve the non-virtual master address itself and the unregistered
virtual address `0xdeadbeeffdfdfdfdfdfdfdfdfdfd010203040506`. Return the
registration result, derived address, and all three resolutions.

Use the installed `viem`, `http://tempo:8545`, and a 100 ms polling interval.
Do not add dependencies.

When you are done, `npm run build` must pass.
