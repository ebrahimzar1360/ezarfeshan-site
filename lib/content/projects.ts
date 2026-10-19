import { getSection } from '@/lib/cms/content'
import type { ImageValue } from '@/lib/cms/fields'
import { projectPhoto } from './photos'

/**
 * The products on /projects and the homepage preview.
 *
 * Copy is the owner's, verbatim (brief of 1405/07/24). All three are "در حال
 * توسعه": nothing here claims a launch, a client or a result.
 *
 * A project carries either `image` (a real picture from the owner, in
 * public/projects/) or `mock`, which selects the placeholder illustration in
 * components/site/ProjectMock.tsx. The mocks are drawn UI sketches, not
 * screenshots — replace each with a real screenshot when one exists (tracked in
 * docs/OPEN-QUESTIONS.md). Until then a project with a picture in the image
 * pack (lib/content/photos.ts) shows that, marked `illustrative`.
 */
export type ProjectImage = {
  readonly src: string
  readonly width: number
  readonly height: number
  readonly alt: string
  /** cover fills the frame; contain keeps a portrait device whole on white */
  readonly fit: 'cover' | 'contain'
  /** frame colour for `contain`, sampled from the picture's own edge */
  readonly bg?: string
  /** a conceptual picture, not the product: the label that says so on it */
  readonly illustrative?: string
}

export type Project = {
  readonly slug: string
  readonly title: string
  readonly text: string
  readonly status: string
  readonly mock?: 'performance' | 'tama' | 'intelligence'
  readonly image?: ProjectImage
  readonly link?: { readonly label: string; readonly href: string }
}

/**
 * Projects now live in the CMS (section `projects.items`, defaults in
 * lib/cms/registry.ts). This maps them onto the shape the cards and mocks
 * already draw, and drops hidden ones.
 */
export async function getProjects(): Promise<Project[]> {
  const { items, illustrativeNote } = await getSection('projects.items')
  return items
    .filter((p) => !p.hidden)
    .map((p) => {
      const image = p.image as ImageValue
      const hasImage = Boolean(image.src && image.width && image.height)
      const photo = hasImage ? null : projectPhoto(p.slug)
      return {
        slug: p.slug,
        title: p.title,
        text: p.text,
        status: p.status,
        mock: p.mock as Project['mock'],
        link: p.link.label && p.link.href ? p.link : undefined,
        image: hasImage
          ? {
              src: image.src,
              alt: image.alt,
              width: image.width!,
              height: image.height!,
              fit: p.fit === 'contain' ? 'contain' : 'cover',
              // near-white frame for a portrait device shown whole
              bg: p.fit === 'contain' ? 'rgb(250 248 246)' : undefined,
            }
          : photo
            ? { ...photo, fit: 'cover', illustrative: illustrativeNote || undefined }
            : undefined,
      }
    })
}
