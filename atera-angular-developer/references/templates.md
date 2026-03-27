# Templates

Angular templates define the view for a component. Always use modern template syntax — built-in control flow, native bindings, signal queries, and `@let` for local derivation.

## Control Flow

Use the built-in control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives.

> **FORBIDDEN in new code.** `*ngIf`, `*ngFor`, `*ngSwitch` are legacy. Always use `@if`, `@for`, `@switch`.

```html
<!-- ❌ NEVER write this -->
<section *ngIf="isVisible">Content</section>
<section *ngFor="let item of items">{{ item }}</section>

<!-- ✅ ALWAYS write this -->
@if (isVisible) {
  <section>Content</section>
}
@for (item of items; track item.id) {
  <section>{{ item }}</section>
}
```

**Always include `track` in `@for` loops** for performance and correct change detection.

## Local Variables with `@let`

Use `@let` to derive and reuse local values in templates without moving logic to the class.

```html
<!-- Reusing signal results -->
@let user = user();
<h1>{{ user.name }}</h1>
<p>{{ user.email }}</p>

<!-- Form control subtrees -->
@let controls = form.controls;
<input [formControl]="controls.name" />

<!-- Async pipe results -->
@let user = user$ | async;
@if (user) {
  <app-user-card [user]="user" />
}
```

**Use `@let` for:**
- Reusing signal call results
- Accessing nested object properties
- Form control subtrees
- View-only derivation not worth a `computed()`

**Do not use `@let` for:** business logic, heavy computation, or complex transformations — move those to TypeScript.

## Class Bindings

> **FORBIDDEN in new code.** `[ngClass]` is legacy. Use native `[class.*]` bindings.

```html
<!-- ❌ NEVER write this -->
<div [ngClass]="{ 'active': isActive, 'disabled': isDisabled }"></div>

<!-- ✅ ALWAYS write this -->
<div [class.active]="isActive" [class.disabled]="isDisabled"></div>
<div [class]="{ active: isActive }"></div>
```

## Style Bindings

> **FORBIDDEN in new code.** `[ngStyle]` is legacy. Use native `[style.*]` bindings.

```html
<!-- ❌ NEVER write this -->
<div [ngStyle]="{ 'font-size': size + 'px' }"></div>

<!-- ✅ ALWAYS write this -->
<div [style.font-size.px]="size"></div>
<div [style.color]="color"></div>
```

## Form Control Access

Always access reactive form controls using `.controls` in templates for type safety.

```html
<!-- ✅ ALWAYS write this -->
<input [formControl]="form.controls.name" />
<input [formControl]="form.controls.items.controls[i].controls.model" />

<!-- ❌ NEVER write this -->
<input [formControl]="form.get('name')" />
```

> For signal-based and decorator-based query APIs (`viewChild`, `viewChildren`, `contentChild`, `contentChildren`), see [components.md](components.md).

## Version-Gated Features

### Spread Syntax in Templates (v21.1+)

Use spread syntax in templates only in Angular v21.1 and later.

```html
<!-- ✅ v21.1+ only -->
@let allUsers = [...admins(), ...users()];
@let config = { ...baseConfig, disabled: isSaving() };
```

### Arrow Functions in Template Expressions (v21.2+)

Use arrow functions in templates only in Angular v21.2 and later.

```html
<!-- ✅ v21.2+ only — small inline callbacks only -->
<app-grid [compareWith]="(a, b) => a.id === b.id" />
```

### `instanceof` in Template Expressions (v21.2+)

Use `instanceof` in templates only in Angular v21.2 and later.

```html
<!-- ✅ v21.2+ only — simple type narrowing only -->
@if (value instanceof Error) {
  <app-error [error]="value" />
}
```

## Images — `NgOptimizedImage`

Always use `NgOptimizedImage` instead of a plain `<img>` tag. It enforces performance best practices and prevents layout shifts.

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  ...
})
```

### Basic usage

Replace `src` with `ngSrc`. `width` and `height` are required (prevents CLS).

```html
<!-- ❌ NEVER write this -->
<img src="/hero.jpg" />

<!-- ✅ ALWAYS write this -->
<img ngSrc="/hero.jpg" width="800" height="600" alt="Hero" />
```

### LCP images — `priority`

Mark the Largest Contentful Paint image with `priority`. This sets `fetchpriority=high`, `loading=eager`, and adds a preload hint for SSR. Angular warns in dev if LCP images are missing this attribute.

```html
<img ngSrc="/hero.jpg" width="800" height="600" priority alt="Hero" />
```

### Fill mode

Use `fill` when the image should fill its container and you can't specify fixed dimensions. The parent must have `position: relative | fixed | absolute`.

```html
<div style="position: relative; width: 100%; height: 400px;">
  <img ngSrc="/banner.jpg" fill alt="Banner" style="object-fit: cover;" />
</div>
```

### Responsive images with `sizes`

Set `sizes` for responsive images — the directive generates an optimised `srcset` automatically.

```html
<img ngSrc="/photo.jpg" width="1200" height="800" sizes="100vw" alt="Photo" />
<!-- For partial-width images -->
<img ngSrc="/card.jpg" width="400" height="300" sizes="(max-width: 768px) 100vw, 50vw" alt="Card" />
```

### CDN loaders

Register a built-in loader (Cloudflare, Cloudinary, ImageKit, Imgix, Netlify) in `app.config.ts`:

```ts
import { provideCloudflareLoader } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCloudflareLoader('https://mysite.cloudflareimages.com'),
  ],
};
```

Custom loader via `IMAGE_LOADER` token:

```ts
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

{ provide: IMAGE_LOADER, useValue: (config: ImageLoaderConfig) =>
    `https://cdn.example.com/${config.src}?w=${config.width}` }
```

### Guidelines

- Always provide `alt` text.
- Always set `width` + `height` or use `fill` — never omit both.
- Mark the LCP image with `priority`.
- Use `sizes` for fluid/responsive images to enable automatic `srcset`.
- Avoid `<picture>` — not supported by `NgOptimizedImage`.

## General Principles

- Keep templates simple — move business logic to TypeScript.
- Prefer `@let` and template expressions for view-only derivation.
- Use `.controls` for reactive form access.
- Always use built-in control flow and native bindings.
- Never use `ngClass`, `ngStyle`, `*ngIf`, `*ngFor`, or decorator-based queries.
