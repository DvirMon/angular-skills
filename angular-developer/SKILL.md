---
name: angular-developer
description: Generates Angular code and provides architectural guidance. Trigger when creating projects, components, or services, or for best practices on reactivity (signals, linkedSignal, resource), forms, dependency injection, routing, SSR, accessibility (ARIA), animations, styling (component styles, Tailwind CSS), testing, or CLI tooling.
license: MIT
metadata:
  author: Dvir Monajem
  version: '2.0'
  base: angular/skills (Copyright 2026 Google LLC, MIT)
---

# Angular Developer Guidelines

## Version Detection (MUST RUN ON EVERY SESSION START)

**On the very first interaction in a session**, you MUST determine the Angular version. This is a **blocking prerequisite** — do not generate any Angular code until the version is resolved.

### Step 1: Check the version cache

Look for a `.angular-version` file in the project root. If it exists, read it and use it immediately as `ANGULAR_VERSION`. **Do not read `package.json` — skip straight to Step 4.**

### Step 2: No cache — detect from `package.json`

If `.angular-version` does not exist, read `package.json` and extract the major version from `@angular/core` in `dependencies` or `devDependencies`. Parse the semver string (e.g., `"^19.2.0"` → `19`).

### Step 3: Ask the user whether to cache

After detecting the version, ask:

> "Detected Angular v{version}. Want me to cache this so I skip detection next time? (y/n)"

- **If yes** → write `.angular-version` with the detected version. All future sessions read the cache instantly (Step 1) with zero `package.json` overhead.
- **If no** → use the version for this session only. Next session will repeat detection from `package.json`.

If no `package.json` is found either, ask the user for the version directly, then offer to cache it.

### Step 4: Use for the session

Reference the resolved version as `ANGULAR_VERSION` in all decisions below. Do not re-check within the same session.

> **If the user upgrades Angular**, they should delete `.angular-version` (or tell the agent "redetect version") to trigger fresh detection.

### `.angular-version` file format

```
ANGULAR_VERSION=19
```

One line. No comments. Add `.angular-version` to `.gitignore` — it is machine-local and should not be committed.

---

## Version-Gated Features

The following features are **only available in specific Angular versions**. Do NOT use them in older projects.

| Feature | Minimum Version | Reference |
|---------|----------------|-----------|
| Signal Forms (`@angular/forms/signals`) | v21+ | [signal-forms.md](references/signal-forms.md) |
| Angular Aria (`@angular/aria`) | v21+ | [angular-aria.md](references/angular-aria.md) |
| `animate.enter` / `animate.leave` | v20.2+ | [angular-animations.md](references/angular-animations.md) |
| Route View Transitions API | v20.2+ | [route-animations.md](references/route-animations.md) |
| Native Vitest support (`@angular/build:unit-test`) | v20+ | [testing-fundamentals.md](references/testing-fundamentals.md) |
| `resource()` API (stable) | v20+ | [resource.md](references/resource.md) |
| `httpResource()` | v20+ | [resource.md](references/resource.md) |
| `linkedSignal()` | v19+ | [linked-signal.md](references/linked-signal.md) |
| Signal-based inputs (`input()`) | v19+ (stable) | [inputs.md](references/inputs.md) |
| Signal-based outputs (`output()`) | v19+ (stable) | [outputs.md](references/outputs.md) |
| Signal-based queries (`viewChild`, `contentChild`) | v19+ (stable) | |
| Built-in control flow (`@if`, `@for`, `@switch`) | v17+ (stable) | [components.md](references/components.md) |

**Rules:**
- If `ANGULAR_VERSION < 21`: Do NOT reference Signal Forms. Default to **Typed Reactive Forms** for all form work.
- If `ANGULAR_VERSION < 21`: Do NOT reference Angular Aria (`@angular/aria`). Use standard ARIA attributes manually.
- If `ANGULAR_VERSION < 20.2`: Do NOT use `animate.enter`/`animate.leave`. Use CSS animations or the legacy `@angular/animations` DSL.
- If `ANGULAR_VERSION < 20.2`: Do NOT use `withViewTransitions()` for route animations.
- If `ANGULAR_VERSION < 20`: `resource()` and `httpResource()` are experimental — note this when using them.
- If `ANGULAR_VERSION < 20`: Vitest is not natively supported. Use Jasmine/Karma or manual Vitest setup.

---

## General Guidelines

1. When generating code, follow Angular's style guide and best practices for maintainability and performance. Use the Angular CLI for scaffolding components, services, directives, pipes, and routes to ensure consistency.

2. Once you finish generating code, run `ng build` to ensure there are no build errors. If there are errors, analyze the error messages and fix them before proceeding. Do not skip this step, as it is critical for ensuring the generated code is correct and functional.

## Creating New Projects

If no guidelines are provided by the user, here are default rules to follow when creating a new Angular project:

1. Use the latest stable version of Angular unless the user specifies otherwise.
2. If `ANGULAR_VERSION >= 21`: Use Signal Forms for form management in new projects. [Find out more](references/signal-forms.md).
3. If `ANGULAR_VERSION < 21`: Use Typed Reactive Forms as the default form approach.

**Execution Rules for `ng new`:**
When asked to create a new Angular project, you must determine the correct execution command by following these strict steps:

**Step 1: Check for an explicit user version.**

- **IF** the user requests a specific version (e.g., Angular 15), bypass local installations and strictly use `npx`.
- **Command:** `npx @angular/cli@<requested_version> new <project-name>`

**Step 2: Check for an existing Angular installation.**

- **IF** no specific version is requested, run `ng version` in the terminal to check if the Angular CLI is already installed on the system.
- **IF** the command succeeds and returns an installed version, use the local/global installation directly.
- **Command:** `ng new <project-name>`

**Step 3: Fallback to Latest.**

- **IF** no specific version is requested AND the `ng version` command fails (indicating no Angular installation exists), you must use `npx` to fetch the latest version.
- **Command:** `npx @angular/cli@latest new <project-name>`

## Components

When working with Angular components, consult the following references based on the task:

- **Fundamentals**: Anatomy, metadata, core concepts, and template control flow (@if, @for, @switch). Read [components.md](references/components.md)
- **Inputs**: Signal-based inputs, transforms, and model inputs. Read [inputs.md](references/inputs.md)
- **Outputs**: Signal-based outputs and custom event best practices. Read [outputs.md](references/outputs.md)
- **Host Elements**: Host bindings and attribute injection. Read [host-elements.md](references/host-elements.md)
- **Templates**: Control flow, @let, class/style bindings, signal queries, typed form access. Read [templates.md](references/templates.md)
- **Lifecycle**: Signals-first lifecycle, DestroyRef, afterNextRender, takeUntilDestroyed. Read [lifecycle.md](references/lifecycle.md)
- **Directives**: Attribute, structural, host directives, and directive composition API. Read [directives.md](references/directives.md)

If you require deeper documentation not found in the references above, read the documentation at `https://angular.dev/guide/components`.

## Reactivity and Data Management

When managing state and data reactivity, use Angular Signals and consult the following references:

- **Signals Overview**: Core signal concepts (`signal`, `computed`), reactive contexts, and `untracked`. Read [signals-overview.md](references/signals-overview.md)
- **Dependent State (`linkedSignal`)**: Creating writable state linked to source signals. Read [linked-signal.md](references/linked-signal.md)
- **Async Reactivity (`resource`)**: Fetching asynchronous data directly into signal state. Read [resource.md](references/resource.md)
- **Side Effects (`effect`)**: Logging, third-party DOM manipulation (`afterRenderEffect`), and when NOT to use effects. Read [effects.md](references/effects.md)
- **RxJS Interop**: Bridging signals and observables with `toSignal()`, `toObservable()`, and `takeUntilDestroyed()`. Read [rxjs-interop.md](references/rxjs-interop.md)

## Forms

When making a forms decision, check `ANGULAR_VERSION` and consider the following:

- If `ANGULAR_VERSION >= 21` and this is a **new form**: prefer **Signal Forms**. Read [signal-forms.md](references/signal-forms.md)
- If `ANGULAR_VERSION < 21`: use **Typed Reactive Forms** as the default. Read [reactive-forms.md](references/reactive-forms.md)
- For older applications or when working with existing forms, match the application's current form strategy.
- **Template-driven forms**: Use for simple forms. Read [template-driven-forms.md](references/template-driven-forms.md)
- **Reactive forms**: Use for complex forms with typed FormGroup/FormControl. Read [reactive-forms.md](references/reactive-forms.md)

## Dependency Injection

When implementing dependency injection in Angular, follow these guidelines:

- **Fundamentals**: Overview of Dependency Injection, services, and the `inject()` function. Read [di-fundamentals.md](references/di-fundamentals.md)
- **Creating and Using Services**: Creating services, the `providedIn: 'root'` option, and injecting into components or other services. Read [creating-services.md](references/creating-services.md)
- **Defining Dependency Providers**: Automatic vs manual provision, `InjectionToken`, `useClass`, `useValue`, `useFactory`, and scopes. Read [defining-providers.md](references/defining-providers.md)
- **Injection Context**: Where `inject()` is allowed, `runInInjectionContext`, and `assertInInjectionContext`. Read [injection-context.md](references/injection-context.md)
- **Hierarchical Injectors**: The `EnvironmentInjector` vs `ElementInjector`, resolution rules, modifiers (`optional`, `skipSelf`), and `providers` vs `viewProviders`. Read [hierarchical-injectors.md](references/hierarchical-injectors.md)
- **Services**: Service design patterns, single responsibility, and facade pattern. Read [services.md](references/services.md)

## Angular Aria _(v21+ only)_

> **Skip this section if `ANGULAR_VERSION < 21`.** The `@angular/aria` package is not available before v21.

When building accessible custom components for any of the following patterns: Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid, consult the following reference:

- **Angular Aria Components**: Building headless, accessible components (Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid) and styling ARIA attributes. Read [angular-aria.md](references/angular-aria.md)

## Routing

When implementing navigation in Angular, consult the following references:

- **Define Routes**: URL paths, static vs dynamic segments, wildcards, and redirects. Read [define-routes.md](references/define-routes.md)
- **Route Loading Strategies**: Eager vs lazy loading, and context-aware loading. Read [loading-strategies.md](references/loading-strategies.md)
- **Show Routes with Outlets**: Using `<router-outlet>`, nested outlets, and named outlets. Read [show-routes-with-outlets.md](references/show-routes-with-outlets.md)
- **Navigate to Routes**: Declarative navigation with `RouterLink` and programmatic navigation with `Router`. Read [navigate-to-routes.md](references/navigate-to-routes.md)
- **Control Route Access with Guards**: Implementing `CanActivate`, `CanMatch`, and other guards for security. Read [route-guards.md](references/route-guards.md)
- **Data Resolvers**: Pre-fetching data before route activation with `ResolveFn`. Read [data-resolvers.md](references/data-resolvers.md)
- **Router Lifecycle and Events**: Chronological order of navigation events and debugging. Read [router-lifecycle.md](references/router-lifecycle.md)
- **Rendering Strategies**: CSR, SSG (Prerendering), and SSR with hydration. Read [rendering-strategies.md](references/rendering-strategies.md)
- **Route Transition Animations** _(v20.2+ only)_: Enabling and customizing the View Transitions API. Read [route-animations.md](references/route-animations.md)

If you require deeper documentation or more context, visit the [official Angular Routing guide](https://angular.dev/guide/routing).

## HTTP & Data Fetching

When implementing HTTP and data fetching, consult the following references:

- **HTTP & Resource APIs**: `httpResource()`, `resource()`, `rxResource()`, HttpClient, and interceptors. Read [http.md](references/http.md)

## Styling and Animations

When implementing styling and animations in Angular, consult the following references:

- **Using Tailwind CSS with Angular**: Integrating Tailwind CSS into Angular projects. Read [tailwind-css.md](references/tailwind-css.md)
- **Angular Animations**: Using native CSS (recommended) or the legacy DSL for dynamic effects. Read [angular-animations.md](references/angular-animations.md)
  - If `ANGULAR_VERSION >= 20.2`: prefer `animate.enter` / `animate.leave`.
  - If `ANGULAR_VERSION < 20.2`: use CSS animations or `@angular/animations` DSL.
- **Styling components**: Best practices for component styles and encapsulation. Read [component-styling.md](references/component-styling.md)

## Testing

When writing or updating tests, consult the following references based on the task:

- **Fundamentals**: Best practices for unit testing, async patterns, and `TestBed`. Read [testing-fundamentals.md](references/testing-fundamentals.md)
  - If `ANGULAR_VERSION >= 20`: use Vitest with `@angular/build:unit-test`.
  - If `ANGULAR_VERSION < 20`: use Jasmine/Karma or manual Vitest configuration.
- **Component Harnesses**: Standard patterns for robust component interaction. Read [component-harnesses.md](references/component-harnesses.md)
- **Router Testing**: Using `RouterTestingHarness` for reliable navigation tests. Read [router-testing.md](references/router-testing.md)
- **End-to-End (E2E) Testing**: Best practices for E2E tests with Cypress. Read [e2e-testing.md](references/e2e-testing.md)

## Tooling

When working with Angular tooling, consult the following references:

- **Angular CLI**: Creating applications, generating code (components, routes, services), serving, and building. Read [cli.md](references/cli.md)
- **Angular MCP Server**: Available tools, configuration, and experimental features. Read [mcp.md](references/mcp.md)
