import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { cfContext, isWorkers } from "@/server/platform";

export type DB = PostgresJsDatabase<typeof schema>;

function create(url: string, onWorkers: boolean): DB {
  const client = onWorkers
    ? // Workers: Hyperdrive bağlantı havuzunu tutar; istemci istek başına kısa ömürlüdür.
      postgres(url, { max: 5, fetch_types: false, prepare: true, idle_timeout: 2, connect_timeout: 10 })
    : postgres(url, { max: Number(process.env.DB_POOL_MAX ?? 10), idle_timeout: 20, prepare: true });
  return drizzle(client, { schema, casing: "snake_case" });
}

/* Node.js: süreç boyunca tek havuz (geliştirmede HMR'a dayanıklı) */
const globalForDb = globalThis as unknown as { __eksenDb?: DB };

/*
 * Cloudflare Workers: bir istekte açılan soket başka bir istekte kullanılamaz.
 * Adaptörün her istek için oluşturduğu bağlam nesnesine bağlı bir WeakMap ile istemciyi istek başına bir kez kurarız.
 */
const perRequest = new WeakMap<object, DB>();

export function getDb(): DB {
  if (isWorkers) {
    const c = cfContext();
    const url = c?.env.HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL;
    if (!url) throw new Error("Veritabanı bağlantısı yok: HYPERDRIVE binding'i veya DATABASE_URL tanımlayın.");
    if (!c) return create(url, true);
    let d = perRequest.get(c);
    if (!d) {
      d = create(url, true);
      perRequest.set(c, d);
    }
    return d;
  }
  return (globalForDb.__eksenDb ??= create(process.env.DATABASE_URL!, false));
}

/** Uygulama genelinde kullanılan veritabanı nesnesi; her erişimde doğru (istek başına / süreç başına) istemciye yönlenir. */
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export { schema };
