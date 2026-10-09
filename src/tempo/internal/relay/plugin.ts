import type * as Relay from '../../Relay.js'

const keyAuthorizationPlugins = new WeakSet<Relay.Plugin>()
const multisigPlugins = new WeakSet<Relay.Plugin>()

/** Registers the built-in key authorization plugin for transport capability detection. */
export function keyAuthorization(
  plugin: Relay.Plugin,
): Relay.keyAuthorization.ReturnType {
  keyAuthorizationPlugins.add(plugin)
  return plugin as Relay.keyAuthorization.ReturnType
}

export function isKeyAuthorization(plugin: Relay.Plugin): boolean {
  return keyAuthorizationPlugins.has(plugin)
}

/** Registers the built-in multisig plugin for transport capability detection. */
export function multisig(plugin: Relay.Plugin): Relay.multisig.ReturnType {
  multisigPlugins.add(plugin)
  return plugin as Relay.multisig.ReturnType
}

export function isMultisig(plugin: Relay.Plugin): boolean {
  return multisigPlugins.has(plugin)
}
