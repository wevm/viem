# RpcAsync

Utility functions and types for working with asynchronous JSON-RPC transports.

## Functions

| Name                | Description                         |
| ------------------- | ----------------------------------- |
| [`RpcAsync.from`](/utilities/jsonrpc/RpcAsync/from) | Instantiates an asynchronous RPC interface. |
| [`RpcAsync.fromHttp`](/utilities/jsonrpc/RpcAsync/fromHttp) | Instantiates an asynchronous HTTP RPC interface. |

## Errors

| Name                | Description                         |
| ------------------- | ----------------------------------- |
| [`RpcAsync.HttpError`](/utilities/jsonrpc/RpcAsync/errors#rpcasynchttperror) | Thrown when a HTTP request fails. |
| [`RpcAsync.MalformedResponseError`](/utilities/jsonrpc/RpcAsync/errors#rpcasyncmalformedresponseerror) | Thrown when a HTTP response is malformed. |

## Types

| Name                | Description                         |
| ------------------- | ----------------------------------- |
| [`RpcAsync.Http`](/utilities/jsonrpc/RpcAsync/types#rpcasynchttp) | Asynchronous HTTP RPC interface. |
| [`RpcAsync.RequestFn`](/utilities/jsonrpc/RpcAsync/types#rpcasyncrequestfn) | Request function on an RPC interface. |
| [`RpcAsync.RpcAsync`](/utilities/jsonrpc/RpcAsync/types#rpcasyncrpcasync) | Generic asynchronous RPC interface. |