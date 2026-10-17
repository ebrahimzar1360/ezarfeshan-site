/**
 * Field types for editable site copy.
 *
 * A section of the site (the hero, the footer, the about page's timeline…) is
 * described once as a list of fields. The same description generates the admin
 * form, validates what the form sends, and fills gaps when the stored value is
 * older than the code — so a field added in a release shows its default until
 * someone edits it, instead of rendering `undefined`.
 *
 * Plain data only: the definitions cross from server to the client editor as
 * props, so no functions live here.
 */

export type Option = { readonly value: string; readonly label: string }

type Base = {
  readonly name: string
  readonly label: string
  readonly hint?: string
}

export type TextField = Base & {
  readonly type: 'text'
  readonly max?: number
  readonly required?: boolean
  /** Latin values (slugs, handles, addresses) are typed left to right. */
  readonly ltr?: boolean
}
export type TextareaField = Base & {
  readonly type: 'textarea'
  readonly max?: number
  readonly rows?: number
  readonly required?: boolean
}
/** A destination: an internal path, #anchor, http(s), mailto: or tel:. */
export type UrlField = Base & { readonly type: 'url'; readonly required?: boolean }
/** A button or link: its visible label and where it goes. Empty label hides it. */
export type LinkField = Base & { readonly type: 'link'; readonly optional?: boolean }
/** An image from the media library (or a file under /public) with its alt text. */
export type ImageField = Base & { readonly type: 'image' }
export type SelectField = Base & { readonly type: 'select'; readonly options: readonly Option[] }
export type NumberField = Base & {
  readonly type: 'number'
  readonly min?: number
  readonly max?: number
}
export type BooleanField = Base & { readonly type: 'boolean' }

export type ScalarField =
  | TextField
  | TextareaField
  | UrlField
  | LinkField
  | ImageField
  | SelectField
  | NumberField
  | BooleanField

export type ListField = Base & {
  readonly type: 'list'
  /** What one item is called in the editor: «کارت»، «پیوند»… */
  readonly itemLabel: string
  readonly fields: readonly ScalarField[]
  readonly max?: number
}

export type Field = ScalarField | ListField

export type LinkValue = { label: string; href: string }
export type ImageValue = { src: string; alt: string; width?: number; height?: number }

export type Values = Record<string, unknown>

export const DEFAULT_MAX_TEXT = 300
export const DEFAULT_MAX_TEXTAREA = 2000
