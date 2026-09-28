import type * as Relay from '../../Relay.js'

const multisigPlugins = new WeakSet<Relay.Plugin>()

/** Registers the built-in multisig plugin for transport capability detection. */
export function multisig(plugin: Relay.Plugin): Relay.multisig.ReturnType {
  multisigPlugins.add(plugin)
  return plugin as Relay.multisig.ReturnType
}

export function isMultisig(plugin: Relay.Plugin): boolean {
  return multisigPlugins.has(plugin)
}

const fundingPlugins = new WeakSet<Relay.Plugin>()

/** Registers the built-in funding plugin for transport capability detection. */
export function funding(plugin: Relay.Plugin): Relay.funding.ReturnType {
  fundingPlugins.add(plugin)
  return plugin as Relay.funding.ReturnType
}

export function isFunding(plugin: Relay.Plugin): boolean {
  return fundingPlugins.has(plugin)
}
