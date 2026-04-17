type LogLevel = 'info' | 'warn' | 'error';

export interface LogContext {
  service: 'supabase' | 'firebase' | 'abacatepay' | 'stripe' | 'other';
  operation?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  error?: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
    stack?: string;
  };
  context: LogContext;
}

type Transport = (entry: LogEntry) => void;

const isDev = process.env.NODE_ENV === 'development';

const SENSITIVE_KEYS = new Set(['password', 'token', 'secret', 'key', 'authorization', 'private_key']);

function redactContext(ctx: LogContext): LogContext {
  const result: LogContext = { service: ctx.service };
  for (const [k, v] of Object.entries(ctx)) {
    result[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return result;
}

const consoleTransport: Transport = (entry) => {
  const fn = entry.level === 'error' ? console.error
           : entry.level === 'warn'  ? console.warn
           : console.log;
  fn(JSON.stringify(entry, null, isDev ? 2 : 0));
};

const transports: Transport[] = [consoleTransport];

/**
 * Extension point: adicione Sentry, Axiom, Datadog, etc.
 * Exemplo: addLogTransport((entry) => Sentry.captureException(entry.error))
 */
export function addLogTransport(transport: Transport): void {
  transports.push(transport);
}

function dispatch(entry: LogEntry): void {
  for (const transport of transports) {
    try {
      transport(entry);
    } catch {
      // transports nunca devem derrubar a aplicação
    }
  }
}

function buildEntry(
  level: LogLevel,
  message: string,
  error?: unknown,
  context?: Partial<LogContext>,
): LogEntry {
  const ctx: LogContext = { service: 'other', ...context };
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: redactContext(ctx),
  };

  if (error != null) {
    const err = error as Record<string, unknown>;
    entry.error = {
      message: typeof err?.message === 'string' ? err.message : String(error),
      code: err?.code as string | undefined,
      details: err?.details as string | undefined,
      hint: err?.hint as string | undefined,
      stack: isDev ? (err?.stack as string | undefined) : undefined,
    };
  }

  return entry;
}

export function logError(message: string, error: unknown, context: LogContext): void {
  dispatch(buildEntry('error', message, error, context));
}

export function logWarn(message: string, context: LogContext): void {
  dispatch(buildEntry('warn', message, undefined, context));
}

export function logInfo(message: string, context: LogContext): void {
  dispatch(buildEntry('info', message, undefined, context));
}

/**
 * Helper para erros do Supabase (padrão { data, error }).
 * Loga e re-lança para que a Server Action possa propagar ao cliente.
 */
export function handleSupabaseError(
  error: unknown,
  operation: string,
  context?: Partial<LogContext>,
): void {
  if (!error) return;
  logError(`Erro na operação Supabase: ${operation}`, error, {
    service: 'supabase',
    operation,
    ...context,
  });
  throw error;
}
