import { Env } from "../index";


export const sendCodeViaWhatsappTemplate = async (env: Env, phone: string, code: string) => {
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
