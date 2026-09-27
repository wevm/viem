# Relay Implementation and Documentation Plan

Status: Implementation and documentation are complete locally, including the
`Relay.create` follow-up and Phases 2–4.

## Verification Results

- Passed 58 multisig tests on `ghcr.io/tempoxyz/tempo:sha-83f3ccd`, including
  independent owners coordinating through a real HTTP Fetch relay, with the
  resolver using inferred chain IDs from request data and stored operations.
- Passed all 81 relay, service/Fetch, transport, client, and export tests.
- Passed six public type tests, including resolver chain inference, inline
  callbacks, exclusive client options, and transport schema preservation.
- Passed `pnpm check:types`, focused Biome checks, and `pnpm docs:build`.
- Passed all 29 TypeScript documentation snippets with Vocs Twoslash.
- Inspected rendered Relay documentation and sidebar navigation.
- Corrected the stale multisig sponsorship assertion to expect
  `eth_sendRawTransactionSync`, matching the established coordination path.
  Receipt checks still verify successful execution and the expected fee payer;
  remote routing remains unchanged.
- Type tests used a temporary focused Vitest project because the default command
  did not discover `.test-d.ts` files. Temporary configuration was removed.

## Goal

Replace `Multisig.handleRequest` with a plugin-based `Relay.create` that exposes
parsed RPC requests through `relay.request` and a Fetch endpoint through
`relay.fetch`. Remove `withMultisig`, and extend `withRelay` to support either a
remote relay transport or in-process relay options.

Introduce guides that explain what a Relay is and how to connect to or run
one, including a service implemented with the Fetch API such as a Cloudflare Worker.

Implement only the multisig plugin. Fee-payer and funding plugins are future
work, not part of this plan.

Relay is Tempo-only: implementation and exports stay in `src/tempo` and
`viem/tempo`. The concept overview lives at `/tempo/relay`; the service reference
lives at `/tempo/utilities/Relay.create`, under Utilities → Relay → create.
Keep the existing low-level `Relay.handleRequest` reference for plugin composition.
Examples use Viem clients and transports.

## Relay Concept

A Relay sits between a client and the Tempo (Execution) RPC. It acts as a sidecar to
the chain, providing services that are impractical to implement in the
execution node or onchain because of their storage growth, cost, or
operational requirements.

The execution node remains responsible for executing transactions and
enforcing chain rules. A Relay can coordinate offchain state, prepare
transactions, and submit them to the node. Some functionality may eventually
move into the execution node or protocol where appropriate.

“Sidecar” describes the architectural role, not a requirement to run on the
same host as the execution node. A remote client transport can send ordinary
requests directly to the node while routing relay-specific requests through
the Relay.

The documentation must distinguish:

- The existing production Tempo Relay API, including fee payers, auto-swap,
  fee-token resolution, and other transaction services.
- Viem's tools for connecting to a Relay or implementing relay behavior.
- The first Viem relay plugin: a multisig mailbox for approval coordination.
- Future directions: access-key state, account-config state, and potentially
  spend routing, which has similarities to existing auto-swap services.

`Relay.create` with a multisig plugin does not implement every service
provided by the production Tempo Relay API. Future services must not be
documented as available features.

## Proposed API

```ts
import { createClientResolver, http } from 'viem'
import { tempo, tempoModerato } from 'viem/chains'
import { Relay, Store } from 'viem/tempo'

const { getClient } = createClientResolver({
  chains: [tempo, tempoModerato],
  transport: () => http(),
})

// Process-local storage for this example only.
const store = Store.memory()
const relay = Relay.create({
  getClient,
  plugins: [Relay.multisig({ store })],
})

export default {
  fetch(request: Request) {
    return relay.fetch(request, { chainId: tempo.id })
  },
}
```

The example pins its endpoint to Tempo. An application serving multiple chains
supplies the chain selected by its routing, or allows the plugin to infer it.
Use shared persistent atomic storage for independent clients or relay instances.

For a single-chain service, pass a chain-configured client instead of `getClient`:

```ts
import { createClient, http } from 'viem'
import { tempo } from 'viem/chains'
import { Relay } from 'viem/tempo'

const relay = Relay.create({
  client: createClient({ chain: tempo, transport: http() }),
})

export default { fetch: relay.fetch }
```

Transport usage retains the planned local and existing remote forms:

```ts
import { http } from 'viem'
import { Relay, Store, withRelay } from 'viem/tempo'

const local = withRelay(http(), {
  plugins: [Relay.multisig({ store: Store.memory() })],
})

// Remote relay, unchanged.
const remote = withRelay(
  http(),
  http('https://relay.example.com'),
  { policy: 'sign-only' },
)
```

Proposed signatures:

```ts
Relay.create({ client, plugins? })
Relay.create({ getClient, plugins? })
relay.request({ method, params? }, options?) // Promise<unknown>
relay.fetch(request, options?) // Promise<Response>
Relay.multisig(options)

withRelay(defaultTransport, relayTransport, remoteOptions?)
withRelay(defaultTransport, relayOptions)
```

- `Relay.create` accepts one options object with exactly one of `client` or
  `getClient`. There is no positional downstream request callback.
- `client` must have a configured chain. `getClient` accepts `{ chainId }` and
  returns a client; infer supported chain IDs so the new resolver's `getClient`
  can be passed directly without a wrapper or consumer cast.
- `plugins` is an optional ordered readonly array, defaulting to an empty list.
- `Relay.multisig` accepts the current handler configuration, presently
  `{ store: Store.Atomic }`.
- Both returned methods share one composed handler. The downstream handler
  resolves the client only when needed and forwards through `client.request`.
- Keep `Relay.handleRequest(next, options = {})` as the low-level composition
  function shared by `Relay.create` and the local `withRelay` implementation.
  Local transport options do not require a second client or resolver.
- Each plugin wraps the next request handler. Requests enter plugins in
  array order; an empty list passes through to the downstream handler.
- `policy` remains specific to remote mode. Local mode does not imply fee
  sponsorship.
- Keep the plugin contract small. Do not add lifecycle hooks or placeholder
  options for future plugins.

### Chain Selection

- Both `relay.request` and `relay.fetch` accept an optional options argument
  with an optional `chainId`.
- With `client`, default to `client.chain.id`. Reject explicit or inferred
  chain IDs that conflict with the configured client.
- With `getClient`, obtain the chain ID from explicit request options or plugin
  inference before resolving the client. Never choose an arbitrary default chain.
- Keep multisig inference from request parameters, signed transactions,
  key authorizations, and stored operations in the multisig plugin.
- Reject conflicting explicit and inferred IDs, and preserve validation of
  invalid IDs. A single-client default must not hide a conflicting signed payload.
- If forwarding needs a client and no chain can be resolved, return an error.
  A plugin that answers locally need not resolve a client.
- Preserve per-request RPC options when forwarding. Do not pass the relay-only
  `chainId` option as a JSON-RPC parameter to ordinary execution RPC methods.

### Fetch Contract

- `relay.fetch` accepts a standard Fetch `Request` and returns a
  `Promise<Response>`. Its method can be passed directly as a Fetch handler
  without binding `this`.
- Handle JSON parsing, request validation, IDs, result and error envelopes,
  batch requests, and notifications according to JSON-RPC 2.0.
- Return protocol errors for malformed JSON and invalid RPC requests. Preserve
  RPC error codes and data; do not expose internal exception details as responses.
- Notifications produce no JSON-RPC response, including notifications in batches.
- Define and document HTTP methods, content types, and empty-response behavior.
- Keep HTTP routing, authentication, CORS, and platform-specific environment
  bindings in the application. Do not require Cloudflare-specific runtime types.
- Show binding-dependent configuration inside a Worker handler when needed;
  persistent coordination state belongs in the supplied store.

### Dependency

Bring in `createClientResolver` from
[the resolver commit](https://github.com/wevm/viem/commit/6599af365a27476c9f9b7b6f2950941709807393)
before implementing the resolver integration and its type tests. Its
`getClient({ chainId })` requires a chain ID even for a single configured chain.

## Phase 1: Introduce the Relay Concept and Handler Contract

The original scope and service API follow-up below are implemented.

### Implementation

- Add the `Relay` module and public namespace export.
- Add `Relay.handleRequest(next, options = {})` with plugin composition.
- Define the small middleware contract and move shared request, handler,
  and request-option types into `Relay`.
- Preserve per-request `chainId` and existing request options.
- Keep the relay independent of multisig storage and transaction rules.

### Documentation

- Write TSDoc alongside the new public API.
- Add a concept-first Relay Overview page, keeping Overview as the only
  top-level Relay sidebar item for now.
- Put the Plugins section below Usage, linking to existing Multisig documentation.
- Explain the responsibilities and boundaries described above, with a
  Mermaid diagram showing Client → Relay → Tempo (Execution) RPC and the
  Relay's plugins, plus a minimal Viem usage example.
- Link to task-oriented guides and API reference pages.

### Verification

- Test empty-plugin passthrough, plugin ordering, request/response
  propagation, and error propagation.
- Use distinguishable transformations to test order rather than invocation
  counters or mocks.
- Add colocated type tests for public inference and request options.

### Follow-Up: Create a Relay Service

- Add `Relay.create` with the exclusive `client` / `getClient` options contract
  and the shared `request` / `fetch` methods described above.
- Preserve the existing composition behavior and request options. Apply plugins
  once per created relay, rather than recomposing on every request.
- Implement the chain-selection and Fetch contracts without multisig-specific
  inference in the generic relay or HTTP layer.
- Document `Relay.create`, both returned methods, and both client configuration
  variants. Update the overview and sidebar to use the service API for hosting.
- Verify direct Fetch-handler use, single and batch RPC responses, notification
  suppression, malformed JSON, invalid requests, and RPC error serialization.
- Verify client-chain defaults, explicit chain selection, invalid or unsupported
  chains, missing-chain errors when forwarding, and locally handled requests.
- Add type tests rejecting both or neither client option and clients without a
  configured chain. Verify direct resolver compatibility and supported-chain
  inference without consumer wrappers or casts.

## Phase 2: Extract Multisig into the First Plugin

### Implementation

- Inline the existing handler implementation in `Relay.multisig({ store })`;
  retain coordination helpers internally without a `Multisig.handleRequest` wrapper.
- Preserve atomic-store validation, approval aggregation, submission leases,
  and submission recovery behavior.
- Preserve config and operation persistence, including store keys and
  serialized formats.
- Preserve pending transaction/receipt behavior and operation-hash lookups.
- Preserve chain inference, conflicting-chain rejection, and ordinary
  request passthrough.
- Keep multisig-specific chain inference in the plugin because it depends
  on signed payloads and stored operations.
- Keep helper implementations internal unless they form part of the public API.
- Remove the old entrypoint as part of the plugin migration.

### Documentation

Add a Coordinate Multisig Approvals guide covering:

- Owners submitting approvals independently.
- The relay storing operations while quorum is incomplete.
- Submission after quorum and subsequent operation-hash lookups.
- Shared atomic storage, persistence, and retention.
- Coordination by the relay versus authorization enforced by the chain.

Add the plugin reference alongside its implementation. Explain that memory
storage is process-local and is not a shared mailbox for independent clients.

Place plugin documentation under the top-level Relay → Plugins sidebar item,
starting with Multisig. Update the overview's Plugins links to these pages;
add more plugin sub-items as they are implemented.

### Verification

- Run existing handler tests through `Relay.create(...).request` with the plugin.
- Cover signed-payload and stored-operation chain inference with `getClient`,
  plus conflicting explicit IDs and mismatches with a single configured client.
- Verify the same coordination behavior through the Fetch JSON-RPC endpoint.
- Run existing multisig integration coverage.
- Keep this phase focused on composition changes, not coordination changes.

## Phase 3: Extend withRelay and Document Deployment Models

### Implementation

- Add overloads for a remote transport or relay options as the second argument.
- Preserve existing remote routing and sponsorship policies.
- In local mode, wrap the default transport's request function directly with
  `Relay.handleRequest`; do not route local requests through the remote proxy logic.
- Preserve underlying transport attributes and request typing.
- Advertise `transport.multisig` when the local multisig plugin is installed,
  while preserving existing capabilities of the underlying transport.
- Retain existing capability behavior in remote mode.

The capability flag is required by `src/tempo/chainConfig.ts` to enable
coordinated transaction preparation. An empty local plugin list must not
claim multisig support unless the underlying transport already provides it.

### Documentation

Add Connect to a Relay and Run a Relay guides:

- Connecting through a remote relay transport.
- Which requests use the relay versus the execution node.
- Hosting `Relay.create(...).fetch` in a Fetch-based server or Cloudflare Worker.
- Choosing a single `client` or the new resolver's `getClient`, and supplying
  a chain ID for requests from which the plugin cannot infer one.
- Using `relay.request` directly when the application already handles RPC parsing.
- Using `withRelay(transport, { plugins })` for in-process coordination.
- Choosing shared persistent storage rather than process-local memory for
  independent clients or multiple relay instances.

Keep architecture, deployment choices, and operational guidance in guides.
Keep signatures and option details in API references. Follow repository
guide conventions: independent recipes with complete imports and focused
examples, rather than a sequential walkthrough.

### Verification

- Test local multisig coordination and no-plugin passthrough.
- Test capability presence and absence, including underlying capabilities.
- Verify unchanged remote routing and both remote sponsorship policies.
- Preserve coverage for local multisig wrapping an existing remote relay.
- Add overload and transport-inference type tests.

## Phase 4: Migrate Consumers and Remove the Old API

### Implementation

- Replace `withMultisig` usages with `withRelay(..., { plugins })`.
- Preserve `createClient({ experimental_multisig })` and implement its
  existing behavior through the new plugin API. Renaming that option is
  separate work.
- Remove `withMultisig` and `Multisig.handleRequest`.
- Remove the empty `Multisig` namespace export after migration.
- Update export-surface snapshots and all affected consumers and fixtures.
- Update the relevant existing changeset, or add one if none covers this
  area, with migration examples for the removed APIs.

### Documentation

- Replace obsolete references and examples, and update sidebar navigation.
- Consolidate multisig handler documentation into the Relay and plugin pages.
- Include before/after migration examples for both removed APIs.
- Update original Phase 1 server examples to use `Relay.create`, keeping
  low-level plugin-composition examples under `Relay.handleRequest`.
- Keep the distinction between the existing Tempo Relay API, currently
  implemented Viem plugins, and future directions explicit throughout.

### Final Verification

- Run targeted Tempo tests for the relay service, Fetch handler, transport,
  client, and affected multisig actions, using real chains or ephemeral servers
  instead of mocks.
- Run multisig-enabled integration tests explicitly; conditional skips do
  not count as coverage.
- Run `pnpm test:typecheck` for affected public inference and
  `pnpm check:types` after TypeScript changes.
- Validate the docs build and inspect the rendered affected documentation
  and navigation using the repository's docs workflow.
- Search for remaining references to the removed APIs.
- Keep phases reviewable: preserve and verify behavior before removing the
  compatibility entrypoints. Do not stage, commit, or push without approval.

## Starting Points

- `src/tempo/Relay.ts`, `Relay.test.ts`, and `Relay.test-d.ts`: existing composition
  contract and coverage to reuse for the service API.
- `src/clients/createClientResolver.ts` and its tests from the linked commit:
  required-chain resolver contract and public inference.
- `src/tempo/Multisig.ts`: current handler and multisig coordination logic.
- `src/tempo/Transport.ts`: `withMultisig`, `withRelay`, and transport types.
- `src/tempo/Client.ts`: `experimental_multisig` integration.
- `src/tempo/chainConfig.ts`: multisig capability detection.
- `src/tempo/index.ts`: public exports.
- `src/tempo/Multisig.test.ts` and `Multisig.test-d.ts`: handler coverage.
- `src/tempo/Transport.test.ts`: relay routing and composition coverage.
- `site/pages/tempo/utilities/Multisig.mdx` and
  `Multisig.handleRequest.mdx`: existing conceptual and handler docs.
- `site/pages/tempo/transports/withMultisig.mdx` and `withRelay.mdx`:
  existing transport docs.
- `site/vocs.config.ts`: sidebar navigation.

## Non-Goals

- Implementing fee-payer, funding, access-key, account-config, or spend-routing
  plugins or services.
- Reimplementing all existing Tempo Relay API services in Viem.
- Changing multisig wire formats, persisted state, or authorization rules.
- Renaming `experimental_multisig` or changing deprecated `withFeePayer` behavior.
- Adding a generalized plugin lifecycle or hypothetical configuration.
