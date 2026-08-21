import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'solid' | 'outline' | 'text'
type Size = 'sm' | 'md' | 'lg'

/**
 * Radius caps at --radius-lg on purpose: pill buttons are on the banned list
 * in the brief. Gold is never a text colour on light ground (2.10:1), so the
 * solid variant puts gold behind ink instead of in front of paper.
 */
const variants: Record<Variant, string> = {
  solid: 'bg-solid-bg text-solid-text hover:bg-solid-bg-hover',
  outline: 'border border-border-strong text-text hover:border-accent hover:bg-accent/8',
  text: 'text-link underline underline-offset-4 hover:text-link-hover',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-200',
  md: 'h-11 px-5 text-300',
  lg: 'h-13 px-7 text-500',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-[background-color,border-color,color] duration-150 ease-brand ' +
  'disabled:opacity-50 disabled:pointer-events-none'

function classesFor(variant: Variant, size: Size, className: string) {
  // the text variant is a link, not a control: no fixed height or padding
  const sizing = variant === 'text' ? 'text-300' : sizes[size]
  return `${base} ${variants[variant]} ${sizing} ${className}`
}

type ButtonAsLink = {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>

type ButtonAsButton = {
  href?: undefined
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
} & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = 'solid', size = 'md', className = '', children } = props

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props
    const external = /^https?:\/\//.test(href)
    return (
      <Link
        href={href}
        className={classesFor(variant, size, className)}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </Link>
    )
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props
  return (
    <button className={classesFor(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}
