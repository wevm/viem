// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @notice Receiver mixin for ETH and safe-transferred ERC721 and ERC1155 tokens.
/// @author Solady (https://github.com/Vectorized/solady/blob/main/src/accounts/Receiver.sol)
///
/// @dev Note:
/// - Handles all ERC721 and ERC1155 token safety callbacks.
/// - Collapses function table gas overhead and code size.
/// - Utilizes fallback so unknown calldata will pass on.
abstract contract Receiver {
    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                       CUSTOM ERRORS                        */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /// @dev The function selector is not recognized.
    error FnSelectorNotRecognized();

    /*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
    /*                     RECEIVE / FALLBACK                     */
    /*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

    /// @dev For receiving ETH.
    receive() external payable virtual {}

    /// @dev Fallback function with the `receiverFallback` modifier.
    fallback() external payable virtual receiverFallback {
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, 0x3c10b94e) // `FnSelectorNotRecognized()`.
            revert(0x1c, 0x04)
        }
    }

    /// @dev Modifier for the fallback function to handle token callbacks.
    modifier receiverFallback() virtual {
        _beforeReceiverFallbackBody();
        if (_useReceiverFallbackBody()) {
            /// @solidity memory-safe-assembly
            assembly {
                let s := shr(224, calldataload(0))
                // 0x150b7a02: `onERC721Received(address,address,uint256,bytes)`.
                // 0xf23a6e61: `onERC1155Received(address,address,uint256,uint256,bytes)`.
                // 0xbc197c81: `onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)`.
                if or(eq(s, 0x150b7a02), or(eq(s, 0xf23a6e61), eq(s, 0xbc197c81))) {
                    // Assumes `mload(0x40) <= 0xffffffff` to save gas on cleaning lower bytes.
                    mstore(0x20, s) // Store `msg.sig`.
                    return(0x3c, 0x20) // Return `msg.sig`.
                }
            }
        }
        _afterReceiverFallbackBody();
        _;
    }

    /// @dev Whether we want to use the body of the `receiverFallback` modifier.
    function _useReceiverFallbackBody() internal view virtual returns (bool) {
        return true;
    }

    /// @dev Called before the body of the `receiverFallback` modifier.
    function _beforeReceiverFallbackBody() internal virtual {}

    /// @dev Called after the body of the `receiverFallback` modifier.
    function _afterReceiverFallbackBody() internal virtual {}
}
