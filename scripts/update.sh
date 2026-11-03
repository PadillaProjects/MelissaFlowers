#!/bin/sh
# Usage: yarn update "Describe what changed"
# Commits all changes and pushes main to GitHub.
# Cloudflare Pages sees the push and publishes melibee.art automatically
# (usually 1-3 minutes). Check progress in Cloudflare > Workers & Pages.
set -e

msg="$*"
if [ -z "$msg" ]; then
  echo "Please describe the change, e.g.: yarn update \"Add Christmas banner\""
  exit 1
fi

git add -A

# Refuse to commit files GitHub would reject (over 95 MB).
big=$(git diff --cached --name-only --diff-filter=AM | while read -r f; do
  if [ -f "$f" ] && [ "$(wc -c < "$f")" -gt 95000000 ]; then echo "$f"; fi
done)
if [ -n "$big" ]; then
  echo "These files are too large for GitHub (over 95 MB):"
  echo "$big"
  echo "Add them to .gitignore, then run the command again."
  git reset -q
  exit 1
fi

if git diff --cached --quiet; then
  echo "No changes to commit; pushing anyway."
else
  git commit -m "$msg"
fi

git push origin main
echo "Pushed. Cloudflare Pages will publish melibee.art in a few minutes."
