import { Hono } from "hono";
import { Env, Variables } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { sign } from 'hono/jwt';
import { eq, or } from 'drizzle-orm';
import { users } from './db/schema';
import { M } from "./lib/messages";
import { sendCodeViaWhatsappTemplate } from "./lib/whatsapp";


const genCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export const authRoute = new Hono<{ Bindings: Env, Variables: Variables }>()
  .post("/sendCode", async (c) => {
    const { phone }: { phone: string } = await c.req.json();
    if (!phone) {
      return c.json({ message: M.AUTH_PHONE_REQUIRED }, 400);
    }
    const db = drizzle(c.env.DB);
    // check if phone already exists
    const user = await db.select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1)
      .get();
    if (!user) {
      // user does not exist
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    // create temp 6-digit code
    const tempCode = genCode();
    await db.update(users)
      .set({ temp_code: tempCode })
      .where(eq(users.id, user.id))
      .run();

    // FIXME: Remove skip sending Whatsapp message for test users
    if ([
        "42556386",
        "34525736",
        "00000001",
        "00000002",
        "00000003",
        "00000004"].includes(user.id)) {
      console.log("Test user - skipping Whatsapp message sending");
      return c.json({
        message: {
          "en": "Temp code set for test user",
          "es": "Código temporal establecido para usuario de prueba"
        },
        data: { tempCode }
      });
    }
    const response = await sendCodeViaWhatsappTemplate(c.env, phone, tempCode);
    if (response.error) {
      console.error("response", JSON.stringify(response));
      return c.json({ message: M.AUTH_FAILED_SENDING_WHATSAPP }, 500);
    }
    return c.json({ message: M.AUTH_CODE_SENT });
  })
  .post("/login", async (c) => {
    const { phone, code }: { phone: string, code: string } = await c.req.json();
    if (!phone || !code) {
      return c.json({ message: M.AUTH_PHONE_REQUIRED }, 400);
    }
    const db = drizzle(c.env.DB);
    // check if phone already exists
    const user = await db.select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1)
      .get();
    if (!user) {
      // user does not exist
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    // check code
    if (user.temp_code !== code) {
      return c.json({ message: M.AUTH_INVALID_CODE }, 400);
    }
    await db.update(users)
      .set({ temp_code: null })
      .where(eq(users.id, user.id))
      .run();
    // create JWT token
    const token = await sign({
        id: user.id,
        phone: user.phone,
        role: user.role,
        name: user.name,
        surname: user.surname,
        manager_id: user.manager_id
      },
      c.env.JWT_SECRET, "HS256"
    );
    const requireProfileUpdate = (
      !user.name
      || !user.surname
      || !user.phone
      || !user.email
      || !user.emergency_contact_name
      || !user.emergency_contact_phone
      || !user.sex
      || !user.date_of_birth
      || !user.clothing_shirt_size
      || (!user.location && !user.location_temp)
      || !user.location_address
    )
    return c.json({
      data: {
        token,
        id: user.id,
        name: user.name,
        role: user.role,
        requireProfileUpdate,
        language: user.language
      }
    });
  })
  .post("/register", async (c) => {
    const { user_id, phone }: { user_id: string, phone: string } = await c.req.json();
    if (!phone) {
      return c.json({ message: M.AUTH_PHONE_REQUIRED }, 400);
    }
    if (!user_id) {
      return c.json({ message: M.AUTH_USER_ID_REQUIRED }, 400);
    }
    const db = drizzle(c.env.DB);
    // check if phone already exists
    const user = await db.select({id: users.id})
      .from(users)
      .where(or(eq(users.phone, phone), eq(users.id, user_id)))
      .limit(1)
      .get();
    if (user) {
      // user already exists
      return c.json({ message: M.USER_ALREADY_EXISTS }, 400);
    }
    // create user with temp 6-digit code
    const tempCode = genCode();
    await db.insert(users).values({
      id: user_id,
      phone,
      temp_code: tempCode,
      role: 'athlete',
    }).run();
    const response = await sendCodeViaWhatsappTemplate(c.env, phone, tempCode);
    if (response.error) {
      console.error("response", JSON.stringify(response));
      return c.json({ message: M.AUTH_FAILED_SENDING_WHATSAPP }, 500);
    }
    return c.json({ message: M.AUTH_CODE_SENT });
  });
