# my-claude-rules

Personal dev-workflow kit distributed as a native **Claude Code plugin** — install once, get 4 agents, 12 skills, 2 slash commands, and an always-on safety hook, with zero files copied into your project.

---

## Install

```
/plugin marketplace add thitiwut00897/my-cursor-rules
/plugin install my-claude-rules
```

## Update

```
/plugin update my-claude-rules
```

Nothing in your project is touched by install/update — plugin content lives in Claude Code's global plugin cache, not in your repo. `/init-project-docs` and `/po-workflow` (below) are the only things that write into a project, and only when you run them yourself.

## First use in a new project (optional)

```
/init-project-docs
```

Scaffolds `docs/codebase-docs/project-blueprint.md` + `AI-GUIDE.md` and adds a reference line to your project's `CLAUDE.md`. Run once per project, whenever you want.

---

## What's included

### Agents (`@agent-name`)

| Agent | Invoke | What it does |
|---|---|---|
| `po-agent` | `@po-agent` or `/po-workflow` | Orchestrates the full 6-stage lifecycle: Define → Plan → Build → Verify → Review → Ship |
| `tester-agent` | Called by `/build`, `/verify` | Writes failing tests from a task's AC before implementation (RED); runs full regression at Verify |
| `senior-full-stack-agent` | Called by `/build` | Implements backend then frontend to pass tests (GREEN) — any stack, per `project-blueprint.md` |
| `refactor-agent` | Called by `/verify`, `/review` | Fixes lint/test failures or Critical review findings without changing behavior |
| `code-reviewer` | Called by `/review`, `/ship` | 5-axis review: correctness, readability, architecture, security, performance |
| `security-auditor` | Called by `/review`, `/ship` | OWASP-style audit: secrets, auth/authz, dependency CVEs |
| `test-engineer` | Called by `/ship` | Analyzes test coverage gaps across the whole feature before shipping |

The full lifecycle is **opt-in** — it does not run automatically. Use `/po-workflow` to start it for a feature, or run `/spec /plan /build /verify /review /ship` individually. Small tasks don't need any of this.

### Commands (`/command-name`)

| Command | What it does |
|---|---|
| `/po-workflow [description or Jira link]` | Runs the full opt-in 6-stage lifecycle for the described task/feature |
| `/spec [Jira link or description]` | Define stage — reads a Jira card fully (or asks if none), confirms understanding, writes `SPEC.md` |
| `/plan` | Plan stage — slices `SPEC.md` into fullstack vertical-slice tasks, creates Jira subtasks, saves `tasks/plan.md` + `tasks/todo.md` |
| `/build [auto]` | Build stage — implements one task (or all, in `auto` mode) on a `develop`-based feature branch, syncing Jira status per task |
| `/verify` | Verify stage — full regression after all tasks are done, plus a user UI check |
| `/review` | Review stage — 5-axis review + security audit; Critical findings block progress |
| `/ship` | Ship stage — parallel fan-out (code-reviewer + security-auditor + test-engineer) → GO/NO-GO + mandatory rollback plan |
| `/init-project-docs` | Scaffolds `project-blueprint.md` + `AI-GUIDE.md` into the current project and links them from `CLAUDE.md` |

### Skills (auto-triggered by Claude based on description, or reference them by name)

| Skill | Use when |
|---|---|
| `clean-code` | Creating/editing a Container, Component, or Hook; file exceeds ~300 lines |
| `codeing-guide` | Naming conventions, state management (Redux/hooks) |
| `ui-guide-template` | React Native layout/Flexbox work, screens with complex layout |
| `visual-markers` | Visual Audit — adding debug border markers and reading screenshots against a design |
| `system-optimization` | After a task needed more than one round of fixes — capture lessons learned |
| `api-design` | Designing or reviewing REST API contracts (resource naming, status codes, pagination, versioning) |
| `archify` | Producing architecture / workflow / sequence / state diagrams as standalone HTML |
| `render-html-guide` | Using `react-native-render-html` with custom (Kanit) fonts |
| `scroll-bottom-safe-area` | Screens with `ScrollView` that need a safe-area spacer at the bottom |
| `baseline-ui` | Building/reviewing Tailwind UI components — animation durations, typography scale, layout anti-patterns |
| `fixing-accessibility` | Adding interactive controls/forms/dialogs — ARIA, keyboard nav, focus, contrast |
| `fixing-motion-performance` | Animations stutter or jank — layout thrashing, compositor properties, scroll-linked motion |

### Always-on (no invocation needed)

A `SessionStart` hook injects three safety/discipline rules into every session automatically:

- **Simple Code** — KISS, narrow diffs, no speculative abstraction
- **No Bulk Delete of Working Files** — never bulk-delete files you're actively editing without an explicit, specific list from the user
- **Jira/Issue Card Read Gate** — if a card/issue is linked but can't actually be read, stop and ask rather than guessing at requirements

Full text: [`hooks/always-on-rules.md`](hooks/always-on-rules.md)

---

## For local development

To edit this plugin and test changes against a local checkout before publishing:

```
/plugin marketplace add /path/to/my-cursor-rules
/plugin install my-claude-rules
```

## Explicitly out of scope

- SonarQube-related rules/skills and `work-summary-output-format` were dropped during the Cursor → Claude Code migration — not part of this plugin
- Cursor support (`.cursor/`, `.mdc` rules, `setup-cursor.sh`) has been retired from this repo

See [`docs/superpowers/specs/2026-07-05-claude-code-plugin-migration-design.md`](docs/superpowers/specs/2026-07-05-claude-code-plugin-migration-design.md) for the full migration design.
