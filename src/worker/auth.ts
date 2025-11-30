import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { sign } from 'hono/jwt'
import { eq, or } from 'drizzle-orm';
import { users } from './db/schema'


export const authRoute = new Hono<{ Bindings: Env }>()
  .post("/sendCode", async (c) => {
    const { phone } = await c.req.json();
    if (!phone) {
      return c.json({ error: "phone is required" }, 400);
    }
    const db = drizzle(c.env.DB);
    // check if phone already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.phone, phone));
    if (existingUser.length === 0) {
      // user does not exist
      return c.json({ error: "User does not exist" }, 400);
    }
    // create temp 6-digit code
    const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.update(users)
      .set({ temp_code: tempCode })
      .where(eq(users.id, existingUser[0].id))
      .run();
    // In real app, send code via SMS
    console.log(`Temp code for ${phone}: ${tempCode}`);
    return c.json({ message: "Temp code sent. Check your Whatsapp" });
  })
  .post("/login", async (c) => {
    const { phone, code } = await c.req.json();
    if (!phone || !code) {
      return c.json({ error: "phone and code are required" }, 400);
    }
    const db = drizzle(c.env.DB);
    // check if phone already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.phone, phone));
    if (existingUser.length === 0) {
      // user already exists
      return c.json({ error: "User does not exist" }, 400);
    }
    // check code
    const user = existingUser[0];
    if (user.temp_code !== code) {
      return c.json({ error: "Invalid code" }, 400);
    }
    await db.update(users)
      .set({ temp_code: null })
      .where(eq(users.id, user.id))
      .run();
    // create JWT token
    const token = await sign({
        id: user.id,
        phone: user.phone,
        roles: user.roles,
        name: user.name,
      },
      c.env.JWT_SECRET, "HS256"
    );
    return c.json({ token, id: user.id, name: user.name, roles: user.roles });
  })
  .post("/register", async (c) => {
    const { user_id, phone } = await c.req.json();
    if (!phone) {
      return c.json({ error: "phone is required" }, 400);
    }
    if (!user_id) {
      return c.json({ error: "user_id is required" }, 400);
    }
    const db = drizzle(c.env.DB);
    // check if phone already exists
    const existingUser = await db.select()
      .from(users)
      .where(or(eq(users.phone, phone), eq(users.id, user_id)));
    if (existingUser.length > 0) {
      // user already exists
      return c.json({ error: "User already exists" }, 400);
    }
    // create user with temp 6-digit code
    const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.insert(users).values({
      id: user_id,
      phone,
      temp_code: tempCode,
      roles: 'runner',
    }).run();
    // In real app, send code via SMS
    console.log(`Temp code for ${phone}: ${tempCode}`);
    return c.json({ message: "User register began. Check your Whatsapp" });
  });

