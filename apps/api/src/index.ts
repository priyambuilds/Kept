import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { startV4Scheduler } from "./routes/v4.js";

const app = createApp();
startV4Scheduler();

// config.port reads process.env.PORT (set by Render/Railway), falling back to 3000 locally.
// Bind 0.0.0.0 so the platform's proxy can reach the container.
app.listen(config.port, "0.0.0.0", () => {
  console.log(`KEPT V4 backend listening on :${config.port}, program ${config.programId}`);
});
