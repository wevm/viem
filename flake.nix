{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    utils.url = "github:numtide/flake-utils";
    foundry.url = "github:fubhy/foundry.nix";
  };

  outputs = { self, nixpkgs, utils, foundry, ... }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [ foundry.overlay ];
      };
    in {
      formatter = pkgs.alejandra;

      devShells = {
        default = pkgs.mkShell {
          buildInputs = with pkgs; [
            bun
            foundry-bin
            nodejs_20
          ];
        };
      };
    });
}
