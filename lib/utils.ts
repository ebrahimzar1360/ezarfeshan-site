/**
 * Class-name helpers.
 *
 * `clsx` and `tailwind-merge` were both rejected, and the reason for the second
 * one is technical rather than a matter of taste: tailwind-merge carries a table
 * of Tailwind class groups so it can tell which utilities conflict, and that
 * table does not know this project's `@theme` tokens — `text-200…text-1000`,
 * `bg-bg-raised`, `max-w-(--container-page)`. On exactly the classes that matter
 * here it would either mis-merge or silently do nothing. The problem it exists
 * to solve — "a consumer passes a className that must beat the component's own
 * default" — does not arise when every call site is ours.
 *
 * `cn` keeps clsx's signature on purpose, so component source copied from a
 * shadcn registry compiles without editing the import.
 */

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: unknown }

export function cn(...parts: ClassValue[]): string {
  const out: string[] = []

  for (const part of parts) {
    if (!part) continue

    if (typeof part === 'string' || typeof part === 'number') {
      out.push(String(part))
    } else if (Array.isArray(part)) {
      const nested = cn(...part)
      if (nested) out.push(nested)
    } else {
      for (const key in part) {
        if (part[key]) out.push(key)
      }
    }
  }

  return out.join(' ')
}

/**
 * The `cva` API, minus the parts that signal a component is too complex to adopt.
 *
 * `class-variance-authority` is only 1.3 kB, but this is the whole of it that
 * imported components actually use, and a dependency for twenty lines is a
 * dependency to keep current forever. `const x = cva(...)` becomes
 * `const x = variants(...)` — a one-word edit during a port.
 *
 * `compoundVariants` is deliberately absent. A component that needs a class to
 * depend on two axes at once is one to rewrite rather than port.
 */
type VariantShape = Record<string, Record<string, string>>

type VariantProps<V extends VariantShape> = {
  [K in keyof V]?: keyof V[K]
}

export function variants<V extends VariantShape>(config: {
  base?: string
  variants: V
  defaultVariants?: VariantProps<V>
}) {
  const { base = '', variants: axes, defaultVariants = {} as VariantProps<V> } = config

  return (props: VariantProps<V> & { className?: ClassValue } = {}) => {
    const picked: string[] = [base]

    for (const axis in axes) {
      const choices = axes[axis]
      const choice = (props[axis] ?? defaultVariants[axis]) as string | undefined
      if (choices === undefined || choice === undefined) continue
      const value = choices[choice]
      if (value) picked.push(value)
    }

    return cn(picked, props.className)
  }
}
