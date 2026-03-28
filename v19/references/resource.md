# Async Reactivity with Resource APIs

Signal-based APIs for reactive async data fetching. They expose loading/error state as synchronous signals with no manual subscription management.

> **`resource()` and `httpResource()` are currently experimental** — available to use but API may change.

## Choosing the Right Resource API

| Use case | API |
|----------|-----|
| Simple HTTP GET (with interceptors) | `httpResource()` |
| Any async task (fetch, Promise, worker) | `resource()` |
| RxJS Observable-based APIs | `rxResource()` |

For non-GET mutations or complex operators, use `HttpClient` directly — see [http.md](http.md).

---

## `httpResource()` — Signal-Based HTTP GET

Use when you need HttpClient interceptors and a simple GET. Always use the **function form** for the URL so the request is reactive.

```ts
import { httpResource } from '@angular/common/http';

// Simple reactive GET
userResource = httpResource<User>(() => `/api/users/${this.$userId()}`);

// With options
userResource = httpResource<User>(() => ({
  url: `/api/users/${this.$userId()}`,
  headers: { Authorization: `Bearer ${this.$token()}` },
  params: { include: 'profile' },
}));

// With default value (avoids undefined in template)
usersResource = httpResource<User[]>(() => '/api/users', { defaultValue: [] });

// Skip when not ready — return undefined to pause
userResource = httpResource<User>(() =>
  this.$userId() ? `/api/users/${this.$userId()}` : undefined
);
```

### Schema Validation

```ts
httpResource(() => `/api/users/${this.$id()}`, {
  parse: userSchema.parse, // e.g. Zod schema
});
```

---

## `resource()` — Generic Async Data

For non-HTTP async work or custom fetch logic. **Always pass `abortSignal` to `fetch` calls** — the resource will abort the previous request when `params` change.

```ts
import { resource } from '@angular/core';

searchResource = resource({
  params: () => ({ q: this.$query() }),
  loader: async ({ params, abortSignal }) => {
    const res = await fetch(`/api/search?q=${params.q}`, { signal: abortSignal });
    return res.json() as Promise<Result[]>;
  },
});

// With default value
todosResource = resource({
  defaultValue: [] as Todo[],
  params: () => ({ filter: this.$filter() }),
  loader: async ({ params }) =>
    (await fetch(`/api/todos?filter=${params.filter}`)).json(),
});

// Conditional: return undefined from params to skip
userResource = resource({
  params: () => (this.$userId() ? { id: this.$userId()! } : undefined),
  loader: async ({ params }) =>
    fetch(`/api/users/${params.id}`).then(r => r.json()),
});
```

---

## `rxResource()` — Observable-Based APIs

Use when your service returns `Observable<T>`. Lives in `@angular/core/rxjs-interop`.

```ts
import { rxResource } from '@angular/core/rxjs-interop';

photo = rxResource({
  params: this.$photoId,
  stream: (id) => this.photoService.getPhoto$(id).pipe(
    catchError(err => { console.error(err); return of(undefined); }),
  ),
});
```

---

## Resource State

All resource APIs expose the same state signals:

```ts
resource.value()      // Current value or undefined
resource.hasValue()   // Type-guard boolean — true if a value exists
resource.error()      // Error thrown by the loader, or undefined
resource.isLoading()  // boolean
resource.status()     // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'

resource.reload()     // Force re-run the loader without params changing
resource.set(value)   // Set a local value — changes status to 'local'
resource.update(fn)   // Update local value via function
```

---

## Loading States

Use `@switch` on `status()` for granular UI control:

```html
@switch (dataResource.status()) {
  @case ('idle')      { <p>Enter a search term</p> }
  @case ('loading')   { <app-spinner /> }
  @case ('reloading') {
    <app-data [data]="dataResource.value()!" />
    <app-spinner size="small" />
  }
  @case ('resolved')  { <app-data [data]="dataResource.value()!" /> }
  @case ('error')     {
    <app-error [error]="dataResource.error()" (retry)="dataResource.reload()" />
  }
}
```

---

## Error Handling

```html
@if (userResource.error(); as error) {
  <div class="error">
    <p>{{ getErrorMessage(error) }}</p>
    <button (click)="userResource.reload()">Retry</button>
  </div>
}
```

---

## Guidelines

- Prefer `httpResource()` for HTTP GETs when interceptors are needed.
- Prefer `resource()` for `fetch`, workers, or custom async logic.
- Prefer `rxResource()` when the API is already Observable-based.
- Do not mix `effect()`, subscriptions, or imperative patching with resource state — use `reload()`, `set()`, or `update()`.
- Return `undefined` from the `params` / URL function to skip a request when dependencies aren't ready.
