# Tempo fuzzing

The focused suites cover expiring and two-dimensional nonce preparation,
concurrent-request detection, and fee-payer relay concurrency.

## Local runs

Run the pure, fast properties while editing:

```sh
pnpm test:fuzz:tempo
```

Run the node-backed properties with a local `tempo` binary on `PATH`:

```sh
pnpm test:fuzz:tempo:node
```

Set `VITE_TEMPO_BINARY` when the binary is elsewhere. To use Docker instead:

```sh
VITE_TEMPO_TAG=1.8.1 pnpm test:fuzz:tempo:node:docker
```

Run both pure and local-binary suites with `pnpm test:fuzz:tempo:all`.

## Budgets and replay

The pure suite defaults to 100–250 runs per property. The node suite defaults
to five runs per property. Increase them for a local soak:

```sh
FUZZ_RUNS=5000 pnpm test:fuzz:tempo
TEMPO_FUZZ_NODE_RUNS=100 pnpm test:fuzz:tempo:node
```

`fast-check` prints a seed and path for every minimized failure. Replay it with:

```sh
FUZZ_SEED=1234 FUZZ_PATH='2:1:0' pnpm test:fuzz:tempo
FUZZ_SEED=1234 FUZZ_PATH='2:1:0' pnpm test:fuzz:tempo:node
```

`FUZZ_PATH` requires `FUZZ_SEED`. Keep the seed and path in a regression test
when a failure exposes a distinct bug.

## CI

CI runs 500 pure cases and 10 node cases per property on every Verify run. The
node job uses Docker and pins Tempo 1.8.1. Prefer larger scheduled or manual
soaks over making pull-request runs unbounded.
