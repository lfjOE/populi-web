// lib/logger.ts — Logger para frontend (espejo de internal/logger/logger.go)
//
// Formato: [TIMESTAMP] [LEVEL] caller — mensaje
// En desarrollo loguea a consola. Los niveles son: INFO, WARNING, ERROR.

type LogLevel = "INFO" | "WARNING" | "ERROR";

function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function write(level: LogLevel, message: string, ...args: unknown[]) {
  const text = args.length > 0 ? formatString(message, ...args) : message;
  const line = `[${timestamp()}] [${level}] — ${text}`;

  switch (level) {
    case "ERROR":
      console.error(line);
      break;
    case "WARNING":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

function formatString(template: string, ...args: unknown[]): string {
  let i = 0;
  return template.replace(/%[vds]/g, () => String(args[i++] ?? "???"));
}

export const logger = {
  info(message: string, ...args: unknown[]) {
    write("INFO", message, ...args);
  },
  warning(message: string, ...args: unknown[]) {
    write("WARNING", message, ...args);
  },
  error(message: string, ...args: unknown[]) {
    write("ERROR", message, ...args);
  },
};
