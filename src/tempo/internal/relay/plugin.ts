import type * as Relay from '../../Relay.js'

const accountsPlugins = new WeakSet<Relay.Plugin>()

/** Registers the built-in accounts plugin for transport capability detection. */
export function accounts(plugin: Relay.Plugin): Relay.accounts.ReturnType {
  accountsPlugins.add(plugin)
  return plugin as Relay.accounts.ReturnType
}

export function isAccounts(plugin: Relay.Plugin): boolean {
  return accountsPlugins.has(plugin)
}
