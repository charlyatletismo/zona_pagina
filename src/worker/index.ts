import { Hono } from "hono";
// import { Context, Next } from "hono";
import { cors } from "hono/cors";
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
import { authRoute } from "./auth";
import { sportingEventsRoute } from "./sportingEvents";
import { settingsRoute } from "./settings";
import { usersRoute } from "./users";
import { chipsRoute } from "./chips";
import { locationsRoute } from "./locations";
import { trainingTeamsRoute } from "./trainingTeams";
import { sportingEventTransactionsRoute } from "./sportingEventTransactions";
import { webhookMercadoPagoRoute } from "./webhookMercadoPago";
import { M } from "./lib/messages";
import { JWTPayload } from "@shared/types";


export interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    BASE_URL: string;
    GRAPH_API_TOKEN: string;
    GRAPH_API_PHONE_NUMBER_ID: string;
    MERCADOPAGO_ACCESS_TOKEN: string;
    MERCADOPAGO_SECRET_KEY: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_IMAGES_API_TOKEN: string;
}
export type Variables = JwtVariables<JWTPayload>;


const RGX_AUTH = /^\/api\/auth\/(sendCode|register|login)$/;
const RGX_SP_EVENTS = /^\/api\/sportingEvents\/?(all)?\d*$/;
const RGX_WEBHOOKS = /^\/api\/webhook\/.*$/;


export default {
    // async scheduled(
    //     controller: ScheduledController,
    //     env: Env,
    //     ctx: ExecutionContext,
    // ) {
    //     const scheduledTime = new Date(controller.scheduledTime);
    //     console.log("cron scheduled", scheduledTime.toISOString());
    //     console.log("cron processed at", new Date().toISOString());
    //     // here we can run any scheduled tasks, for example sending notifications for upcoming schedule items
    //     // we can also use the scheduled time to determine which notifications to send, for example if we want to send notifications for schedule items happening in the next 24 hours, we can calculate the time range and query the database for schedule items with notify_at within that range
    //     // TODO: implement scheduled tasks and notifications
    // },
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
            if (RGX_WEBHOOKS.test(c.req.path)) {
                // console.log("Skipping JWT auth for webhooks");
                return next();
            }
            if (c.req.header('Authorization')) {
                // console.log("Authorization header found, applying JWT middleware");
                return jwtMiddleware(c, next);
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
        app.route('/api/chips', chipsRoute);
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
