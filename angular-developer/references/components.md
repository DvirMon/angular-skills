# Components

Angular components are the fundamental building blocks of an application. Each component consists of a TypeScript class with behaviors, an HTML template, and a CSS selector.

## Component Definition

Use the `@Component` decorator to define a component's metadata.

```ts
@Component({
  selector: 'app-profile',
  template: `
    <img src="profile.jpg" alt="Profile photo" />
    <button (click)="save()">Save</button>
  `,
  styles: `
    img {
      border-radius: 50%;
    }
  `,
})
export class Profile {
  save() {
    /* ... */
  }
}
```

## Metadata Options

- `selector`: The CSS selector that identifies this component in templates.
- `template`: Inline HTML template (preferred for small templates).
- `templateUrl`: Path to an external HTML file.
- `styles`: Inline CSS styles.
- `styleUrl` / `styleUrls`: Path(s) to external CSS file(s).
- `imports`: Lists the components, directives, or pipes used in this component's template.

## Using Components

To use a component, add it to the `imports` array of the consuming component and use its selector in the template.

```ts
@Component({
  selector: 'app-root',
  imports: [Profile],
  template: `<app-profile />`,
})
export class App {}
```

## Template Control Flow

Angular uses built-in blocks for conditional rendering and loops.

### Conditional Rendering (`@if`)

Use `@if` to conditionally show content. You can include `@else if` and `@else` blocks.

```html
@if (user.isAdmin) {
<admin-dashboard />
} @else if (user.isModerator) {
<mod-dashboard />
} @else {
<standard-dashboard />
}
```

**Result aliasing**: Save the result of the expression for reuse.

```html
@if (user.settings(); as settings) {
<p>Theme: {{ settings.theme }}</p>
}
```

### Loops (`@for`)

The `@for` block iterates over collections. The `track` expression is **required** for performance and DOM reuse.

```html
<ul>
  @for (item of items(); track item.id; let i = $index, total = $count) {
  <li>{{ i + 1 }}/{{ total }}: {{ item.name }}</li>
  } @empty {
  <li>No items to display.</li>
  }
</ul>
```

**Implicit Variables**: `$index`, `$count`, `$first`, `$last`, `$even`, `$odd`.

### Switching Content (`@switch`)

The `@switch` block renders content based on a value. It uses strict equality (`===`) and has **no fallthrough**.

```html
@switch (status()) { @case ('loading') { <app-spinner /> } @case ('error') { <app-error-msg /> }
@case ('success') { <app-data-grid /> } @default {
<p>Unknown status</p>
} }
```

**Exhaustive Type Checking**: Use `@default never;` to ensure all cases of a union type are handled.

```html
@switch (state) { @case ('on') { ... } @case ('off') { ... } @default never; // Errors if a new
state like 'standby' is added }
```

## Structural Directives (`*ngIf`, `*ngFor`, `*ngSwitch`) — ⛔ LEGACY, DO NOT USE

> **FORBIDDEN in new code.** `*ngIf`, `*ngFor`, and `*ngSwitch` are legacy structural directives. Always use the built-in `@if`, `@for`, and `@switch` blocks instead.

```html
<!-- ❌ NEVER write this in new code -->
<div *ngIf="isAdmin">Admin panel</div>
<li *ngFor="let item of items">{{ item.name }}</li>
<div [ngSwitch]="status">
  <span *ngSwitchCase="'active'">Active</span>
  <span *ngSwitchDefault>Inactive</span>
</div>

<!-- ✅ ALWAYS write this instead -->
@if (isAdmin) { <div>Admin panel</div> }
<ul>@for (item of items; track item.id) { <li>{{ item.name }}</li> }</ul>
@switch (status) { @case ('active') { <span>Active</span> } @default { <span>Inactive</span> } }
```

## `NgModule` — ⛔ LEGACY, DO NOT USE

> **FORBIDDEN in new code.** `NgModule` is legacy API. All components are standalone by default since v19. Never declare components inside an `NgModule`.

```ts
// ❌ NEVER write this in new code
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}

// ✅ ALWAYS write this instead
@Component({
  selector: 'app-root',
  imports: [OtherComponent],
  template: `...`,
})
export class AppComponent {}
```

## Core Concepts

- **Host Element**: The DOM element that matches the component's selector.
- **View**: The DOM rendered by the component's template inside the host element.
- **Standalone**: All components are standalone by default (v19+). Do not set `standalone: true` explicitly — it is the default. **Never create `NgModule`-based components** in new code. If you encounter an `NgModule`-based component in an existing file, suggest migrating to standalone as a separate follow-up change.
- **Component Tree**: Angular applications are structured as a tree of components, where each component can host child components.
- **Component Naming**: Do not add suffixes the `Component` suffix for Component classes (e.g., AppComponent) unless the project has been configured to use that naming configuration.

## Decorator-based Queries (`@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren`) — ⛔ LEGACY, DO NOT USE

> **FORBIDDEN in new code.** Decorator-based query APIs are legacy. Always use the signal-based `viewChild()`, `viewChildren()`, `contentChild()`, and `contentChildren()` functions instead.

```ts
// ❌ NEVER write this in new code
import { Component, ViewChild, ViewChildren, ContentChild, ElementRef, QueryList } from '@angular/core';

@Component({...})
export class Legacy {
  @ViewChild('canvas') canvas!: ElementRef;
  @ViewChildren('item') items!: QueryList<ElementRef>;
  @ContentChild('label') label!: ElementRef;
}

// ✅ ALWAYS write this instead
import { Component, viewChild, viewChildren, contentChild, ElementRef } from '@angular/core';

@Component({...})
export class Modern {
  canvas = viewChild.required<ElementRef>('canvas');
  items = viewChildren<ElementRef>('item');
  label = contentChild<ElementRef>('label');
}
```
