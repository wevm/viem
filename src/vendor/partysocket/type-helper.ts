// @ts-nocheck -- vendored third-party source; not type-checked against viem's config.
/**
 * Vendored from partysocket@1.2.0 (MIT licensed).
 * Source: https://github.com/cloudflare/partykit/tree/main/packages/partysocket
 * Do not edit by hand. See ./LICENSE.
 */
export type TypedEventTarget<EventMap extends object> = {
  new (): IntermediateEventTarget<EventMap>;
};

// internal helper type
interface IntermediateEventTarget<EventMap> extends EventTarget {
  addEventListener<K extends keyof EventMap>(
    type: K,
    callback: (
      event: EventMap[K] extends Event ? EventMap[K] : never
    ) => EventMap[K] extends Event ? void : never,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;

  removeEventListener<K extends keyof EventMap>(
    type: K,
    callback: (
      event: EventMap[K] extends Event ? EventMap[K] : never
    ) => EventMap[K] extends Event ? void : never,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void;
}
