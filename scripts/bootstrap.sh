#!/usr/bin/env bash
# bootstrap.sh — wire up Personal Context OS for Claude Code.
#
# - Symlinks each skills/skill-<name>.md into ~/.claude/commands/<name>.md
# - Creates the data/ folder skeleton if missing
# - Idempotent: re-runs safely

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="${CLAUDE_HOME:-$HOME/.claude}"
COMMANDS_DIR="$CLAUDE_DIR/commands"

# Flag: --copy uses plain copies instead of symlinks (less convenient for repo
# editing but independent of repo location).
MODE="symlink"
if [[ "${1:-}" == "--copy" ]]; then
  MODE="copy"
fi

mkdir -p "$COMMANDS_DIR"

echo "Wiring skills into $COMMANDS_DIR (mode: $MODE)"
for src in "$REPO_ROOT"/skills/skill-*.md; do
  [[ -e "$src" ]] || { echo "  no skills/skill-*.md files found"; break; }
  name="$(basename "$src")"
  name="${name#skill-}"        # strip skill- prefix
  dest="$COMMANDS_DIR/$name"

  if [[ -L "$dest" || -e "$dest" ]]; then
    if [[ -L "$dest" && "$(readlink "$dest")" == "$src" ]]; then
      echo "  ok       $name (already linked)"
      continue
    fi
    echo "  exists   $name — skip (remove $dest first if you want to relink)"
    continue
  fi

  if [[ "$MODE" == "symlink" ]]; then
    ln -s "$src" "$dest"
    echo "  linked   $name → $src"
  else
    cp "$src" "$dest"
    echo "  copied   $name → $dest"
  fi
done

echo ""
echo "Ensuring data/ skeleton at $REPO_ROOT/data/"
mkdir -p \
  "$REPO_ROOT/data/people" \
  "$REPO_ROOT/data/tasks/open" \
  "$REPO_ROOT/data/tasks/done" \
  "$REPO_ROOT/data/knowledge" \
  "$REPO_ROOT/data/decisions" \
  "$REPO_ROOT/data/sessions" \
  "$REPO_ROOT/data/debriefs"

for f in people/_index.md tasks/_index.md knowledge/_index.md decisions/_index.md sessions/_index.md; do
  if [[ ! -f "$REPO_ROOT/data/$f" ]]; then
    cat > "$REPO_ROOT/data/$f" <<EOF
# Index — $(dirname "$f")

Empty for now. Entries get appended by /debrief, /close, and friends.
EOF
    echo "  created  data/$f"
  fi
done

echo ""
echo "Done."
echo ""
if [[ ! -f "$REPO_ROOT/data/context.md" ]]; then
  echo "Next: open Claude Code in this repo and run /setup — it interviews you"
  echo "and writes data/context.md (your personal session briefing, gitignored)."
  echo "After that, /morning to start your first session."
else
  echo "data/context.md already exists. Try /morning in Claude Code."
fi
echo ""
echo "Re-run this script anytime to add new skills as they land in skills/."
