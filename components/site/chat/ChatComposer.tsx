'use client'

import { Button } from '@/components/ui/Button'

export function ChatComposer({
  inputId,
  value,
  onChange,
  onSend,
  sending,
  onOpenLead,
  showLeadPrompt,
}: {
  inputId: string
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  sending: boolean
  onOpenLead: () => void
  showLeadPrompt: boolean
}) {
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSend(value)
        }}
        className="flex items-end gap-2 border-t border-border p-3 pb-2"
      >
        <label htmlFor={inputId} className="sr-only">
          پیامت را بنویس
        </label>
        <textarea
          id={inputId}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter breaks the line — the convention every
            // chat uses, and the reason this is a textarea rather than an input.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend(value)
            }
          }}
          placeholder="سؤالت را بنویس…"
          className="max-h-28 min-h-11 flex-1 resize-none rounded-md border border-border bg-bg px-3 py-2.5 text-300 text-text placeholder:text-text-subtle focus:border-focus"
        />
        <Button
          type="submit"
          loading={sending}
          disabled={!value.trim()}
          className="h-11 shrink-0 px-4"
        >
          ارسال
        </Button>
      </form>

      {showLeadPrompt && (
        <div className="px-3 pb-3">
          <Button variant="outline" size="sm" onClick={onOpenLead} className="w-full">
            ثبت درخواست مشاوره
          </Button>
        </div>
      )}
    </>
  )
}
