import type { Address } from 'abitype'
import * as Address_ from 'ox/Address'
import * as Hex_ from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import { FundingPolicy, FundingRequirement, KeyAuthorization } from 'ox/tempo'
import { getBlock } from '../../../actions/public/getBlock.js'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import type { BlockTag } from '../../../types/block.js'
import type { Hex } from '../../../types/misc.js'
import * as Addresses from '../../Addresses.js'
import { getFundingPolicyId, getMetadata } from '../../actions/accessKey.js'
import { discover, getPolicy, policyExists } from '../../actions/funding.js'
import * as Funding from '../../Funding.js'
import type * as Relay from '../../Relay.js'
import * as Store from '../../Store.js'
import * as internal from '../funding.js'

export function create(
  parameters: Relay.funding.Options = {},
): Relay.funding.ReturnType {
  const configuredStore = parameters.store ?? Store.memory()
  return {
    transport: { funding: true },
    async handleRequest(relay, next) {
      const { request, options } = relay
      const store = relay.getStore(configuredStore)!
      if (request.method === 'eth_fillKeyAuthorization') {
        const [input] = (request.params ??
          []) as Funding.RpcSchema[1]['Parameters']
        if (
          !input ||
          request.params?.length !== 1 ||
          !Address_.validate(input.account) ||
          !input.keyAuthorization
        )
          throw new RpcResponse.InvalidParamsError({
            message:
              'Expected an owner `account` and unsigned `keyAuthorization`.',
          })
        const authorization = input.keyAuthorization
        if (authorization.signature !== undefined)
          throw new RpcResponse.InvalidParamsError({
            message: 'Cannot fill an already signed key authorization.',
          })
        if (
          authorization.account &&
          !Address_.isEqual(authorization.account, input.account)
        )
          throw new RpcResponse.InvalidParamsError({
            message:
              '`keyAuthorization.account` must match the requested owner account.',
          })
        // Validate the unsigned fields without passing unresolved intent to the codec.
        const decoded = (() => {
          try {
            const { fundingPolicy, ...rest } = authorization
            const decoded = KeyAuthorization.fromRpcUnsigned({
              ...rest,
              ...(fundingPolicy !== true && fundingPolicy !== undefined
                ? { fundingPolicy }
                : {}),
            })
            KeyAuthorization.getSignPayload(decoded)
            return decoded
          } catch {
            throw new RpcResponse.InvalidParamsError({
              message:
                '`keyAuthorization` contains invalid unsigned authorization fields.',
            })
          }
        })()
        if (authorization.fundingPolicy !== true)
          return { keyAuthorization: authorization }

        const chainId =
          options?.chainId ??
          (decoded.chainId === 0n ? 4217 : Number(decoded.chainId))
        if (
          !Number.isSafeInteger(chainId) ||
          chainId <= 0 ||
          (decoded.chainId !== 0n && decoded.chainId !== BigInt(chainId))
        )
          throw new RpcResponse.InvalidParamsError({
            message:
              'The key authorization chain must match the request chain.',
          })
        const policyId = parameters.policyId
        if (
          policyId === undefined ||
          policyId <= 0n ||
          policyId > 0xffffffffffffffffn
        )
          throw new RpcResponse.InvalidParamsError({
            message:
              '`fundingPolicy: true` requires a configured nonzero uint64 `policyId`.',
          })
        const client = relay.getClient(chainId)
        if (!(await policyExists(client, { policyId })))
          throw new RpcResponse.InvalidParamsError({
            message: `Default funding policy ${policyId} does not exist on chain ${chainId}.`,
          })
        return {
          keyAuthorization: {
            ...authorization,
            fundingPolicy: Hex_.fromNumber(policyId),
          },
        }
      }

      if (request.method === 'funding_registerPolicyRules') {
        const [parameters] = (request.params ??
          []) as Funding.RpcSchema[0]['Parameters']
        if (!parameters || request.params?.length !== 1)
          throw new RpcResponse.InvalidParamsError({
            message:
              'Expected one parameter containing `chainId` and encoded `rules`.',
          })
        const chainId = Number(parameters.chainId)
        if (
          !Hex_.validate(parameters.chainId) ||
          !Number.isSafeInteger(chainId) ||
          chainId <= 0 ||
          (options?.chainId !== undefined && options.chainId !== chainId)
        )
          throw new RpcResponse.InvalidParamsError({
            message:
              'Registration requires a valid `chainId` matching the request chain.',
          })
        const rules = (() => {
          try {
            return FundingPolicy.decode(parameters.rules)
          } catch {
            throw new RpcResponse.InvalidParamsError({
              message:
                '`rules` must contain canonical ABI-encoded funding policy rules.',
            })
          }
        })()
        const rulesHash = FundingPolicy.hash(rules)
        await store.setItem(
          `funding:${chainId}:${Addresses.fundingPolicy.toLowerCase()}:rules:${rulesHash.toLowerCase()}`,
          FundingPolicy.encode(rules),
        )
        return { rulesHash }
      }

      if (
        request.method !== 'eth_fillTransaction' &&
        request.method !== 'eth_call' &&
        request.method !== 'eth_estimateGas'
      )
        return next()

      const [transaction, ...rest] = (request.params ?? []) as [
        Relay.funding.Transaction,
        ...unknown[],
      ]

      if (
        transaction?.requireFunds === undefined ||
        (Array.isArray(transaction.requireFunds) &&
          !transaction.requireFunds.length)
      )
        return next()

      if (
        transaction.requireFunds !== true &&
        !Array.isArray(transaction.requireFunds)
      )
        throw new RpcResponse.InvalidParamsError({
          message:
            'Supply `requireFunds: true` or explicit `token` and `amount` requirements.',
        })

      if (
        transaction.signature != null ||
        transaction.feePayerSignature != null ||
        transaction.signatures?.length
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Cannot fill funding on an already signed transaction.',
        })

      const chainId_request =
        transaction.chainId === undefined
          ? undefined
          : Number(transaction.chainId)
      const chainId_explicit = options?.chainId

      for (const chainId of [chainId_request, chainId_explicit])
        if (
          chainId !== undefined &&
          (!Number.isSafeInteger(chainId) || chainId <= 0)
        )
          throw new RpcResponse.InvalidParamsError({
            message: 'Expected a valid chain ID.',
          })

      if (
        chainId_request !== undefined &&
        chainId_explicit !== undefined &&
        chainId_request !== chainId_explicit
      )
        throw new RpcResponse.InvalidParamsError({
          message: 'Conflicting chain ids.',
        })

      const chainId = chainId_explicit ?? chainId_request ?? 4217
      const requestOptions = { ...options, chainId }
      relay.options = requestOptions

      const [block, stateOverrides, blockOverrides] = (
        request.method === 'eth_fillTransaction' ? [] : rest
      ) as [
        internal.SimulationContext['block'],
        internal.SimulationContext['stateOverrides'],
        internal.SimulationContext['blockOverrides'],
      ]
      const context = { block, stateOverrides, blockOverrides }
      const downstream = relay.getClient(chainId)
      const client =
        request.method === 'eth_fillTransaction'
          ? downstream
          : createClient({
              chain: downstream.chain,
              transport: custom(
                {
                  request: ({ method, params }, requestOptions_) => {
                    // Discovery reads must use the same state as the requested call or estimate.
                    return downstream.request(
                      {
                        method,
                        params:
                          method === 'eth_call'
                            ? [
                                params?.[0],
                                block ?? params?.[1] ?? 'latest',
                                ...(stateOverrides || blockOverrides
                                  ? [stateOverrides ?? {}]
                                  : []),
                                ...(blockOverrides ? [blockOverrides] : []),
                              ]
                            : params,
                      } as never,
                      requestOptions_,
                    )
                  },
                },
                { retryCount: 0 },
              ),
            })

      const policy = await (async () => {
        // A key authorization can also accompany an owner transaction. Only keyId
        // identifies delegated execution; the node validates its signed authority.
        if (!transaction.keyId) return undefined
        if (!transaction.from)
          throw new RpcResponse.InvalidParamsError({
            message:
              'Access key funding requires the transaction sender (`from`).',
          })

        const selected = context.block
        const block = await getBlock(client, {
          ...(typeof selected === 'object'
            ? 'blockHash' in selected
              ? { blockHash: selected.blockHash }
              : { blockNumber: BigInt(selected.blockNumber) }
            : selected?.startsWith('0x')
              ? { blockNumber: BigInt(selected) }
              : { blockTag: selected as BlockTag | undefined }),
        })
        const metadata = await getMetadata(client, {
          account: transaction.from,
          accessKey: transaction.keyId,
          blockNumber: block.number ?? undefined,
        })
        if (metadata.isRevoked)
          throw new RpcResponse.InvalidParamsError({
            message: 'The funding access key is revoked.',
          })

        const authorization = (() => {
          if (!transaction.keyAuthorization) return undefined
          try {
            const authorization = KeyAuthorization.fromRpc(
              transaction.keyAuthorization,
            )
            Address_.assert(authorization.address, { strict: false })
            if (authorization.account)
              Address_.assert(authorization.account, { strict: false })
            KeyAuthorization.getSignPayload(authorization)
            return authorization
          } catch {
            throw new RpcResponse.InvalidParamsError({
              message: 'Invalid signed `keyAuthorization`.',
            })
          }
        })()
        if (
          authorization &&
          (!Address_.isEqual(authorization.address, transaction.keyId) ||
            (authorization.account &&
              !Address_.isEqual(authorization.account, transaction.from)) ||
            (authorization.chainId !== 0n &&
              authorization.chainId !== BigInt(chainId)))
        )
          throw new RpcResponse.InvalidParamsError({
            message:
              '`keyAuthorization` must match the funding account, access key, and chain.',
          })

        const installed = Address_.isEqual(metadata.address, transaction.keyId)
        if (!installed && !authorization)
          throw new RpcResponse.InvalidParamsError({
            message:
              'The funding access key is not installed; supply `keyAuthorization`.',
          })
        const expiry = installed ? metadata.expiry : authorization?.expiry
        if (
          expiry != null &&
          BigInt(expiry) <=
            (blockOverrides?.time
              ? BigInt(blockOverrides.time)
              : block.timestamp)
        )
          throw new RpcResponse.InvalidParamsError({
            message: 'The funding access key has expired.',
          })

        const policy = installed
          ? await getFundingPolicyId(client, {
              account: transaction.from,
              accessKey: transaction.keyId,
              blockNumber: block.number ?? undefined,
            })
          : authorization?.fundingPolicy
        if (policy === undefined || policy === 0n)
          throw new RpcResponse.InvalidParamsError({
            message: 'The access key has no funding policy.',
          })
        if (typeof policy === 'object')
          return {
            rulesHash: FundingPolicy.hash(policy.rules),
            rules: FundingPolicy.encode(policy.rules),
            blockNumber: block.number ?? undefined,
          }
        const { rulesHash } = await getPolicy(client, {
          policyId: policy,
          blockNumber: block.number ?? undefined,
        })
        return { rulesHash, policyId: policy, blockNumber: block.number }
      })()

      const intent = transaction.requireFunds
      if (intent !== true)
        for (const requirement of intent) {
          if (
            !requirement ||
            typeof requirement !== 'object' ||
            Array.isArray(requirement)
          )
            throw new RpcResponse.InvalidParamsError({
              message: 'Each funding requirement must be an object.',
            })

          if (
            requirement.sources !== undefined &&
            !Array.isArray(requirement.sources)
          )
            throw new RpcResponse.InvalidParamsError({
              message: '`sources` must be an array when supplied.',
            })

          try {
            FundingRequirement.fromRpcRequest(requirement)
          } catch {
            throw new RpcResponse.InvalidParamsError({
              message:
                'Invalid funding requirement: check `token`, `amount`, `slippageBps`, `policyRules`, and source `target` and `data` fields.',
            })
          }
        }

      const requirements = await (async () => {
        if (
          intent !== true &&
          intent.every(
            (requirement) =>
              requirement.token !== undefined &&
              requirement.amount !== undefined,
          )
        )
          return intent
        const defaults =
          intent === true ? undefined : internal.getDefaults(transaction)
        const inferred = defaults
          ? [
              {
                token: defaults.token,
                amount: Hex_.fromNumber(defaults.amount),
              },
            ]
          : await internal.infer(client, {
              ...context,
              tokens: async () => [
                ...(parameters.tokens ?? []),
                ...(await relay.resolveTokens(chainId)),
              ],
              transaction,
            })
        if (intent === true) return inferred
        return intent.map((requirement) => {
          if (
            requirement.token !== undefined &&
            requirement.amount !== undefined
          )
            return requirement
          const target = defaults
            ? inferred[0]
            : requirement.token === undefined
              ? inferred.length === 1
                ? inferred[0]
                : undefined
              : inferred.find((target) =>
                  Address_.isEqual(target.token, requirement.token!),
                )
          if (!target)
            throw new RpcResponse.InvalidParamsError({
              message:
                'Cannot unambiguously infer the funding requirement; specify `token` and `amount` explicitly.',
            })
          return {
            ...requirement,
            token: requirement.token ?? target.token,
            amount: requirement.amount ?? target.amount,
          }
        })
      })()
      const requireFunds: FundingRequirement.Rpc[] = []

      for (const requirement of requirements) {
        const decoded = (() => {
          try {
            return FundingRequirement.fromRpc({
              ...requirement,
              token: requirement.token!,
              amount: requirement.amount!,
              sources: requirement.sources ?? [],
            })
          } catch {
            throw new RpcResponse.InvalidParamsError({
              message:
                'Invalid funding requirement: check `token`, `amount`, `slippageBps`, `policyRules`, and source `target` and `data` fields.',
            })
          }
        })()

        if (transaction.multisigSimulation && requirement.sources === undefined)
          throw new RpcResponse.InvalidParamsError({
            message: 'Multisig funding requires explicit sources.',
          })

        const policyRules = policy
          ? await resolvePolicyRules({
              ...policy,
              chainId,
              rules: decoded.policyRules ?? policy.rules,
              defaultRules: parameters.policyRules,
              store,
            })
          : undefined
        const rules = policyRules
          ? FundingPolicy.decode(policyRules)
          : undefined
        const sources =
          rules &&
          Object.entries(rules.sources).find(([token]) =>
            Address_.isEqual(token as Address, decoded.token),
          )?.[1]
        if (rules && !sources)
          throw new RpcResponse.InvalidParamsError({
            message: `The funding policy does not allow output token ${decoded.token}.`,
          })
        if (
          rules &&
          decoded.slippageBps !== undefined &&
          decoded.slippageBps > rules.maxSlippageBps
        )
          throw new RpcResponse.InvalidParamsError({
            message: '`slippageBps` exceeds the funding policy maximum.',
          })

        if (requirement.sources !== undefined) {
          requireFunds.push(
            FundingRequirement.toRpc({
              ...decoded,
              ...(policyRules ? { policyRules } : {}),
            }),
          )
          continue
        }

        if (!transaction.from)
          throw new RpcResponse.InvalidParamsError({
            message:
              'Funding discovery requires the transaction sender (`from`).',
          })

        const route =
          rules && sources
            ? { slippageBps: rules.maxSlippageBps, sources }
            : await (parameters.getRoute ?? Funding.defaultRoute)({
                chainId,
                token: Address_.checksum(decoded.token),
                transaction,
              })
        if (!route)
          throw new RpcResponse.InvalidParamsError({
            message: `No funding route configured for ${requirement.token}.`,
          })

        const discovery = await discover(client, {
          account: transaction.from,
          amount: decoded.amount,
          slippageBps: decoded.slippageBps ?? route.slippageBps ?? 0,
          sources: route.sources,
          token: decoded.token,
        })

        requireFunds.push(
          FundingRequirement.toRpc({
            ...decoded,
            ...(policyRules ? { policyRules } : {}),
            slippageBps: discovery.slippageBps,
            sources: discovery.sources.map(({ target, data }) => ({
              target,
              data,
            })),
          }),
        )
      }

      relay.request = {
        ...request,
        params: [{ ...transaction, requireFunds }, ...rest],
      }
      relay.options = requestOptions
      await next()
      if (request.method === 'eth_fillTransaction') {
        const result = relay.result as Relay.Plugin.FillResult
        // Nodes can omit empty requirements; keep resolved intent for later plugins.
        if (result.tx && result.tx.requireFunds === undefined)
          relay.result = { ...result, tx: { ...result.tx, requireFunds } }
      }
    },
  }
}

/** Loads canonical rules matching the current commitment, never a cached policy ID. */
async function resolvePolicyRules(parameters: {
  chainId: number
  rules?: Hex | undefined
  defaultRules?: FundingPolicy.Rules | undefined
  rulesHash: Hex
  store: Store.Store
}): Promise<Hex> {
  const { chainId, rulesHash, store } = parameters
  const key = `funding:${chainId}:${Addresses.fundingPolicy.toLowerCase()}:rules:${rulesHash.toLowerCase()}`
  const rules =
    parameters.rules ??
    (await store.getItem(key)) ??
    (parameters.defaultRules
      ? FundingPolicy.encode(parameters.defaultRules)
      : undefined)
  if (rules !== undefined && rules !== null) {
    const decoded = FundingPolicy.decode(rules as Hex)
    if (FundingPolicy.hash(decoded).toLowerCase() !== rulesHash.toLowerCase())
      throw new RpcResponse.InvalidParamsError({
        message:
          'Funding policy rules do not match the current onchain commitment.',
      })
    const encoded = FundingPolicy.encode(decoded)
    await store.setItem(key, encoded)
    return encoded
  }

  throw new RpcResponse.InvalidParamsError({
    message:
      'Funding policy rules are not in the store; supply `policyRules` explicitly.',
  })
}
