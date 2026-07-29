# viem

## 3.0.0-next.1

### Patch Changes

- [#4914](https://github.com/wevm/viem/pull/4914) [`d73fd55`](https://github.com/wevm/viem/commit/d73fd55d90f21ac31fb909515abf16cde061e238) Thanks [@jxom](https://github.com/jxom)! - Added `Client.fromV2` and `Client.toV2` to adapt base Clients between Viem v2 and v3.

  ```ts
  import { publicActions as publicActionsV2 } from "viem";
  import { Client, http } from "viem-v3";

  const client = Client.create({ transport: http() });
  const publicClientV2 = Client.toV2(client).extend(publicActionsV2);
  ```

## 3.0.0-next.0

### Major Changes

- [#4909](https://github.com/wevm/viem/pull/4909) [`e6c40d3`](https://github.com/wevm/viem/commit/e6c40d37a961db09b421752111b9f562f7799d08) Thanks [@jxom](https://github.com/jxom)! - Released v3; refer to the [v2 migration guide](https://v3.viem.sh/docs/v2-migration).
