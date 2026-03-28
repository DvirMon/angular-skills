---
name: angular-dev-v19
description: Generates Angular code and provides architectural guidance for existing Angular v19 projects. Trigger for best practices on reactivity (signals, linkedSignal, resource), forms, dependency injection, routing, animations, styling (component styles, Tailwind CSS), testing, or CLI tooling.
license: MIT
metadata:
  author: Dvir Monajem
  version: '2.0'
  target: Angular v19
  base: angular/skills (Copyright 2026 Google LLC, MIT)
---

# Angular Developer Guidelines — v19

> **This skill targets existing Angular v19 projects.** All guidance, APIs, and examples are written for v19. Features exclusive to v20+ or v21+ are not included.

---

## Legacy Syntax Policy (STRICT — applies to all code generation)

The following legacy Angular APIs are **FORBIDDEN in new code**. Never generate them. Never suggest them. Always use the modern equivalent.

| Legacy (NEVER use) | Modern (ALWAYS use) | Notes |
|---|---|---|
| `@Input()` decorator | `input()` / `input.required()` | Signal-based, reactive, type-safe |
| `@Output()` + `EventEmitter` | `output()` | No `EventEmitter` import needed |
| `@HostBinding()` | `host: { '[prop]': expr }` in metadata | Declarative, co-located |
| `@HostListener()` | `host: { '(event)': 'handler($event)' }` in metadata | Declarative, co-located |
| `@ViewChild()` / `@ViewChildren()` | `viewChild()` / `viewChildren()` | Signal-based queries |
| `@ContentChild()` / `@ContentChildren()` | `contentChild()` / `contentChildren()` | Signal-based queries |
| `*ngIf` / `*ngFor` / `*ngSwitch` | `@if` / `@for` / `@switch` | Built-in control flow |
| `constructor(private svc: Service)` | `private svc = inject(Service)` | Functional injection |
| `NgModule` (for new code) | Standalone components | `standalone: true` is default in v19 |
| `ngOnInit` for signal derivation | `computed()` / `effect()` | Reactive by default |
| `ngOnDestroy` for cleanup | `DestroyRef.onDestroy()` / `takeUntilDestroyed()` | Prefer modern alternatives; `ngOnDestroy` is not forbidden |

### Refactoring Guidance

When the agent is **editing or working in a file that uses legacy syntax**:

1. **Complete the user's requested task first** using modern syntax only.
2. **After the task is done**, suggest a follow-up refactoring opportunity:
   > "This file uses legacy `@Input()` / `@Output()` decorators. Want me to refactor them to signal-based `input()` / `output()` as a separate change?"
3. **Never mix** — if you add new inputs/outputs to a file with legacy ones, still use the modern API for the new additions. Do not match the file's legacy style.
4. **Never refactor in the same change** unless the user explicitly asks for it.

### When Asked to Refactor Legacy Code

**Do not rewrite manually.** Angular ships official schematics that perform full-program analysis across TypeScript and templates. Always prefer a schematic over hand-editing.

**Protocol:**
1. Read the affected `.ts` and `.html` files to identify which legacy patterns are present.
2. Consult [refactoring.md](references/refactoring.md) to select the correct schematic.
3. Run the schematic (scoped with `--path` when appropriate).
4. Run `ng build` to verify no errors were introduced.

Read [refactoring.md](references/refactoring.md) for all available schematics, exact commands, flags, and known limitations.

---

## General Guidelines

1. When generating code, follow Angular's style guide and best practices for maintainability and performance.
2. Once you finish generating code, run `ng build` to ensure there are no build errors. If there are errors, analyze the error messages and fix them before proceeding.

## Components

When working with Angular components, consult the following references based on the task:

- **Fundamentals**: Anatomy, metadata, and core concepts. Read [components.md](references/components.md)
- **Inputs**: Signal-based inputs, transforms, and model inputs. Read [inputs.md](references/inputs.md)
- **Outputs**: Signal-based outputs and custom event best practices. Read [outputs.md](references/outputs.md)
- **Host Elements**: Host bindings and attribute injection. Read [host-elements.md](references/host-elements.md)
- **Templates**: Control flow, @let, class/style bindings, typed form access. Read [templates.md](references/templates.md)
- **Lifecycle**: Signals-first lifecycle, DestroyRef, afterNextRender, takeUntilDestroyed. Read [lifecycle.md](references/lifecycle.md)
- **Directives**: Attribute, host directives, directive composition API, and the same-name alias convention. Read [directives.md](references/directives.md)
- **Structural Directives**: Portal, lazy render, domain-logic conditionals (role/permission), typed template outlet, and microsyntax reference. Read [structural-directives.md](references/structural-directives.md)
- **Refactoring Legacy Code**: All Angular migration schematics (`signal-input-migration`, `output-migration`, `signal-queries-migration`, `inject-migration`, `control-flow-migration`, `standalone-migration`, and more). Read [refactoring.md](references/refactoring.md)

If you require deeper documentation not found in the references above, read the documentation at `https://angular.dev/guide/components`.

## Reactivity and Data Management

When managing state and data reactivity, use Angular Signals and consult the following references:

- **Signals Overview**: Core signal concepts (`signal`, `computed`), reactive contexts, and `untracked`. Read [signals-overview.md](references/signals-overview.md)
- **Dependent State (`linkedSignal`)**: Creating writable state linked to source signals. Read [linked-signal.md](references/linked-signal.md)
- **Async Reactivity (`resource`)**: Fetching asynchronous data directly into signal state. Read [resource.md](references/resource.md)
  > ⚠️ `resource()`, `httpResource()`, and `rxResource()` are **experimental** in v19. Use with awareness that the API may change in v20+.
- **Side Effects (`effect`)**: Logging, third-party DOM manipulation, and when NOT to use effects. Read [effects.md](references/effects.md)
- **RxJS Interop**: Bridging signals and observables with `toSignal()`, `toObservable()`, and `takeUntilDestroyed()`. Read [rxjs-interop.md](references/rxjs-interop.md)

## Forms

**Default for v19: Typed Reactive Forms.**

- **Reactive forms**: Use for all forms with typed FormGroup/FormControl. Read [reactive-forms.md](references/reactive-forms.md)
> Signal Forms (`@angular/forms/signals`) are not available in v19. Do not reference them.

## Dependency Injection

When implementing dependency injection in Angular, follow these guidelines:

- **Fundamentals**: Overview of Dependency Injection, services, and the `inject()` function. Read [di-fundamentals.md](references/di-fundamentals.md)
- **Creating and Using Services**: Creating services, the `providedIn: 'root'` option, and injecting into components or other services. Read [creating-services.md](references/creating-services.md)
- **Defining Dependency Providers**: Automatic vs manual provision, `InjectionToken`, `useClass`, `useValue`, `useFactory`, and scopes. Read [defining-providers.md](references/defining-providers.md)
- **Injection Context**: Where `inject()` is allowed, `runInInjectionContext`, and `assertInInjectionContext`. Read [injection-context.md](references/injection-context.md)
- **Hierarchical Injectors**: The `EnvironmentInjector` vs `ElementInjector`, resolution rules, modifiers (`optional`, `skipSelf`), and `providers` vs `viewProviders`. Read [hierarchical-injectors.md](references/hierarchical-injectors.md)
- **Services**: Service design patterns, single responsibility, and facade pattern. Read [services.md](references/services.md)

## Routing

When implementing navigation in Angular, consult the following references:

- **Define Routes**: URL paths, static vs dynamic segments, wildcards, and redirects. Read [define-routes.md](references/define-routes.md)
- **Show Routes with Outlets**: Using `<router-outlet>`, nested outlets, and named outlets. Read [show-routes-with-outlets.md](references/show-routes-with-outlets.md)
- **Navigate to Routes**: Declarative navigation with `RouterLink` and programmatic navigation with `Router`. Read [navigate-to-routes.md](references/navigate-to-routes.md)
- **Control Route Access with Guards**: Implementing `CanActivate`, `CanMatch`, and other guards for security. Read [route-guards.md](references/route-guards.md)
- **Data Resolvers**: Pre-fetching data before route activation with `ResolveFn`. Read [data-resolvers.md](references/data-resolvers.md)
- **Router Lifecycle and Events**: Chronological order of navigation events and debugging. Read [router-lifecycle.md](references/router-lifecycle.md)

If you require deeper documentation or more context, visit the [official Angular Routing guide](https://angular.dev/guide/routing).

## HTTP & Data Fetching

When implementing HTTP and data fetching, consult the following references:

- **HTTP entry point** (choosing the right API, `HttpClient` mutations, error handling): Read [http.md](references/http.md)
- **Resource APIs** (`httpResource()`, `resource()`, `rxResource()`, state signals, loading states): Read [resource.md](references/resource.md)
  > ⚠️ All resource APIs are **experimental** in v19.
- **Interceptors** (functional interceptors, auth, error, registration): Read [interceptors.md](references/interceptors.md)

## Styling and Animations

When implementing styling and animations in Angular, consult the following references:

- **Using Tailwind CSS with Angular**: Integrating Tailwind CSS into Angular projects. Read [tailwind-css.md](references/tailwind-css.md)
- **Angular Animations**: Use native CSS animations (recommended) or the `@angular/animations` DSL for dynamic effects. Read [angular-animations.md](references/angular-animations.md)
  > `animate.enter` / `animate.leave` are not available in v19. Use CSS animations or the `@angular/animations` DSL.
- **Styling components**: Best practices for component styles and encapsulation. Read [component-styling.md](references/component-styling.md)

## Testing

When writing or updating tests, consult the following references based on the task:

- **Fundamentals**: Best practices for unit testing, async patterns, and `TestBed`. Use **Jasmine/Karma** or a manual Vitest setup (native Vitest support is v20+ only). Read [testing-fundamentals.md](references/testing-fundamentals.md)
- **Component Harnesses**: Standard patterns for robust component interaction. Read [component-harnesses.md](references/component-harnesses.md)
- **Router Testing**: Using `RouterTestingHarness` for reliable navigation tests. Read [router-testing.md](references/router-testing.md)

## Tooling

When working with Angular tooling, consult the following references:

- **Nx**: This project uses Nx. Use `nx generate`, `nx build`, `nx serve`, and `nx test` instead of the Angular CLI directly. Refer to the Nx docs for available generators and executors.
