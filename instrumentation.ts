export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const [{ Logger }, { addLogTransport }] = await Promise.all([
    import('next-axiom'),
    import('@/lib/logger'),
  ]);

  addLogTransport((entry) => {
    const log = new Logger();
    const fields = { ...entry.context, ...(entry.error ? { error: entry.error } : {}) };

    if (entry.level === 'error') log.error(entry.message, fields);
    else if (entry.level === 'warn') log.warn(entry.message, fields);
    else log.info(entry.message, fields);

    log.flush();
  });
}
