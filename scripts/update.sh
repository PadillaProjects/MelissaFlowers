#!/bin/sh
# Usage: yarn update "Describe what changed"
# Commits all changes, pushes main to GitHub, then deploys the site.
set -e

msg="$*"
if [ -z "$msg" ]; then
  echo "Please describe the change, e.g.: yarn update \"Add Christmas banner\""
  exit 1
fi

git add -A

# Refuse to commit files GitHub would reject (over 95 MB).
big=$(git diff --cached --name-only --diff-filter=AM | while read -r f; do
  [ -f "$f" ] && [ "$(wc -c < "$f")" -gt 95000000 ] && echo "$f"
done)
if [ -n "$big" ]; then
  echo "These files are too large for GitHub (over 95 MB):"
  echo "$big"
  echo "Add them to .gitignore, then run the command again."
  git reset -q
  exit 1
fi

if git diff --cached --quiet; then
  echo "No changes to commit; pushing and deploying anyway."
else
  git commit -m "$msg"
fi

git push origin main
yarn deploy
