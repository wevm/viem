# Tempo Fuzzing

The focused suites cover expiring and two-dimensional nonce preparation,
concurrent-request detection, and fee-payer relay concurrency.

## Local Runs

Run the pure and Docker-backed properties:

```sh
pnpm test:fuzz
```

Set `VITE_TEMPO_TAG` to run against a specific Tempo image.

## Budgets and replay

The pure suite defaults to 100–250 runs per property. The node suite defaults
to five runs per property. Increase them for a local soak:

```sh
FUZZ_RUNS=5000 TEMPO_FUZZ_NODE_RUNS=100 pnpm test:fuzz
```

`fast-check` prints a seed and path for every minimized failure. Replay it with:

```sh
FUZZ_SEED=1234 FUZZ_PATH='2:1:0' pnpm test:fuzz
```

`FUZZ_PATH` requires `FUZZ_SEED`. Keep the seed and path in a regression test
when a failure exposes a distinct bug.

## CI

CI runs 500 pure cases and 10 node cases per property on every Verify run. The
node job uses Docker and pins the same T10 image as the main Tempo suite.
Prefer larger scheduled or manual soaks over making pull-request runs
unbounded.
