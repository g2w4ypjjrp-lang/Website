/**
 * Bu projede kullanılan Cloudflare binding'lerinin asgari tip tanımları.
 * (Tüm Workers çalışma zamanı tiplerini projeye dahil etmek DOM tipleriyle çakıştığı için yalnızca kullandıklarımızı tanımlıyoruz.)
 */
declare global {
  interface CfR2ObjectBody {
    body: ReadableStream;
    size: number;
    httpEtag: string;
    httpMetadata?: { contentType?: string; cacheControl?: string };
    arrayBuffer(): Promise<ArrayBuffer>;
  }
  interface CfR2Bucket {
    get(key: string): Promise<CfR2ObjectBody | null>;
    put(key: string, value: ArrayBuffer | Uint8Array | ReadableStream | string, options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }): Promise<unknown>;
    delete(key: string): Promise<void>;
  }
  interface CfHyperdrive {
    connectionString: string;
  }
  interface CfImagesTransformer {
    transform(options: { width?: number; height?: number; fit?: string }): CfImagesTransformer;
    output(options: { format: string; quality?: number }): Promise<{ response(): Response }>;
  }
  interface CfImagesBinding {
    input(stream: ReadableStream): CfImagesTransformer;
  }
  interface CfRateLimiter {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  }
  interface CloudflareEnv {
    HYPERDRIVE?: CfHyperdrive;
    UPLOADS?: CfR2Bucket;
  }
}
export {};
