# Reactive Forms

Reactive forms provide a model-driven approach to handling form inputs. They are built around observable streams and provide synchronous access to the data model, making them more scalable and testable than template-driven forms.

## Core Classes

Reactive forms are built using these fundamental classes from `@angular/forms`:

- `FormControl`: Manages the value and validity of an individual input.
- `FormGroup`: Manages a group of controls (an object-like structure).
- `FormArray`: Manages a numerically indexed array of controls.
- `FormBuilder`: A service that provides factory methods for creating control instances.

## Setup

Import `ReactiveFormsModule` into your component.

```ts
import {Component, inject} from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-editor.component.html',
})
export class ProfileEditor {
  private fb = inject(FormBuilder);

  // Using FormBuilder for concise definition
  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
    }),
    aliases: this.fb.array([this.fb.control('')]),
  });

  onSubmit() {
    console.warn(this.profileForm.value);
  }
}
```

## Template Binding

Use directives to bind the model to the view:

- `[formGroup]`: Binds a `FormGroup` to a `<form>` or `<div>`.
- `formControlName`: Binds a named control within a group to an input.
- `formGroupName`: Binds a nested `FormGroup`.
- `formArrayName`: Binds a nested `FormArray`.
- `[formControl]`: Binds a standalone `FormControl`.

```html
<form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="firstName" />

  <div formGroupName="address">
    <input type="text" formControlName="street" />
  </div>

  <div formArrayName="aliases">
    @for (alias of aliases.controls; track $index) {
    <input type="text" [formControlName]="$index" />
    }
  </div>

  <button type="submit" [disabled]="!profileForm.valid">Submit</button>
</form>
```

## Accessing Controls

Use getters for easy access to controls, especially for `FormArray`.

```ts
get aliases() {
  return this.profileForm.get('aliases') as FormArray;
}

addAlias() {
  this.aliases.push(this.fb.control(''));
}
```

## Updating Values

- `patchValue()`: Updates only the specified properties. Fails silently on structural mismatches.
- `setValue()`: Replaces the entire model. Strictly enforces the form structure.

```ts
updateProfile() {
  this.profileForm.patchValue({
    firstName: 'Nancy',
    address: { street: '123 Drew Street' }
  });
}
```

## Reactive State

### Observable approach

```ts
import { ValueChangeEvent, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';

// valueChanges — emits every time the control value changes
this.profileForm.controls.firstName.valueChanges.subscribe(value => {
  console.log('firstName changed:', value);
});

// statusChanges — emits 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
this.profileForm.statusChanges.subscribe(status => {
  console.log('Form status:', status);
});

// events (v18+) — single stream for all change types on a control or group
this.profileForm.events.subscribe(event => {
  if (event instanceof ValueChangeEvent) console.log('value:', event.value);
  if (event instanceof StatusChangeEvent) console.log('status:', event.status);
  if (event instanceof TouchedChangeEvent) console.log('touched:', event.touched);
});
```

### Recommended: signal-based approach via `toSignal()`

Wrap the observables with `toSignal()` to consume form state as signals — no subscriptions, no manual cleanup, works natively with `computed()` and templates.

```ts
import { toSignal } from '@angular/core/rxjs-interop';
import { ValueChangeEvent, StatusChangeEvent } from '@angular/forms';

// Value as a signal — always reflects the current control value
$firstName = toSignal(this.form.controls.firstName.valueChanges, {
  initialValue: this.form.controls.firstName.value,
});

// Status as a signal
$formStatus = toSignal(this.form.statusChanges, {
  initialValue: this.form.status,
});

// Derived signal — computed from form state
$isValid = computed(() => this.$formStatus() === 'VALID');

// From the unified events stream — filter to a specific event type
$lastValue = toSignal(
  this.form.events.pipe(
    filter((e): e is ValueChangeEvent<typeof this.form.value> => e instanceof ValueChangeEvent),
    map(e => e.value),
  ),
  { initialValue: this.form.value },
);
```

> Always provide `initialValue` to `toSignal()` for form observables — they are synchronous sources and the initial value is always available from `.value` / `.status`.

## Manual State Management

- `markAsTouched()` / `markAllAsTouched()`: Useful for showing validation errors on submit.
- `markAsDirty()` / `markAsPristine()`: Tracks if the value has been modified.
- `updateValueAndValidity()`: Manually triggers recalculation of value and status.
- Options `{ emitEvent: false }` or `{ onlySelf: true }` can be passed to most methods to control propagation.
