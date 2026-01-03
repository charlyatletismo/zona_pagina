import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { sign } from 'hono/jwt'
import { eq, or } from 'drizzle-orm';
import { users } from './db/schema'
import { M } from "./lib/messages";


const genCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const sendCodeViaWhatsappTemplate = async (env: Env, phone: string, code: string) => {
  const body = {
      "messaging_product": "whatsapp",
      "to": phone,
      "type": "template",
      "template": {
        "name": "verificar_otp",
        "language": {
          "code": "es"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                "text": code
              }
            ]
          },
          {
            "type": "button",
            "sub_type": "Url",
            "index": "0",
            "parameters": [
              {
                "type": "payload",
                "payload": code
              }
            ]
          }
        ]
      }
    }
    let response : any;
    await fetch(`https://graph.facebook.com/v21.0/${env.GRAPH_API_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GRAPH_API_TOKEN}`
      },
      body: JSON.stringify(body)
    }).then(async res => response = await res.json());
  return response;
}


export const authRoute = new Hono<{ Bindings: Env }>()
  .post("/sendCode", async (c) => {
    const { phone } = await c.req.json();
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
      return c.json({ message: "Temp code set for test user", tempCode });
    }
    const response = await sendCodeViaWhatsappTemplate(c.env, phone, tempCode);
    if (response.error) {
      console.error("response", JSON.stringify(response));
      return c.json({ message: M.AUTH_FAILED_SENDING_WHATSAPP }, 500);
    }
    return c.json({ message: M.AUTH_CODE_SENT });
  })
  .post("/login", async (c) => {
    const { phone, code } = await c.req.json();
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
        language: user.language
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
    return c.json({ token, id: user.id, name: user.name, role: user.role, requireProfileUpdate });
  })
  .post("/register", async (c) => {
    const { user_id, phone } = await c.req.json();
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
