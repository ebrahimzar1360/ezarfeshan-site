/**
 * Strips markdown out of a model reply.
 *
 * The chat bubble renders text, not markdown — so `**تأکید**` arrives on screen
 * with the asterisks showing. Rule ۸ of the system prompt already forbids
 * formatting, and the model obeys it most of the time, which is exactly the
 * problem: a rule followed ninety percent of the time fails in front of a
 * visitor and nowhere in testing. Observed twice in the audit — once on a
 * Persian answer, once on an English one.
 *
 * So the prompt asks and this enforces. List markers become a real bullet
 * rather than being deleted, because the model reaches for a list when the
 * content genuinely is a list, and stripping "- " outright runs the items
 * together into one paragraph.
 */
export function toPlainText(reply: string): string {
  return (
    reply
      // Fenced code blocks keep their contents, lose their fence.
      .replace(/```[a-z]*\n?([\s\S]*?)```/gi, '$1')
      .replace(/`([^`\n]+)`/g, '$1')
      // Headings: drop the hashes, keep the words.
      .replace(/^#{1,6}[ \t]+/gm, '')
      // Bold/italic. Inner text kept; the delimiters are what leaks.
      .replace(/\*\*\*([^*\n]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*\n]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      // Underscore emphasis only when it wraps a word — bare underscores
      // inside slugs and identifiers (article_slug) must survive.
      .replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,،؛!?])/g, '$1$2')
      // Links: keep the label and the URL, drop the bracket syntax.
      .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, '$1 ($2)')
      // Unordered list markers → a bullet that reads correctly in RTL.
      .replace(/^[ \t]*[-*+][ \t]+/gm, '• ')
      // Blockquote markers and horizontal rules.
      .replace(/^[ \t]*>[ \t]?/gm, '')
      .replace(/^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$/gm, '')
      // Collapse the blank-line runs the above can leave behind.
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}
