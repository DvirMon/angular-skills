# Angular v19 Skills

Structured instructions that help AI agents generate correct, idiomatic Angular v19 code. Built on top of the [official Angular skills](https://github.com/angular/skills) with additional patterns and best practices.

## Installation

### Quick install (recommended)

```bash
npx angular-skills add
```

The installer will ask whether to install **project-level** (`.claude/skills/`) or **globally** (`~/.agents/skills/`).

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

#### Claude Code — project-level

```bash
cp -r angular-developer/ .claude/skills/angular-developer/
```

#### Claude Code — global

```bash
ln -s "$(pwd)/angular-developer" ~/.agents/skills/angular-developer
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

## What's Included

A single `angular-developer` skill with modular reference files covering:

- **Components** — standalone components, inputs, outputs, host elements
- **Signals & Reactivity** — signal(), computed(), linkedSignal(), effect(), resource()
- **Dependency Injection** — inject(), providers, tokens, hierarchical injectors
- **Routing** — lazy loading, guards, resolvers, signal-based route params
- **Forms** — typed reactive forms (default), template-driven forms
- **HTTP** — httpResource(), resource(), rxResource(), HttpClient, interceptors
- **Templates** — control flow (@if, @for, @switch), @let, class/style bindings, signal queries
- **Lifecycle** — signals-first lifecycle, DestroyRef, afterNextRender, takeUntilDestroyed
- **Services** — single responsibility, facade pattern, service state with signals
- **Directives** — attribute, structural, host directives, composition API
- **Testing** — Vitest, TestBed, signal testing, OnPush, HTTP mocking
- **Styling** — component styles, CSS variables
- **Animations** — CSS-first animations
- **Tooling** — Angular CLI, MCP server
- **RxJS Interop** — toSignal(), toObservable(), takeUntilDestroyed()

## What's Different from the Official Angular Skills

This repo targets **Angular v19** specifically and adds:

- **Lifecycle patterns** — signals-first lifecycle model replacing legacy hooks
- **Service architecture** — facade pattern, signal-based service state
- **Template best practices** — @let usage, signal queries (viewChild/contentChild), typed form access
- **Directive composition** — host directives, directive composition API patterns
- **RxJS interop** — bridging signals and observables
- **Signal naming convention** — `$` prefix for signal fields
- **Removed v21+ content** — signal forms, features not available in v19

## Angular Version

This skill targets **Angular v19**. Features exclusive to v20+ or v21+ have been removed or clearly marked.

## License

MIT
