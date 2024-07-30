// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract EnsAvatarTokenUri {
    function ownerOf(uint256 tokenId) public view returns (address) {
        return 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        if (tokenId == 0) {
            return "";
        }

        if (tokenId == 100) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJodHRwczovL2ltYWdlczIubWludXRlbWVkaWFjZG4uY29tL2ltYWdlL3VwbG9hZC9jX2ZpbGwsd18xNDQwLGFyXzE2OjksZl9hdXRvLHFfYXV0byxnX2F1dG8vc2hhcGUvY292ZXIvc3BvcnQvNjI0NTUtc2hvdXQtZmFjdG9yeTEtODY5Yjc0YjY0N2I4ODA0NWNhYWM5NTY5NTZiZDFmZjguanBnIgp9";
        }
        if (tokenId == 101) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJodHRwczovL2V4YW1wbGUuY29tIgp9";
        }
        if (tokenId == 102) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUIyYVdWM1FtOTRQU0l3SURBZ01qQXdJREl3TUNJZ2QybGtkR2c5SWpFd01DVWlJR2hsYVdkb2REMGlNVEF3SlNJK0NpQWdJQ0E4Y21WamRDQjNhV1IwYUQwaU1UQXdKU0lnYUdWcFoyaDBQU0l4TURBbElpQm1hV3hzUFNKeVoySW9NQ3dnTUN3Z01DazdJaTgrQ2p3dmMzWm5QZz09Igp9";
        }
        if (tokenId == 103) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCw8c3ZnPjwvc3ZnPiIKfQ==";
        }
        if (tokenId == 104) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCxsZWwiCn0=";
        }
        if (tokenId == 105) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJpcGZzOi8vaXBmcy9RbWE4bW5wNnhWM0oyY1JOZjNtVHRoNUM4blYxMUNBbmNlVmluYzN5OGpTYmlvIgp9";
        }
        if (tokenId == 106) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJRbWE4bW5wNnhWM0oyY1JOZjNtVHRoNUM4blYxMUNBbmNlVmluYzN5OGpTYmlvIgp9";
        }
        if (tokenId == 107) {
            return
                "data:application/json;base64,ewogICAgImltYWdlX3VybCI6ICJ3YXQiCn0";
        }
        if (tokenId == 108) {
            return
                '{"image_url": "https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg"}';
        }

        if (tokenId == 200) {
            return
                "https://images2.minutemediacdn.com/image/upload/c_fill,w_1440,ar_16:9,f_auto,q_auto,g_auto/shape/cover/sport/62455-shout-factory1-869b74b647b88045caac956956bd1ff8.jpg";
        }
        if (tokenId == 201) {
            return "https://example.com";
        }
        if (tokenId == 202) {
            return
                "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CiAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMCwgMCwgMCk7Ii8+Cjwvc3ZnPg==";
        }
        if (tokenId == 203) {
            return "data:image/svg+xml;utf8,<svg></svg>";
        }
        if (tokenId == 204) {
            return "data:image/svg+xml;utf8,lel";
        }
        if (tokenId == 205) {
            return "ipfs://ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio";
        }
        if (tokenId == 206) {
            return "Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio";
        }
        if (tokenId == 207) {
            return "wat";
        }

        return "https://boredapeyachtclub.com/api/mutants/0x{id}";
    }
}
