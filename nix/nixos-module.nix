{ self, ... }:
{
  flake.nixosModules.default =
    {
      config,
      lib,
      pkgs,
      ...
    }:
    let
      cfg = config.services.budgetviz;
    in
    {
      options.services.budgetviz = {
        enable = lib.mkEnableOption "Budget Visualizer service";

        port = lib.mkOption {
          type = lib.types.port;
          default = 5173;
          description = "Port on which the Budget Visualizer server will listen";
        };

        dataDir = lib.mkOption {
          type = lib.types.path;
          default = "/var/lib/budgetviz";
          description = "Directory where budget CSV files will be stored";
        };

        user = lib.mkOption {
          type = lib.types.str;
          default = "budgetviz";
          description = "User account under which Budget Visualizer runs";
        };

        group = lib.mkOption {
          type = lib.types.str;
          default = "budgetviz";
          description = "Group under which Budget Visualizer runs";
        };

        package = lib.mkOption {
          type = lib.types.package;
          default = self.packages.${pkgs.system}.default or pkgs.budgetviz;
          defaultText = lib.literalExpression "pkgs.budgetviz";
          description = "The Budget Visualizer package to use";
        };

        openFirewall = lib.mkOption {
          type = lib.types.bool;
          default = false;
          description = "Whether to open the firewall for the Budget Visualizer port";
        };
      };

      config = lib.mkIf cfg.enable {
        # Create user and group
        users.users.${cfg.user} = {
          isSystemUser = true;
          group = cfg.group;
          description = "Budget Visualizer service user";
          home = cfg.dataDir;
        };

        users.groups.${cfg.group} = { };

        # Systemd service
        systemd.services.budgetviz = {
          description = "Budget Visualizer";
          wantedBy = [ "multi-user.target" ];
          after = [ "network.target" ];

          serviceConfig = {
            Type = "simple";
            User = cfg.user;
            Group = cfg.group;
            ExecStart = "${cfg.package}/bin/budgetviz";
            Restart = "on-failure";
            RestartSec = "10s";

            # Environment variables
            Environment = [
              "NODE_ENV=production"
              "PORT=${toString cfg.port}"
              "BUDGETVIZ_DATA_DIR=${cfg.dataDir}"
            ];

            # Security hardening
            NoNewPrivileges = true;
            PrivateTmp = true;
            ProtectSystem = "strict";
            ProtectHome = true;
            ReadWritePaths = [ cfg.dataDir ];
            ProtectKernelTunables = true;
            ProtectKernelModules = true;
            ProtectControlGroups = true;
            RestrictAddressFamilies = [
              "AF_INET"
              "AF_INET6"
              "AF_UNIX"
            ];
            RestrictNamespaces = true;
            RestrictRealtime = true;
            RestrictSUIDSGID = true;
            LockPersonality = true;
            MemoryDenyWriteExecute = false; # Node.js needs this
            SystemCallArchitectures = "native";
            SystemCallFilter = [
              "@system-service"
              "~@privileged"
              "~@resources"
            ];

            # State directory
            StateDirectory = "budgetviz";
            StateDirectoryMode = "0750";
          };
        };

        # Open firewall if requested
        networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
      };
    };
}
