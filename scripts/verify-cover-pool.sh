#!/usr/bin/env bash
# =============================================================================
# verify-cover-pool.sh
# -----------------------------------------------------------------------------
# Hits every Unsplash photo ID listed in src/site.config.ts coverPool entries
# with a HEAD request and reports which ones 404. Run on a regular Mac shell
# (the sandboxed Linux runner used during build can't reach images.unsplash.com).
#
# Usage:
#   bash scripts/verify-cover-pool.sh
#
# Output:
#   ✓ <id>      — image exists
#   ✗ [code] <id> — image returns non-200 (likely deleted from Unsplash)
#
# To fix: pick replacement photos from https://unsplash.com/, copy the
# ID portion of the share URL (the "{timestamp}-{12hex}" string), and swap
# them into the offending coverPool entries in src/site.config.ts.
# =============================================================================

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

IDS=$(node -e "
const fs = require('fs');
const src = fs.readFileSync('src/site.config.ts', 'utf-8');
const re = /id:\\s*\"([0-9]+-[0-9a-f]+)\"/g;
let m;
while ((m = re.exec(src)) !== null) console.log(m[1]);
")

total=$(echo "$IDS" | wc -l | tr -d ' ')
echo "Verifying $total Unsplash photo IDs from src/site.config.ts ..."
echo

bad=0
while IFS= read -r id; do
  [[ -z "$id" ]] && continue
  status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 \
    "https://images.unsplash.com/photo-${id}?w=100" 2>/dev/null || echo "ERR")
  if [[ "$status" == "200" ]]; then
    printf "  ✓ %s\n" "$id"
  else
    printf "  ✗ [%s] %s\n" "$status" "$id"
    bad=$((bad+1))
  fi
done <<< "$IDS"

echo
if [[ "$bad" -eq 0 ]]; then
  echo "✓ All $total photo IDs are valid."
else
  echo "✗ $bad of $total photo IDs are broken. Replace them in src/site.config.ts."
fi
