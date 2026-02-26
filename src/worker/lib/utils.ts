import { ContentfulStatusCode } from 'hono/utils/http-status';


export interface DataResult {
  status: ContentfulStatusCode;
  message?: Record<string, string>;
  data?: unknown;
}
export interface NoDataResult {
  status: ContentfulStatusCode;
  message: Record<string, string>;
}
