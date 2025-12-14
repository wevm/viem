# Agent Guidelines

This document provides guidelines for AI code generation agents working on this codebase.

## Code Generation

### `viem/tempo`

When generating actions (in `src/tempo/actions/`), follow these guidelines.

An example of a generated action set can be found in `src/tempo/actions/token.ts`.

#### Source of Truth

- **All actions must be based on precompile contract specifications** in `test/tempo/docs/specs/`.
- It could be likely that some interfaces may be inconsistent between the specs (`test/tempo/docs/specs`) and the precompiles (`test/tempo/crates/contracts/src/precompiles`). Always prefer the precompile interfaces over the specs.
- If the specification is unclear or missing details, **prompt the developer** for guidance rather than making assumptions

#### Documentation Requirements

All actions **must include comprehensive JSDoc** with:

1. **Function description** - What the action does
2. **`@example` block** - Complete working example showing:
   - Required imports (`createClient`, `http`, action imports)
   - Client setup with chain and transport
   - Action usage with realistic parameters
   - Expected return value handling (if applicable)
3. **`@param` tags** - For each parameter (client, parameters)
4. **`@returns` tag** - Description of the return value

Example:
```typescript
/**
 * Gets the pool ID for a token pair.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const poolId = await Actions.amm.getPoolId(client, {
 *   userToken: '0x...',
 *   validatorToken: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The pool ID.
 */
```

#### Action Types

##### Read-Only Actions

For view/pure functions that only read state:

- Use `readContract` from `viem/actions`
- Return type should use `ReadContractReturnType`
- Parameters extend `ReadParameters`

##### Mutate-Based Actions

For state-changing functions, **both variants must be implemented**:

**1. Standard Async Variant**

- Uses `writeContract` from `viem/actions`
- Returns transaction hash
- Async operation that doesn't wait for confirmation

```typescript
export async function myAction<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: myAction.Parameters<chain, account>,
): Promise<myAction.ReturnValue> {
  return myAction.inner(writeContract, client, parameters)
}
```

**2. Sync Variant (`*Sync`)**

- Named with `Sync` suffix (e.g., `mintSync`, `burnSync`, `rebalanceSwapSync`)
- Uses `writeContractSync` from `viem/actions`
- **Waits for transaction confirmation**
- Returns both the receipt and extracted event data
- **Must use `extractEvent` to get return values** (not `simulateContract`)

```typescript
export async function myActionSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: myActionSync.Parameters<chain, account>,
): Promise<myActionSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await myAction.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = myAction.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}
```

#### Namespace Properties

All actions **must include** the following components within their namespace:

##### 1. `Parameters` Type

```typescript
// Read actions
export type Parameters = ReadParameters & Args 

// Write actions
export type Parameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = WriteParameters<chain, account> & Args 
```

##### 2. `Args` Type

Arguments must be documented with JSDoc.

```typescript
export type Args = {
  /** JSDoc for each argument */
  argName: Type
}
```

##### 3. `ReturnValue` Type

```typescript
// Read actions
export type ReturnValue = ReadContractReturnType<typeof Abis.myAbi, 'functionName', never>

// Write actions
export type ReturnValue = WriteContractReturnType
```

##### 4. `ErrorType` Type (for write actions)

Write actions must include an `ErrorType` export. Use `BaseErrorType` from `viem` as a placeholder with a TODO comment for future exhaustive error typing:

```typescript
// TODO: exhaustive error type
export type ErrorType = BaseErrorType
```

##### 5. `call` Function

**Required for all actions** - enables composition with other viem actions:

```typescript
/**
 * Defines a call to the `functionName` function.
 *
 * Can be passed as a parameter to:
 * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
 * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
 * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
 *
 * @example
 * ```ts
 * import { createClient, http, walletActions } from 'viem'
 * import { tempo } from 'tempo.ts/chains'
 * import { Actions } from 'tempo.ts/viem'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * }).extend(walletActions)
 *
 * const hash = await client.sendTransaction({
 *   calls: [actions.amm.myAction.call({ arg1, arg2 })],
 * })
 * ```
 *
 * @param args - Arguments.
 * @returns The call.
 */
export function call(args: Args) {
  return defineCall({
    address: Addresses.contractName,
    abi: Abis.contractName,
    args: [/* transformed args */],
    functionName: 'functionName',
  })
}
```

The `call` function enables these use cases:
- `sendCalls` - Batch multiple calls in one transaction
- `sendTransaction` with `calls` - Send transaction with multiple operations
- `multicall` - Execute multiple calls in parallel
- `estimateContractGas` - Estimate gas costs
- `simulateContract` - Simulate execution

##### 6. `extractEvent` Function (for mutate-based actions)

**Required for all actions that emit events**:

```typescript
/**
 * Extracts the `EventName` event from logs.
 *
 * @param logs - The logs.
 * @returns The `EventName` event.
 */
export function extractEvent(logs: Log[]) {
  const [log] = parseEventLogs({
    abi: Abis.contractName,
    logs,
    eventName: 'EventName',
    strict: true,
  })
  if (!log) throw new Error('`EventName` event not found.')
  return log
}
```

##### 7. `inner` Function (for write actions)

```typescript
/** @internal */
export async function inner<
  action extends typeof writeContract | typeof writeContractSync,
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  action: action,
  client: Client<Transport, chain, account>,
  parameters: Parameters<chain, account>,
): Promise<ReturnType<action>> {
  const { arg1, arg2, ...rest } = parameters
  const call = myAction.call({ arg1, arg2 })
  return (await action(client, {
    ...rest,
    ...call,
  } as never)) as never
}
```

#### Namespace Structure

Organize actions using namespace pattern:

```typescript
export async function myAction(...) { ... }

export namespace myAction {
  export type Parameters = ...
  export type Args = ...
  export type ReturnValue = ...
  
  export async function inner(...) { ... }  // for write actions
  export function call(args: Args) { ... }
  export function extractEvent(logs: Log[]) { ... }  // for mutate actions
}
```

#### Decision-Making

When encountering situations that require judgment:

- **Specification ambiguities**: Prompt developer for clarification
- **Missing contract details**: Request ABI or specification update
- **Event structure uncertainty**: Ask for event definition
- **Parameter transformations**: Confirm expected input/output formats
- **Edge cases**: Discuss handling strategy with developer

#### Naming Conventions

- Action names should match contract function names (in camelCase)
- Sync variants use `Sync` suffix (e.g., `myActionSync`)
- Event names in `extractEvent` should match contract event names exactly
- Namespace components should be exported within the action's namespace

#### Testing

Tests should be co-located with actions in `*action-name*.test.ts` files. Reference contract tests in `test/tempo/crates/precompiles/` for expected behavior. 

See `src/tempo/actions/token.test.ts` for a comprehensive example of test patterns and structure.

##### Test Structure

Organize tests by action name with a default test case and behavior-specific tests:

```typescript
describe('actionName', () => {
  test('default', async () => {
    // Test the primary/happy path scenario
    const { receipt, ...result } = await Actions.namespace.actionSync(client, {
      param1: value1,
      param2: value2,
    })
    
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`...`)
  })

  test('behavior: specific edge case', async () => {
    // Test specific behaviors, edge cases, or variations
  })

  test('behavior: error conditions', async () => {
    // Test error handling
    await expect(
      actions.namespace.actionSync(client, { ... })
    ).rejects.toThrow()
  })
})

describe.todo('unimplementedAction')
```