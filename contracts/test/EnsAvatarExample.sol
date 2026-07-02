// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Self-hosted NFT URI fixture for ENS avatar resolution tests. URIs are
/// injected at deployment so tests can point them at ephemeral local servers
/// instead of live gateways. Token ids select the resolution path under test:
/// 69 returns a `{id}`-templated metadata URI, 100 a base64-encoded onchain
/// JSON payload, and 108 a raw JSON payload.
contract EnsAvatarExample {
    string public templateUri;
    string public encodedJsonUri;
    string public rawJsonUri;

    constructor(
        string memory templateUri_,
        string memory encodedJsonUri_,
        string memory rawJsonUri_
    ) {
        templateUri = templateUri_;
        encodedJsonUri = encodedJsonUri_;
        rawJsonUri = rawJsonUri_;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        if (tokenId == 100) return encodedJsonUri;
        if (tokenId == 108) return rawJsonUri;
        return templateUri;
    }

    function uri(uint256) external view returns (string memory) {
        return templateUri;
    }
}
