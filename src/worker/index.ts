import { Hono } from "hono";
// import { Context, Next } from "hono";
import { cors } from "hono/cors";
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
import { authRoute } from "./auth";
import { sportingEventsRoute } from "./sportingEvents";
import { settingsRoute } from "./settings";
import { usersRoute } from "./users";
import { M } from "./lib/messages";
import { locationsRoute } from "./locations";
import { trainingTeamsRoute } from "./trainingTeams";
import { sportingEventTransactionsRoute } from "./sportingEventTransactions";
import { webhookMercadoPagoRoute } from "./webhookMercadoPago";


export interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    GRAPH_API_TOKEN: string;
    GRAPH_API_PHONE_NUMBER_ID: string;
    MERCADOPAGO_ACCESS_TOKEN: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_IMAGES_API_TOKEN: string;
}
type Variables = JwtVariables


const RGX_AUTH = /^\/api\/auth\/(sendCode|register|login)$/;
const RGX_SP_EVENTS = /^\/api\/sportingEvents\/?(all)?\d*$/;
const RGX_WEBHOOKS = /^\/api\/webhook\/.*$/;


export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const app = new Hono<{ Bindings: Env, Variables: Variables }>();

        // Apply CORS to all routes
        app.use('*', async (c, next) => {
            return cors()(c, next);
        })
        app.use('/api/*', (c, next) => {
            const jwtMiddleware = jwt({
                secret: c.env.JWT_SECRET,
                alg: 'HS256',
            })
            if (c.req.header('Authorization')) {
                // console.log("Authorization header found, applying JWT middleware");
                return jwtMiddleware(c, next);
            }
            if (RGX_WEBHOOKS.test(c.req.path)) {
                // console.log("Skipping JWT auth for webhooks");
                return next();
            }
            if (RGX_AUTH.test(c.req.path) && c.req.method === 'POST') {
                // console.log("Skipping JWT auth for login");
                return next();
            }
            if (RGX_SP_EVENTS.test(c.req.path) && c.req.method === 'GET') {
                // console.log("Skipping JWT auth for public events");
                return next();
            }
            return jwtMiddleware(c, next);
        })
        app.get('/api/authTest', (c) => {
            return c.text('You are authorized')
        })

        app.route('/api/auth', authRoute);
        app.route('/api/sportingEvents', sportingEventsRoute);
        app.route('/api/settings', settingsRoute);
        app.route('/api/users', usersRoute);
        app.route('/api/locations', locationsRoute);
        app.route('/api/trainingTeams', trainingTeamsRoute);
        app.route('/api/sportingEventTransactions', sportingEventTransactionsRoute);
        app.route('/api/webhook/mercadoPago', webhookMercadoPagoRoute);

        app.notFound((c) => c.json({ message: 'Not Found' }, 404));
        app.onError((err, c) => {
            if ('status' in err && err.status == 401) {
                // err.message = no authorization included in request
                return c.json({ message: M.UNAUTHORIZED }, 401);
            }
            if ('status' in err && err.status == 403) {
                // err.message = no authorization included in request
                return c.json({ message: M.FORBIDDEN }, 403);
            }
            console.error(`[Error] ${c.req.method} ${c.req.url}`, err);
            return c.json({ message: M.INTERNAL_SERVER_ERROR }, 500);
        });

        return app.fetch(request, env, ctx);
    }
} satisfies ExportedHandler<Env>;
