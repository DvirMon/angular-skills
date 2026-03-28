# Refactoring — Angular Migration Schematics

Angular ships official schematics that automate legacy-to-modern migrations. **Always prefer running a schematic over manually rewriting code.** Schematics perform full-program analysis across TypeScript and HTML templates, handling imports, cross-file references, and edge cases that manual edits miss.

## Agent Protocol — Before Running Any Schematic

1. **Discover the workspace.** Call the `list_projects` Angular CLI MCP tool to get the workspace config path and available projects. Use `workspaceConfigPath` when invoking CLI tools.
2. **Get version-specific standards.** Call `get_best_practices` with the `workspacePath` from step 1 to confirm what is safe to migrate in this project.
3. **Analyze the files.** Read the affected `.ts` and `.html` files to identify which legacy patterns are present.
4. **Pick the right schematic** from the quick-pick table below.
5. **Run via Bash.** Execute `ng generate @angular/core:<schematic>` in the project root. Scope with `--path` when only a subset of the project needs migration.
6. **Use `--insertTodos`** (where supported) to flag anything the schematic cannot safely migrate automatically.
7. **Verify.** Run `ng build` after the schematic to confirm no errors were introduced.

---

## Quick-Pick Table

| Legacy pattern | Modern replacement | Schematic to run |
|---|---|---|
| `@Input()` decorator | `input()` / `input.required()` | `signal-input-migration` |
| `@Output()` + `EventEmitter` | `output()` | `output-migration` |
| `@ViewChild` / `@ViewChildren` | `viewChild()` / `viewChildren()` | `signal-queries-migration` |
| `@ContentChild` / `@ContentChildren` | `contentChild()` / `contentChildren()` | `signal-queries-migration` |
| All three above in one pass | — | `signals` |
| `constructor(private svc: Svc)` | `inject(Svc)` | `inject-migration` |
| `*ngIf` / `*ngFor` / `*ngSwitch` | `@if` / `@for` / `@switch` | `control-flow-migration` |
| `NgModule`-based components | `standalone: true` | `standalone-migration` |
| Eager route imports | `loadComponent()` lazy loading | `route-lazy-loading-migration` |
| Unused `imports[]` entries | — | `cleanup-unused-imports` |
| `[(ngModel)]` | `model()` | ⚠️ No schematic — manual only |

---

## Schematics Reference

### `signal-input-migration` — `@Input()` → `input()`

Converts `@Input()` decorators to signal-based `input()` / `input.required()`. Rewrites all template and TypeScript references.

```bash
ng generate @angular/core:signal-input-migration

# Scope to a specific directory
ng generate @angular/core:signal-input-migration --path=src/app/feature

# Flag un-migratable inputs with TODO comments instead of silently skipping
ng generate @angular/core:signal-input-migration --insertTodos

# Push through soft incompatibilities (inheritance conflicts, narrowing, etc.)
ng generate @angular/core:signal-input-migration --bestEffortMode
```

**Skipped automatically (hard incompatibilities):** accessor inputs (`get`/`set`), inputs written from outside the component, `spyOn()` targets in tests, manually instantiated classes (`new MyComp()`).

**Minimum version:** Angular 17.1

---

### `output-migration` — `@Output()` → `output()`

Converts `@Output() event = new EventEmitter<T>()` to `output<T>()`. Rewrites `.emit()` call sites. In test files, wraps `.pipe()` usages in `toObservable()`.

```bash
ng generate @angular/core:output-migration

ng generate @angular/core:output-migration --path=src/app/feature
```

**Skipped automatically:** outputs assigned to a `Subject` or anything other than `new EventEmitter()`, outputs whose `.pipe()` is used in production code (not just tests), non-string aliases.

**Minimum version:** Angular 17.3

---

### `signal-queries-migration` — decorator queries → signal queries

Converts `@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren` to their signal equivalents. Drops the `static` option (signal queries are always static-equivalent). Unwraps `QueryList<T>` → `T`.

```bash
ng generate @angular/core:signal-queries-migration

ng generate @angular/core:signal-queries-migration --path=src/app/feature
ng generate @angular/core:signal-queries-migration --insertTodos
ng generate @angular/core:signal-queries-migration --bestEffortMode
```

**Skipped automatically:** queries whose `.changes` or `.dirty` is accessed (no signal equivalent), queries overridden in subclasses, manually instantiated classes.

**Minimum version:** Angular 17.2

---

### `signals` — all three signal migrations in one pass

Runs `signal-input-migration`, `output-migration`, and `signal-queries-migration` together.

```bash
# Run all three
ng generate @angular/core:signals

# Run only specific migrations
ng generate @angular/core:signals --migrations=inputs --migrations=queries

# With options
ng generate @angular/core:signals --path=src/app --bestEffortMode --insertTodos
```

**Minimum version:** Angular 17.3

---

### `inject-migration` — constructor injection → `inject()`

Converts constructor parameter injection to `inject()` calls. Moves injected dependencies to class-level properties. Handles `@Optional`, `@Self`, `@SkipSelf`, `@Host`, `@Attribute`, `@Inject(TOKEN)`, and `forwardRef`.

```bash
ng generate @angular/core:inject-migration

ng generate @angular/core:inject-migration --path=src/app/feature

# Also migrate abstract classes (off by default — abstract constructors may not be injectable)
ng generate @angular/core:inject-migration --migrateAbstractClasses

# Add constructor overload for backwards compatibility with subclasses
ng generate @angular/core:inject-migration --backwardsCompatibleConstructors
```

**Minimum version:** Angular 14

---

### `control-flow-migration` — `*ngIf`/`*ngFor`/`*ngSwitch` → `@if`/`@for`/`@switch`

Converts structural directive syntax in templates to built-in control flow blocks. Also removes now-redundant imports (`NgIf`, `NgFor`, `NgSwitch`, `CommonModule` if unused) from standalone component `imports` arrays.

```bash
ng generate @angular/core:control-flow-migration

ng generate @angular/core:control-flow-migration --path=src/app/feature
```

**Known limitations:**
- `*ngFor="let x of items as alias"` — the `as` alias syntax has no equivalent in `@for`. Remove the alias manually before re-running.
- i18n nesting conflicts — reported as an error; requires manual resolution.

**Minimum version:** Angular 17

---

### `standalone-migration` — NgModule → standalone components

Three phases; run **in order**:

```bash
# Phase 1: Add standalone: true, populate component imports[]
ng generate @angular/core:standalone-migration --mode=convert-to-standalone

# Phase 2: Remove empty NgModules
ng generate @angular/core:standalone-migration --mode=prune-ng-modules

# Phase 3: Switch bootstrapModule → bootstrapApplication
ng generate @angular/core:standalone-migration --mode=standalone-bootstrap
```

Each phase can be scoped: `--path=src/app/feature`

**Minimum version:** Angular 15.2

---

### `route-lazy-loading-migration` — eager routes → `loadComponent()`

Converts eagerly-imported standalone components in route configs to `loadComponent()` lazy loading.

```bash
ng generate @angular/core:route-lazy-loading-migration

ng generate @angular/core:route-lazy-loading-migration --path=src/app
```

**Requires:** standalone components (does not touch NgModule-based routing).

**Minimum version:** Angular 17

---

### `cleanup-unused-imports` — remove unused standalone imports

Removes entries from component `imports[]` arrays that are not referenced in the template.

```bash
ng generate @angular/core:cleanup-unused-imports
```

**Minimum version:** Angular 19

---

## `ng update` — Automatic Version Migrations

These run automatically during `ng update @angular/core` and should not be invoked manually:

```bash
ng update @angular/core@19
```

Runs automatically in v19:
- **`explicit-standalone-flag`** — adds `standalone: false` to non-standalone components; removes redundant `standalone: true` flags
- **`pending-tasks`** — renames `ExperimentalPendingTasks` → `PendingTasks`
- **`provide-initializer`** — replaces `APP_INITIALIZER` token with `provideAppInitializer()`

---

## NgModel / Two-Way Binding — No Schematic Available

> ⚠️ There is **no official schematic** for migrating `[(ngModel)]`.

`ngModel` is not deprecated and remains fully supported. If migrating to signal-based two-way binding is desired, use `model()` manually — it replaces a paired `@Input()`/`@Output()` with a single writable signal that supports `[(binding)]` syntax.

```ts
// Manual migration only
// Before
@Input() value = 0;
@Output() valueChange = new EventEmitter<number>();

// After
value = model(0);
```
