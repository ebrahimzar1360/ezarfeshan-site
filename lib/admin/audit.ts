import { db } from '@/lib/db'
import type { AdminUser } from '@/lib/auth'

/**
 * Append one line to the audit log. Never throws: a failed log write must not
 * turn a successful save into an error the editor sees.
 */
export async function audit(
  user: AdminUser | null,
  action: string,
  entity: string,
  entityId?: string | null,
  summary?: string
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: user?.id ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        summary: summary?.slice(0, 300) ?? null,
      },
    })
  } catch (cause) {
    console.error('[audit]', cause)
  }
}
