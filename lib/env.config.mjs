// Environment variables configuration with type safety

interface Env {
 database: {
   url: string;
   postgresUrl: string;
   postgresUser: string;
   postgresPassword: string;
   postgresDatabase: string;
 };
 ocr: {
   webhookUrl: string;
   apiKey: string;
   timeout: number;
 };
 upload: {
   maxSize: number;
   allowedTypes: string[];
 };
 auth: {
   jwtSecret: string;
   jwtExpiresIn: string;
 };
 rateLimit: {
   windowMs: number;
   maxRequests: number;
 };
 server: {
   nodeEnv: "development" | "production" | "test";
   port: number;
 };
 GOOGLE_APPLICATION_CREDENTIALS: string;
}

export const env: Env = {
 database: {
   url: process.env.DATABASE_URL || "",
   postgresUrl: process.env.POSTGRES_URL || "",
   postgresUser: process.env.POSTGRES_USER || "",
   postgresPassword: process.env.POSTGRES_PASSWORD || "",
   postgresDatabase: process.env.POSTGRES_DATABASE || "",
 },
 ocr: {
   webhookUrl: process.env.N8N_WEBHOOK_URL || "https://ocr-sys-u41198.vm.elestio.app/webhook/upload",
   apiKey: process.env.OCR_API_KEY || "",
   timeout: 60000,
 },
 upload: {
   maxSize: 10 * 1024 * 1024,
   allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
 },
 auth: {
   jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
   jwtExpiresIn: "1d",
 },
 rateLimit: {
   windowMs: 15 * 60 * 1000,
   maxRequests: 100,
 },
 server: {
   nodeEnv: (process.env.NODE_ENV as Env["server"]["nodeEnv"]) || "development",
   port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
 },
 GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
};

export function validateEnv(): string[] {
 const requiredVars = ["DATABASE_URL"];
 const missingVars = requiredVars.filter((varName) => !process.env[varName]);

 if (process.env.NODE_ENV === "production") {
   if (!process.env.N8N_WEBHOOK_URL) {
     missingVars.push("N8N_WEBHOOK_URL");
   }
   if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
     missingVars.push("GOOGLE_APPLICATION_CREDENTIALS");
   }
 }

 return missingVars;
}
