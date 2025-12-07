{
  perSystem =
    {
      pkgs,
      lib,
      ...
    }:
    let
      # Build the backend
      backend = pkgs.buildNpmPackage {
        pname = "budgetviz-backend";
        version = "1.0.0";

        src = lib.cleanSource ../backend;

        npmDepsHash = "sha256-S8NRUhSyieaGqqvgzAiF3hLfSb94n4jBEMuNtM0vekg=";

        buildPhase = ''
          npm run build
        '';

        installPhase = ''
          mkdir -p $out
          cp -r dist $out/
          cp -r node_modules $out/
          cp package.json $out/
        '';
      };

      # Build the frontend
      frontend = pkgs.buildNpmPackage {
        pname = "budgetviz-frontend";
        version = "1.0.0";

        src = lib.cleanSource ../frontend;

        npmDepsHash = "sha256-UKhNWiuN/cfG6bhgWcnj5IGxivmv5l4v2eVpwZATrOA=";

        buildPhase = ''
          # Skip vue-tsc (compatibility issues) and run vite build directly
          npx vite build
        '';

        installPhase = ''
          mkdir -p $out
          cp -r dist $out/
        '';
      };
    in
    {
      packages.default = pkgs.stdenv.mkDerivation {
        pname = "budgetviz";
        version = "1.0.0";

        dontUnpack = true;

        installPhase = ''
          mkdir -p $out/lib/budgetviz

          # Install backend
          cp -r ${backend}/* $out/lib/budgetviz/

          # Install frontend
          cp -r ${frontend}/dist $out/lib/budgetviz/frontend

          # Create startup script
          mkdir -p $out/bin
          cat > $out/bin/budgetviz <<'EOF'
          #!/bin/sh
          # Set data directory
          export BUDGETVIZ_DATA_DIR=''${BUDGETVIZ_DATA_DIR:-$HOME/.local/share/budgetviz}
          mkdir -p "$BUDGETVIZ_DATA_DIR"

          # Set environment for production
          export NODE_ENV=production
          export PORT=''${PORT:-3000}
          export FRONTEND_DIR=${placeholder "out"}/lib/budgetviz/frontend

          echo "Starting Budget Visualizer..."
          echo "Server: http://localhost:$PORT"
          echo "Data directory: $BUDGETVIZ_DATA_DIR"
          echo ""

          cd ${placeholder "out"}/lib/budgetviz
          exec ${pkgs.nodejs_20}/bin/node dist/server.js
          EOF

          chmod +x $out/bin/budgetviz

          # Install documentation
          mkdir -p $out/share/doc/budgetviz
          ${lib.optionalString (builtins.pathExists ../README.md) ''
            cp ${../README.md} $out/share/doc/budgetviz/README.md
          ''}
        '';

        meta = with lib; {
          description = "A self-hosted budget visualization tool";
          license = licenses.mit;
          maintainers = [ ];
          platforms = platforms.linux ++ platforms.darwin;
          mainProgram = "budgetviz";
        };
      };
    };
}
