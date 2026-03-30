import { Pool, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}
