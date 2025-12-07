{inputs, ...}: {
  imports = [
    (inputs.git-hooks + /flake-module.nix)
  ];

  perSystem = {
    pre-commit.settings = {
      hooks = {
        nixfmt-rfc-style.enable = true;
        shellcheck = {
          enable = true;
          excludes = ["^\.envrc$"];
        };
      };
    };
  };
}
