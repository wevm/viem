# Introduction to Test Actions [A brief introduction on what Test Actions are in viem.]

Test Actions are actions that map one-to-one with "test" Ethereum RPC methods (`evm_mine`, `anvil_setBalance`, `anvil_impersonate`, etc). They are used with a [Test Client](/docs/clients/test).

Test Actions are used for testing and simulation purposes. Examples of Test Actions include [mining a block](/docs/actions/test/mine), [setting the balance of an account](/docs/actions/test/setBalance), and [impersonating accounts](/docs/actions/test/impersonateAccount).

Test Actions are an essential part of viem, as they provide a way to test and simulate different scenarios on the Ethereum network. They are commonly used by developers who are building dapps and other applications that need to be tested before they are deployed to the network. By using Test Actions, developers can test the behavior of their applications in a controlled environment, without the need for a real balance or real users. This makes it easier to identify and fix bugs, and it ensures that the application will work as expected when it is deployed to the network.