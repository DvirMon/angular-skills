# Angular Skills

Structured instructions that help AI coding agents generate correct, idiomatic Angular code. Built on top of the [official Angular skills](https://github.com/angular/skills) with additional patterns and best practices.

## Installation

### Quick install (recommended)

```bash
npx angular-skills add
```

The CLI will prompt you to choose which agents to install for. Skills are always installed to the universal directory (`.agents/skills/`), and you can additionally select agent-specific directories:

| Agent | Directory |
|-------|-----------|
| Universal (all agents) | `.agents/skills/` |
| Claude Code | `.claude/skills/` |
| Cursor | `.cursor/skills/` |
| GitHub Copilot | `.github/copilot/skills/` |
| Codex | `.codex/skills/` |
| And 30+ more... | `.<agent>/skills/` |

**How it works:**

| File | Strategy | Why |
|------|----------|-----|
| `SKILL.md` | Copied once | Edit freely — your changes survive package updates |
| `references/` | Symlinked | Points to the globally-installed package; `npm update -g angular-skills` refreshes all reference files automatically |

**Keeping references up to date:**

```bash
npm update -g angular-skills
```

No re-running the installer — the symlink picks up the new version immediately.

---

### Manual install

Copy or symlink the skill folder into the relevant agent directory:

#### Universal (all agents)

```bash
# Global — works across all agents
ln -s "$(pwd)/angular-developer" ~/.agents/skills/angular-developer
```

#### Claude Code

```bash
# Project-level
cp -r angular-developer/ .claude/skills/angular-developer/

# Global
ln -s "$(pwd)/angular-developer" ~/.claude/skills/angular-developer
```

#### Cursor

```bash
cp -r angular-developer/ .cursor/skills/angular-developer/
```

#### GitHub Copilot

```bash
cp -r angular-developer/ .github/copilot/skills/angular-developer/
```

#### Codex

```bash
cp -r angular-developer/ .codex/skills/angular-developer/
```

#### Other agents

Most agents follow the `.<agent>/skills/` convention:

```bash
cp -r angular-developer/ .<agent>/skills/angular-developer/
```

---

## What's Included

A single `angular-developer` skill with modular reference files covering:

- **Components** — standalone components, inputs, outputs, host elements
- **Signals & Reactivity** — signal(), computed(), linkedSignal(), effect(), resource()
- **Dependency Injection** — inject(), providers, tokens, hierarchical injectors
- **Routing** — lazy loading, guards, resolvers, signal-based route params
- **Forms** — typed reactive forms (default), template-driven forms
- **HTTP** — HttpClient, mutations, error handling
- **Resource APIs** — httpResource(), resource(), rxResource(), loading states
- **Interceptors** — functional interceptors, auth, error handling
- **Templates** — control flow (@if, @for, @switch), @let, class/style bindings
- **Lifecycle** — signals-first lifecycle, DestroyRef, afterNextRender, takeUntilDestroyed
- **Services** — single responsibility, facade pattern, service state with signals
- **Directives** — attribute, structural, host directives, composition API
- **Testing** — Vitest, TestBed, signal testing, OnPush, HTTP mocking
- **Styling** — component styles, CSS variables
- **Animations** — CSS-first animations
- **Tooling** — Angular CLI, MCP server
- **RxJS Interop** — toSignal(), toObservable(), takeUntilDestroyed()

## Versions

| Folder | Angular Version | Notes |
|--------|----------------|-------|
| `angular-developer/` | v20+ (latest) | General Angular projects |
| `atera-angular-developer/` | v19 | Atera existing projects — Nx, no new project scaffolding |

## What's Different from the Official Angular Skills

This repo adds:

- **Lifecycle patterns** — signals-first lifecycle model replacing legacy hooks
- **Service architecture** — facade pattern, signal-based service state
- **Template best practices** — @let usage, typed form access
- **Directive composition** — host directives, directive composition API patterns
- **RxJS interop** — bridging signals and observables
- **SRP reference docs** — HTTP, resource APIs, and interceptors split into focused files

## License

MIT
