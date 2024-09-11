import * as fs from "fs/promises";

export async function GET()
{
  const files = await fs.readdir("files");
}