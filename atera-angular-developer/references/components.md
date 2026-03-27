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

> For template syntax — control flow (`@if`, `@for`, `@switch`), `@let`, class/style bindings, and version-gated features — see [templates.md](templates.md).

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

## Decorator-based Queries — ⛔ LEGACY, DO NOT USE

> **FORBIDDEN in new code.** `@ViewChild`, `@ViewChildren`, `@ContentChild`, `@ContentChildren` decorators are legacy. Always use the signal-based query functions instead.

```ts
// ❌ NEVER write this in new code
@ViewChild('canvas') canvas!: ElementRef;
@ViewChildren('item') items!: QueryList<ElementRef>;
@ContentChild('label') label!: ElementRef;

// ✅ ALWAYS write this instead
canvas = viewChild.required<ElementRef>('canvas');
items = viewChildren<ElementRef>('item');
label = contentChild<ElementRef>('label');
projecteds = contentChildren<ElementRef>('projected');
```
