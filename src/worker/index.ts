import { Hono } from "hono";
// import { Context, Next } from "hono";
import { cors } from "hono/cors";
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
import { authRoute } from "./auth";
import { eventsRoute } from "./events";


export interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    GRAPH_API_TOKEN: string;
    GRAPH_API_PHONE_NUMBER_ID: string;
}
type Variables = JwtVariables


export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const app = new Hono<{ Bindings: Env, Variables: Variables }>();

        // Apply CORS to all routes
        app.use('*', async (c, next) => {
            return cors()(c, next);
        })
        app.use('/api/*', (c, next) => {
            if (c.req.path.startsWith('/api/auth/') && c.req.method === 'POST') {
                console.log("Skipping auth for login");
                return next();
            }
            if (c.req.path === '/api/events' && c.req.method === 'GET') {
                console.log("Skipping auth for public events");
                return next();
            }
            const jwtMiddleware = jwt({
                secret: c.env.JWT_SECRET,
            })
            return jwtMiddleware(c, next)
        })
        app.get('/api/authTest', (c) => {
            return c.text('You are authorized')
        })

        app.route('/api/auth', authRoute);
        app.route('/api/events', eventsRoute);

        return app.fetch(request, env, ctx);
    }
} satisfies ExportedHandler<Env>;
