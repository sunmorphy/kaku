import { db } from '../src/db/connection';
import { users } from '../src/db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword } from '../src/utils/password';

async function createUser(username: string, email: string, password: string, summary?: string, socials?: string[]) {
  try {
    // Check if user already exists
    const existingUser = await db.select({ id: users.id }).from(users)
      .where(or(eq(users.username, username), eq(users.email, email)));

    if (existingUser.length > 0) {
      console.error('Username or email already exists');
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await db.insert(users)
      .values({
        username,
        email,
        password_hash: passwordHash,
        summary: summary || null,
        socials: socials || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    console.log('User created successfully:', result[0]);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: ts-node scripts/create-user.ts <username> <email> <password> [summary] [socials...]');
    process.exit(1);
  }

  const [username, email, password, summary, ...socials] = args;
  createUser(username, email, password, summary, socials.length > 0 ? socials : undefined);
}