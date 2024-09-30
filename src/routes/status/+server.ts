import type { RequestEvent } from "@sveltejs/kit";

export const GET = async (event: RequestEvent) => Response.json({
  alive: true,
  ramUsage: process.memoryUsage().heapUsed / 1024 / 1024,
  cpuUsage: process.cpuUsage().user / 1000 / 1000,
  uptime: process.uptime(),
  version: process.version,
  platform: process.platform,
  arch: process.arch,
  memoryUsage: process.memoryUsage().heapTotal / 1024 / 1024,
});