#!/bin/sh
# Populates .npmrc from the NPM_RC environment variable.
# Set NPM_RC in Vercel environment variables with the full .npmrc content.

if [ -z "$NPM_RC" ]; then
  echo "setup-npmrc: NPM_RC is not set, skipping .npmrc generation"
  exit 0
fi

echo "$NPM_RC" > .npmrc
echo "setup-npmrc: .npmrc written successfully"
