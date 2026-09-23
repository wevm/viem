# Funding Conformance

Run `pnpm test --run --project tempo-funding` with Docker available.

The dedicated project uses Tempo commit `492639758d54b83ddd68f4a4b7a67e5c51221c0e`, built by https://github.com/tempoxyz/tempo/actions/runs/35911644417, pinned by image digest in `setup.global.funding.ts`. It uses port 9546 and stops its node instances after testing.

Ox is pinned to https://pkg.pr.new/ox@b391bbf. The suite creates TIP-20 input tokens and native DEX liquidity. Owner funding needs no funding policy, so it deploys no policy contract.

The draft node underestimates gas for some source combinations. Execution fixtures supply an explicit gas limit; estimation and simulation are tested separately. RPC signing is tested by preparing the request before submitting it to the node's development signer.
