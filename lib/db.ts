import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export async function getUserById(userId: number) {
  const result = await sql`SELECT id, email, created_at FROM users WHERE id = ${userId}`;
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  const result = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`;
  return result[0] || null;
}

export async function createUser(email: string, passwordHash: string, name?: string) {
  const result = await sql`
    INSERT INTO users (email, password_hash, name) 
    VALUES (${email}, ${passwordHash}, ${name || null}) 
    RETURNING id, email, name, created_at
  `;
  return result[0];
}

export async function getUserTranscriptions(userId: number, limit = 50) {
  const result = await sql`
    SELECT id, content, duration_seconds, created_at 
    FROM transcriptions 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return result;
}

export async function createTranscription(userId: number, content: string, durationSeconds: number) {
  const result = await sql`
    INSERT INTO transcriptions (user_id, content, duration_seconds) 
    VALUES (${userId}, ${content}, ${durationSeconds}) 
    RETURNING id, content, created_at
  `;
  return result[0];
}

export async function deleteTranscription(userId: number, transcriptionId: number) {
  await sql`DELETE FROM transcriptions WHERE id = ${transcriptionId} AND user_id = ${userId}`;
}

export async function getDictionary(userId: number) {
  const result = await sql`
    SELECT id, word, custom_spelling 
    FROM dictionary 
    WHERE user_id = ${userId} 
    ORDER BY word ASC
  `;
  return result;
}

export async function addDictionaryWord(userId: number, word: string, customSpelling?: string) {
  const result = await sql`
    INSERT INTO dictionary (user_id, word, custom_spelling) 
    VALUES (${userId}, ${word}, ${customSpelling || null}) 
    ON CONFLICT (user_id, word) 
    DO UPDATE SET custom_spelling = ${customSpelling || null} 
    RETURNING id, word, custom_spelling
  `;
  return result[0];
}

export async function deleteDictionaryWord(userId: number, wordId: number) {
  await sql`DELETE FROM dictionary WHERE id = ${wordId} AND user_id = ${userId}`;
}
