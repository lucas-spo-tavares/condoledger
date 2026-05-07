#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STANDALONE_DIR="$ROOT_DIR/.next/standalone"
STATIC_DIR="$ROOT_DIR/.next/static"
PUBLIC_DIR="$ROOT_DIR/public"
LAMBDA_DIR="$ROOT_DIR/infra/lambda"
BUILD_DIR="$LAMBDA_DIR/build"
PACKAGE_DIR="$BUILD_DIR/standalone"
ZIP_PATH="$LAMBDA_DIR/condoledger-web.zip"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required but was not found."
  exit 1
fi

if [[ ! -d "$STANDALONE_DIR" ]]; then
  echo ".next/standalone was not found. Run npm run build before packaging the Lambda."
  exit 1
fi

if [[ ! -d "$STATIC_DIR" ]]; then
  echo ".next/static was not found. Run npm run build before packaging the Lambda."
  exit 1
fi

rm -rf "$BUILD_DIR" "$ZIP_PATH"
mkdir -p "$PACKAGE_DIR/.next"

cp -R "$STANDALONE_DIR/." "$PACKAGE_DIR/"
cp -R "$STATIC_DIR" "$PACKAGE_DIR/.next/static"

if [[ -d "$PUBLIC_DIR" ]]; then
  cp -R "$PUBLIC_DIR" "$PACKAGE_DIR/public"
fi

cat > "$PACKAGE_DIR/run.sh" <<'EOF'
#!/bin/sh
set -e

export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-8080}"

exec node server.js
EOF

chmod 755 "$PACKAGE_DIR/run.sh"

(
  cd "$PACKAGE_DIR"
  zip -qr "$ZIP_PATH" .
)

echo "Lambda package created at $ZIP_PATH"
