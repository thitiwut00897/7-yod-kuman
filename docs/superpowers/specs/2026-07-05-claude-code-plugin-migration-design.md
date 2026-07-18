# Design: Pivot my-cursor-rules → Claude Code Plugin

**Date:** 2026-07-05
**Status:** Approved (pending final doc review)

## Goal

Turn this repo from a Cursor-only rules installer (`curl | bash` copying files into
`.cursor/`) into a central Claude Code template that any project can pull in with a
native install command, with no overwrite risk to project-specific customizations.

## Scope decision

Focus exclusively on Claude Code going forward. Cursor support (`.cursor/`,
`setup-cursor.sh`, `.mdc` rule format) is retired from this repo — no dual-target
output, no separate branch. If Cursor support is needed again later, that is a
separate project.

## Mechanism: Claude Code Plugin + self-hosted Marketplace

Instead of a bash script that clones/copies files into a project's `.cursor/`
folder, this repo becomes a native Claude Code Plugin, distributed via its own
Marketplace manifest.

Install:
```
/plugin marketplace add thitiwut00897/my-claude-rules
/plugin install my-claude-rules
```

Update:
```
/plugin update my-claude-rules
```

This removes the core problem of the current script: plugin content lives in the
global plugin cache (`~/.claude/plugins/cache/...`), not copied into the project
directory, so updates never overwrite a file the user has customized.

Repo is recommended to be renamed `my-claude-rules` to reflect the new scope (cosmetic,
not blocking — can be done at implementation time).

Single all-in-one plugin (not split into multiple installable plugins) — the content
is a cohesive personal dev-workflow kit, not independent products.

## Repo / plugin structure

```
my-claude-rules/
├── .claude-plugin/
│   ├── plugin.json                 # manifest: name, version, description, author
│   └── marketplace.json            # self-hosted marketplace listing this one plugin
├── agents/
│   ├── po-agent.md                 # new subagent (from rules/po-agent.mdc)
│   ├── tester-agent.md             # merged from rules/tester-agent.mdc + agents/tester-agent.md
│   ├── senior-full-stack-agent.md  # kept, references cleaned up
│   └── refactor-agent.md           # new subagent (from rules/refactor-agent.mdc)
├── skills/
│   ├── api-design/SKILL.md
│   ├── clean-code/SKILL.md
│   ├── codeing-guide/SKILL.md
│   ├── ui-guide-template/SKILL.md
│   ├── scroll-bottom-safe-area/SKILL.md # renamed from Scroll-Bottom-Safe-Area
│   ├── baseline-ui/SKILL.md            # new — folded in from ~/.claude/skills (personal)
│   └── fixing-motion-performance/SKILL.md # new — folded in from ~/.claude/skills (personal)
├── commands/
│   ├── po-workflow.md               # opt-in entry point for the full PO methodology
│   └── init-project-docs.md         # scaffolds project-specific docs into target project
├── hooks/
│   └── hooks.json + session-start script  # always-on safety rules, injected every session
└── docs/templates/
    ├── project-blueprint.md         # from rules/architecture.mdc
    └── AI-GUIDE.md
```

## Content migration mapping

| Source (old) | Destination (new) | Rationale |
|---|---|---|
| `rules/architecture.mdc` | `docs/templates/project-blueprint.md`, scaffolded by `/init-project-docs` | Project-specific info the user must fill in per project — cannot live as static global plugin content |
| `rules/simple-code.mdc` | Hook (always-on inject) | Universal coding discipline, cheap to always include |
| `rules/no-bulk-delete-working-files.mdc` | Hook (always-on inject) | Safety guard, must not depend on being invoked |
| `rules/jira-card-read-gate.mdc` | Hook (always-on inject) | Safety gate, same reasoning |
| `rules/po-agent.mdc` | `agents/po-agent.md` + `commands/po-workflow.md` | Was `alwaysApply: true`; explicitly changed to opt-in (see below) so lightweight tasks aren't forced through the full gate |
| `rules/tester-agent.mdc` + `agents/tester-agent.md` (duplicated content) | Single merged `agents/tester-agent.md` | Removes existing duplication |
| `rules/refactor-agent.mdc` | `agents/refactor-agent.md` | Consistent subagent format with the other three |
| `agents/senior-full-stack-agent.md` | Same file, path references updated | Already in the right format |
| `rules/sonar-js-high-signal.mdc` | Dropped | Out of scope per explicit request |
| `rules/sonarqube-mcp-connection.mdc` | Dropped | Out of scope per explicit request |
| `rules/sonarqube_mcp_instructions.mdc` | Dropped | Out of scope per explicit request |
| `rules/work-summary-output-format.mdc` | Dropped | Out of scope per explicit request |
| `skills/*` (9 existing folders) | Ported into plugin `skills/`, two renamed to kebab-case | Consistency with naming convention |
| `~/.claude/skills/baseline-ui`, `fixing-motion-performance` | Copied into plugin `skills/` | Currently personal-machine-only files with no plugin backing them; folding in makes them travel with the plugin to any machine/project |
| `~/.claude/skills/frontend-slides`, `superpowers:*` | **Not** bundled | Already their own separate plugins (frontend-slides has its own cache/marketplace entry; superpowers belongs to a third-party repo) — duplicating them would fork someone else's plugin content |

Migration cleanup: several source files reference old Cursor-style paths
(`.cursor/skills/...`, `.cursor/.cursorrules`, `.cursor/rules/refactor-agent.mdc`).
These must be rewritten to Claude Code-native references (skill names, `@agent-name`
mentions) during migration, not left as dead paths.

## Opt-in workflow decision

The PO/Tester/Senior/Refactor methodology (Master Test Cases → Task Planning →
Per-Task Gate → Final Regression) is powerful but heavy. Since this plugin now
targets arbitrary projects — including small scripts and quick tasks — it must not
be forced on every session via a SessionStart hook the way `po-agent.mdc` was
(`alwaysApply: true`) in the original Cursor setup.

Instead:
- The four agents are available for direct invocation (`@po-agent`, `@tester-agent`, etc.)
- `/po-workflow` is a slash command that explicitly starts the full methodology for
  a feature/task when the user wants it
- Nothing about this workflow is injected automatically — it is entirely opt-in

The only content injected into every session via the hook is the three safety/
discipline rules listed above (simple-code, no-bulk-delete, jira-card-read-gate),
which are low-cost and broadly applicable regardless of project type.

## Project-specific scaffolding: `/init-project-docs`

Run once per project (not on plugin install). It:
1. Creates `docs/codebase-docs/project-blueprint.md` from the template (user fills
   in real stack/structure info)
2. Creates `docs/codebase-docs/AI-GUIDE.md`
3. Creates the project's `CLAUDE.md` if none exists, or appends to it if one exists,
   adding a reference line pointing at `project-blueprint.md` — so Claude Code loads
   that pointer automatically every session in that project, without requiring the
   user to remember to mention it

This mirrors the old `architecture.mdc` "please update this after install" pattern,
but scoped correctly: only the parts that are genuinely project-specific touch the
project directory; everything reusable stays in the plugin.

## Documentation deliverable

The repo README is rewritten as a plugin reference doc listing every agent, skill,
command, and hook with:
- what it's called / how to invoke it (`@agent-name`, automatic skill trigger,
  `/command-name`, or "runs automatically")
- what it does
- when to use it

This replaces the current flat table of `.mdc` rule descriptions.

## Install / update UX

```
/plugin marketplace add thitiwut00897/my-claude-rules
/plugin install my-claude-rules
/plugin update my-claude-rules
```

No project files are touched by install/update. `/init-project-docs` and
`/po-workflow` are run explicitly by the user, per project, when wanted.

## Testing / rollout plan

1. Test locally via a local marketplace/plugin path (or symlink into
   `~/.claude/plugins/`) in one throwaway test project before publishing
2. Verify the SessionStart hook actually injects the three safety rules into a
   fresh session; exercise `no-bulk-delete` and `jira-card-read-gate` behavior
   directly
3. Run `/init-project-docs` against a project with no `CLAUDE.md` and one that
   already has one — confirm both the create and append paths work correctly
4. Run `/po-workflow` end-to-end on one small real feature, walking through all
   four agents (po → tester → senior-full-stack → refactor)
5. Spot-check 2–3 of the ported skills to confirm their descriptions still trigger
   correctly in the new plugin context
6. Publish (tag a version), then verify `/plugin marketplace add` from the public
   GitHub URL works from a clean machine/project with no local cache

## Explicitly out of scope

- SonarQube-related rules and skills (sonar-js-high-signal, sonarqube-mcp-connection,
  sonarqube_mcp_instructions) — dropped entirely, not migrated
- `work-summary-output-format.mdc` — dropped entirely, not migrated
- Continued Cursor support in this repo
- Bundling `frontend-slides` or `superpowers` skills — they remain separate plugins
