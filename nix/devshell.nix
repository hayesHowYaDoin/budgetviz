{
  perSystem = {
    config,
    pkgs,
    lib,
    ...
  }: {
    devShells.default = pkgs.mkShell rec {
      # See ./nix/pre-commit.nix
      inputsFrom = [
        config.pre-commit.devShell
      ];

      nativeBuildInputs = with pkgs; [
        pkg-config
      ];

      buildInputs = with pkgs; [
        alsa-lib.dev
        udev.dev
        vulkan-loader
      ];

      packages = with pkgs; [
        just
        nixd
        nodejs_20
        process-compose
      ];

      LD_LIBRARY_PATH = lib.makeLibraryPath buildInputs;
    };
  };
}
