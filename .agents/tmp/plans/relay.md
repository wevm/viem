# Relay Implementation and Documentation Plan

Status: Phase 1 implemented; Phases 2–4 have not started.

## Goal

Replace `Multisig.handleRequest` with a plugin-based `Relay.handleRequest`,
remove `withMultisig`, and extend `withRelay` to support either a remote relay
transport or in-process relay options. Introduce guides that explain what a
Relay is and how to connect to or run one.

Implement only the multisig plugin. Fee-payer and funding plugins are future
work, not part of this plan.

Relay is Tempo-only: implementation and exports stay in `src/tempo` and
`viem/tempo`. The concept overview lives at `/tempo/relay`; the handler reference
lives at `/tempo/utilities/Relay.handleRequest`, under Utilities → Relay →
handleRequest. Examples use Viem clients and transports.

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

`Relay.handleRequest` with a multisig plugin does not implement every service
provided by the production Tempo Relay API. Future services must not be
documented as available features.

## Proposed API

```ts
import { http, Relay, Store, withRelay } from 'viem/tempo'

const options = {
  plugins: [Relay.multisig({ store: Store.memory() })],
}

// Server-side request handler. The application supplies getClient.
const handleRequest = Relay.handleRequest(
  (request, options) => getClient(options?.chainId).request(request),
  options,
)

// In-process relay, replacing withMultisig.
const local = withRelay(http(), options)

// Remote relay, unchanged.
const remote = withRelay(
  http(),
  http('https://relay.example.com'),
  { policy: 'sign-only' },
)
```

Proposed signatures:

```ts
Relay.handleRequest(next, options = {})
Relay.multisig(options)

withRelay(defaultTransport, relayTransport, remoteOptions?)
withRelay(defaultTransport, relayOptions)
```

- `plugins` is the primary relay option and is an ordered readonly array.
- `Relay.multisig` accepts the current handler configuration, presently
  `{ store: Store.Atomic }`.
- The downstream request handler remains an argument to
  `Relay.handleRequest`, not to the plugin.
- Each plugin wraps the next request handler. Requests enter plugins in
  array order; an empty list passes through to the downstream handler.
- `policy` remains specific to remote mode. Local mode does not imply fee
  sponsorship.
- Keep the plugin contract small. Do not add lifecycle hooks or placeholder
  options for future plugins.

## Phase 1: Introduce the Relay Concept and Handler Contract

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

## Phase 2: Extract Multisig into the First Plugin

### Implementation

- Move the existing handler implementation behind `Relay.multisig({ store })`.
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
- Keep the old entrypoint temporarily during migration if needed so each
  phase remains testable; remove it in Phase 4.

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

- Run existing handler tests through `Relay.handleRequest` with the plugin.
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
- Reusing `Relay.handleRequest` in a server.
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
- Keep the distinction between the existing Tempo Relay API, currently
  implemented Viem plugins, and future directions explicit throughout.

### Final Verification

- Run targeted Tempo tests for the handler, transport, client, and affected
  multisig actions, using real chains or ephemeral servers instead of mocks.
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
