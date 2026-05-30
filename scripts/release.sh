#!/usr/bin/env bash
set -euo pipefail

TYPE=${1:-patch}

# Get latest tag or default to v0.0.0
LATEST=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
LATEST_NO_V=${LATEST#v}

IFS='.' read -r MAJOR MINOR PATCH <<< "$LATEST_NO_V"

case "$TYPE" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
  *) echo "Usage: $0 [major|minor|patch]"; exit 1 ;;
esac

NEW_TAG="v${MAJOR}.${MINOR}.${PATCH}"

echo "Current: $LATEST  →  New: $NEW_TAG"
read -rp "Tag and push $NEW_TAG? [y/N] " CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

git tag -a "$NEW_TAG" -m "Release $NEW_TAG"
git push origin "$NEW_TAG"

echo "✓ Tagged and pushed $NEW_TAG — GitHub Actions deploy workflow will now run."
