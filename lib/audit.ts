import { query } from './db/client';

export async function logAudit(actor: string, entityType: string, entityId: string, action: string, reason?: string) {
  await query(
    `insert into audit_logs (actor, entity_type, entity_id, action, reason)
     values ($1,$2,$3,$4,$5)`,
    [actor, entityType, entityId, action, reason ?? null],
  );
}
