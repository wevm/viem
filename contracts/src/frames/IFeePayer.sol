// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// Interface for a frame payer with immutable authentication and pricing contracts.
interface IFeePayer {
    /// Returns the protocol signature scheme: arbitrary (0), secp256k1 (1), or P256 (2).
    function scheme() external view returns (uint256);
    /// Returns the authorized signer; zero for a contract-defined verifier.
    function signer() external view returns (address);
    /// Returns the contract-defined signature verifier; zero for protocol schemes.
    function verifier() external view returns (address);
    /// Reads the pricing contract during preparation and returns token base units.
    function quote(address token, uint256 maxCostWei) external view returns (uint256);
    /// Returns token reimbursement and immutable authentication configuration.
    function quoteAndAuthentication(address token, uint256 maxCostWei)
        external view returns (uint256 amount, uint256 scheme_, address signer_, address verifier_);

    /// Approves ETH payment after authenticating the sponsor and the next reimbursement frame.
    function pay(address token, uint256 amount) external;
}
