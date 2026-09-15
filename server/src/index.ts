import { app } from "./app.js";
import { database } from "./database.js";

const port = Number(process.env.COASTLINK_PORT ?? 3000);
const host = process.env.COASTLINK_HOST ?? "127.0.0.1";

const server = app.listen(port, host, () => {
  console.log(`CoastLink API listening at http://${host}:${port}`);
});

function shutDown() {
  server.close(() => {
    database.close();
  });
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
