import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { sign } from 'hono/jwt'
import { eq, or } from 'drizzle-orm';
import { users } from './db/schema'


const genCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// NOTE: Unused because whatsapp requires the user to have messaged the business first
//   within the last X hours. Using template messages instead.
// const sendCodeViaWhatsappService = async (env: Env, phone: string, code: string) => {
//   const body = {
//     "messaging_product": "whatsapp",
//     "to": phone,
//     "text": {"body": `Su código de verificación es: ${code}` }
//   }
//   let response : any;
//   await fetch(`https://graph.facebook.com/v21.0/${env.GRAPH_API_PHONE_NUMBER_ID}/messages`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${env.GRAPH_API_TOKEN}`
//     },
//     body: JSON.stringify(body)
//   }).then(async res => response = await res.json());
//   console.log("response", JSON.stringify(response));
//   return response;
// }

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
    const tempCode = genCode();
    await db.update(users)
      .set({ temp_code: tempCode })
      .where(eq(users.id, existingUser[0].id))
      .run();
    const response = await sendCodeViaWhatsappTemplate(c.env, phone, tempCode);
    if (response.error) {
      console.error("response", JSON.stringify(response));
      return c.json({ error: "Failed to send message" }, 500);
    }
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
    const tempCode = genCode();
    await db.insert(users).values({
      id: user_id,
      phone,
      temp_code: tempCode,
      roles: 'runner',
    }).run();
    const response = await sendCodeViaWhatsappTemplate(c.env, phone, tempCode);
    if (response.error) {
      console.error("response", JSON.stringify(response));
      return c.json({ error: "Failed to send message" }, 500);
    }

    return c.json({ message: "User register began. Check your Whatsapp" });
  });
