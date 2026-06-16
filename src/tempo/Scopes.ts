import type { Address } from 'abitype'
import type { KeyAuthorization } from 'ox/tempo'
import * as Selectors from './Selectors.js'

export type Selector = NonNullable<KeyAuthorization.Scope['selector']>

export type Options = {
  /** Recipient allowlist for selectors that support recipient restrictions. */
  recipients?: readonly Address[] | undefined
}

export type Scope<
  address extends Address = Address,
  selector extends Selector | undefined = Selector | undefined,
> = Omit<KeyAuthorization.Scope, 'address' | 'recipients' | 'selector'> & {
  address: address
  recipients?: readonly Address[] | undefined
  selector?: selector | undefined
}

export type Target<address extends Address = Address> = {
  /** Allows any selector on the target. */
  any: () => Scope<address, undefined>
  /** Allows calls matching the selector on the target. */
  selector: <selector extends Selector>(
    selector: selector,
    options?: Options | undefined,
  ) => Scope<address, selector>
}

export type SelectorMap = Record<string, Selector | Record<string, Selector>>

export type Contract<
  address extends Address = Address,
  selectors extends SelectorMap = SelectorMap,
> = Target<address> & {
  readonly [name in keyof selectors]: selectors[name] extends Selector
    ? (options?: Options | undefined) => Scope<address, selectors[name]>
    : selectors[name] extends Record<string, Selector>
      ? OverloadedSelector<address, selectors[name]>
      : never
}

export type OverloadedSelector<
  address extends Address = Address,
  selectors extends Record<string, Selector> = Record<string, Selector>,
> = {
  readonly [signature in keyof selectors]: (
    options?: Options | undefined,
  ) => Scope<address, selectors[signature]>
} & {
  selector: <signature extends keyof selectors>(
    signature: signature,
    options?: Options | undefined,
  ) => Scope<address, selectors[signature]>
}

export type Tip20<address extends Address = Address> = Contract<
  address,
  typeof Selectors.tip20
>

/**
 * Creates a call scope builder for an arbitrary target.
 *
 * @experimental
 */
export function target<address extends Address>(
  address: address,
): Target<address> {
  return {
    any: () => ({ address }),
    selector: (selector, options) => ({
      address,
      ...(options && 'recipients' in options
        ? { recipients: options.recipients }
        : {}),
      selector,
    }),
  }
}

/**
 * Creates a typed call scope builder from a selector map.
 *
 * @experimental
 */
export function contract<
  address extends Address,
  selectors extends SelectorMap,
>(address: address, selectors: selectors): Contract<address, selectors> {
  const target_ = target(address)
  const result: Record<string, unknown> = { ...target_ }

  for (const [name, selector] of Object.entries(selectors)) {
    if (typeof selector === 'string') {
      result[name] = (options?: Options | undefined) =>
        target_.selector(selector, options)
      continue
    }

    const overloads: Record<string, unknown> = {}
    for (const [signature, overloadSelector] of Object.entries(selector)) {
      overloads[signature] = (options?: Options | undefined) =>
        target_.selector(overloadSelector, options)
    }
    overloads.selector = (signature: string, options?: Options | undefined) =>
      target_.selector(selector[signature]!, options)
    result[name] = overloads
  }

  return result as Contract<address, selectors>
}

/**
 * Creates a call scope builder for a TIP-20 token.
 *
 * @experimental
 */
export function tip20<address extends Address>(
  address: address,
): Tip20<address> {
  return contract(address, Selectors.tip20)
}
