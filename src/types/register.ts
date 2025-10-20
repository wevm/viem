import type { DefaultCapabilitiesSchema } from './capabilities.js'

// biome-ignore lint/suspicious/noEmptyInterface: _
export interface Register {}

export type ResolvedRegister = {
  CapabilitiesSchema: Register extends { CapabilitiesSchema: infer schema }
    ? schema
    : DefaultRegister['CapabilitiesSchema']
}

/** @internal */
type DefaultRegister = {
  CapabilitiesSchema: DefaultCapabilitiesSchema
}
