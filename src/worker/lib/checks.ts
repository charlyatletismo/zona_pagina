import { drizzle } from 'drizzle-orm/d1';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';


export const userIsBanned = async (db: ReturnType<typeof drizzle>, userId: string) => {
  const user = await db
    .select({ banned: users.banned })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  return user?.banned === 1;
}
