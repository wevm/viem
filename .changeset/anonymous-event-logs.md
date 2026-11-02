---
'viem': patch
---

Fixed `Actions.event.getLogs`, `Actions.event.watch`, `Actions.event.createFilter`, `Actions.filter.getChanges`, `Actions.filter.getLogs`, and the contract event actions never decoding anonymous event logs, which are now decoded when every requested event is anonymous (such as a single anonymous `event` or `eventName`), and fixed an anonymous event in `events` producing an invalid topic filter.
