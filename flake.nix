{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-parts.url = "github:hercules-ci/flake-parts";
    rust-overlay.url = "github:oxalica/rust-overlay";
    rust-overlay.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs @ { self, nixpkgs, flake-utils, flake-parts, rust-overlay, ... }: 
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = flake-utils.lib.defaultSystems;

      perSystem = { system, pkgs, originalPkgs, ... }: let
        # Re-import pkgs with overlay applied
        pkgs = import nixpkgs {
          system = system;
          overlays = [ (import rust-overlay) ];
        };

        felixhub = import ./nix/default.nix { inherit pkgs; };
      in {
        packages = {
          default = felixhub;

          dockerImage = pkgs.dockerTools.buildImage {
            name = "felixhub.dev";
            tag = "latest";

            config = {
              Cmd = [ "felixhub" ];
              WorkingDir = "/app";
            };

            copyToRoot = pkgs.buildEnv {
              name = "felixhub-docker-root";
              paths = [
                pkgs.nodejs_22
                pkgs.bash
                felixhub
                
              ];
              pathsToLink = [ "/bin" "/app" ];
            };
          };
        };

        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs
            pkgs.typescript
            pkgs.wasm-pack
            pkgs.wasm-bindgen-cli
            (pkgs.rust-bin.stable.latest.default.override {
              extensions = [
                "clippy"
                "rust-src"
                "rust-analyzer"
              ];
              targets = [
                "wasm32-unknown-unknown"
              ];
            })
          ];
        };
      };
    };
}
