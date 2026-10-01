import { createApp } from './app.mjs';
const { app, db, config } = createApp();
const port = Number(process.env.PORT || 3001);
const server = app.listen(port, config.production ? '0.0.0.0' : '127.0.0.1', () =>
  console.info(`Lerabyte Lab listening on port ${port}`),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
