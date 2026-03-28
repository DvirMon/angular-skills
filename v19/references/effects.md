# Side Effects with `effect` and `afterRenderEffect`

In Angular, an **effect** is an operation that runs whenever one or more signal values it tracks change.

## When to use `effect`

Effects are intended for syncing signal state to imperative, non-signal APIs.

**Valid Use Cases:**

- Logging analytics.
- Syncing state to `localStorage` or `sessionStorage`.
- Performing custom rendering to a `<canvas>` or 3rd-party charting library.

**CRITICAL RULE: DO NOT use effects to propagate state.**
If you find yourself using `.set()` or `.update()` on a signal _inside_ an effect to keep two signals in sync, you are making a mistake. This causes `ExpressionChangedAfterItHasBeenChecked` errors and infinite loops. **Always use `computed()` or `linkedSignal()` for state derivation.**

## View Effects vs Root Effects

Angular distinguishes two effect categories based on **where the effect is instantiated**:

| Category | Created in | Executes |
|---|---|---|
| **View Effect** | Component, directive, pipe, or service tied to a component injector | **Before** its owning component's change detection |
| **Root Effect** | Root-provided service (`providedIn: 'root'`) | **Before all components** are checked during change detection |

In both cases, if a signal dependency changes *during* the effect's execution, the effect re-runs before change detection continues.

> <!-- TODO: deeper research needed — verify exact scheduling guarantees per context type, and whether view effects observe partial vs full view tree updates. See: https://angular.dev/guide/signals/effect -->

```ts
// View Effect — scoped to the component lifetime
@Component({...})
export class MyComponent {
  count = signal(0);
  constructor() {
    effect(() => console.log(this.count())); // runs before this component's CD
  }
}

// Root Effect — lives for the app lifetime
@Injectable({ providedIn: 'root' })
export class MyService {
  count = signal(0);
  constructor() {
    effect(() => console.log(this.count())); // runs before all components' CD
  }
}
```

## Basic Usage

Effects execute asynchronously during the change detection process. They always run at least once.

```ts
import { Component, signal, effect } from '@angular/core';

@Component({...})
export class Example {
  count = signal(0);

  constructor() {
    // Effect must be created in an injection context (e.g., a constructor)
    effect((onCleanup) => {
      console.log(`Count changed to ${this.count()}`);

      const timer = setTimeout(() => console.log('Timer finished'), 1000);

      // Cleanup function runs before the next execution, or when destroyed
      onCleanup(() => clearTimeout(timer));
    });
  }
}
```

## DOM Manipulation with `afterRenderEffect`

Standard `effect` runs _before_ Angular updates the DOM. If you need to manually inspect or modify the DOM based on a signal change (e.g., integrating a 3rd party UI library), use `afterRenderEffect`.

`afterRenderEffect` runs after Angular has finished rendering the DOM.

### Render Phases

To prevent reflows (forced layout thrashing), `afterRenderEffect` forces you to divide your DOM reads and writes into specific phases.

```ts
import { Component, afterRenderEffect, viewChild, ElementRef } from '@angular/core';

@Component({...})
export class Chart {
  canvas = viewChild.required<ElementRef>('canvas');

  constructor() {
    afterRenderEffect({
      // 1. Read from the DOM
      earlyRead: () => {
        return this.canvas().nativeElement.getBoundingClientRect().width;
      },
      // 2. Write to the DOM (receives the result of the previous phase)
      write: (width) => {
        // NEVER read from the DOM in the write phase.
        setupChart(this.canvas().nativeElement, width);
      }
    });
  }
}
```

**Available Phases (executed in this order):**

1. `earlyRead`
2. `write` (Never read here)
3. `mixedReadWrite` (Avoid if possible)
4. `read` (Never write here)

### Server-Side Rendering (SSR) Caveats

| API | Runs on Server | Runs on Client |
|---|---|---|
| `effect()` | ✅ Yes | ✅ Yes |
| `afterRenderEffect()` | ❌ No | ✅ Yes |
| `afterNextRender` / `afterEveryRender` | ❌ No | ✅ Yes |

`afterRenderEffect` **never runs during SSR** — it is browser-only, identical to `afterNextRender`/`afterEveryRender` in this regard. Additionally, when a callback does run on the client, components are **not guaranteed to be fully hydrated** before execution. Exercise caution when reading from or writing to the DOM or layout inside these callbacks.

Use plain `effect()` for state/data side effects that must work in both environments. Reserve `afterRenderEffect` exclusively for DOM-dependent work.

> <!-- TODO: deeper research needed — confirm whether `effect()` has any behavioral differences on the server (e.g., scheduling, timing relative to SSR render pipeline). See: https://angular.dev/guide/signals/effect#server-side-rendering-caveats -->

## Effect Cleanup — Use `onCleanup` Callback

When an effect creates a resource (timer, listener, etc.), clean it up with the `onCleanup` callback. Do not reach for `ngOnDestroy`.

```ts
constructor() {
  effect((onCleanup) => {
    const timer = setInterval(() => this.tick(), 1000);
    onCleanup(() => clearInterval(timer));
  });
}
```

> **For all `ngOnDestroy` replacement patterns** (`DestroyRef`, `takeUntilDestroyed`, subscription cleanup), see the canonical reference: [lifecycle.md](lifecycle.md).
