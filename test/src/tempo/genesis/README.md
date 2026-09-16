# Tempo Test Genesis

`t10.json` uses the [dev genesis from Tempo `25b216a6`](https://github.com/tempoxyz/tempo/blob/25b216a661c2cac72807174583371b582b75c286/crates/chainspec/src/genesis/dev.json), with activation timestamps after T10 removed and the three shared Zone runtimes replaced by the canonical T10 constants in [`crates/contracts/src/zones.rs`](https://github.com/tempoxyz/tempo/blob/25b216a661c2cac72807174583371b582b75c286/crates/contracts/src/zones.rs).

The genesis preserves the local ZoneFactory owner and T10 contract state while tests run with the latest node binary. T9 removes T10 activation and Zone allocations. Tnext uses the node image's dev genesis.
