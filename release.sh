#!/usr/bin/env bash
set -euo pipefail

# Usage: ./release.sh [patch|minor|major]
# Defaults to "patch" if no argument given.

BUMP="${1:-patch}"

if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "Usage: ./release.sh [patch|minor|major]"
  exit 1
fi

# Ensure working tree is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: Working tree is dirty. Commit or stash changes first."
  exit 1
fi

# Bump version, commit, and tag
npm version "$BUMP"

# Publish to npm (prepublishOnly runs tsc automatically)
npm publish

# Push commit + tag to GitHub
git push && git push --tags

echo ""
echo "Released $(node -p "require('./package.json').version") to npm and GitHub."
