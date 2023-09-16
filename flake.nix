{
  inputs = {
    nixpkgs = {
      url = "github:nixos/nixpkgs/nixpkgs-unstable";
    };

    utils = {
      url = "github:numtide/flake-utils";
    };

    foundry = {
      url = "github:shazow/foundry.nix/monthly";
    };
  };

  outputs = { self, nixpkgs, utils, foundry }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [foundry.overlay];
        };
      in {
        devShell = with pkgs; mkShell {
          buildInputs = [
            foundry-bin
            bun
          ];
        };
      });
}
