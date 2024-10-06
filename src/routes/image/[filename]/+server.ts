import type { RequestHandler } from "./$types";
import { GET as getFile } from "../../raw/[filename]/+server";
import sharp from "sharp";

export const GET: RequestHandler = async ( event ) =>
{
  const response = await getFile(event as any);
  
  if ( response.status !== 200 )
    return response;
  
  const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
  const width = new URL(event.request.url).searchParams.get("w");
  const mimeType = response.headers.get("Content-Type")!;
  
  if (mimeType.split("/")[0] !== "image")
    return new Response("Not an image", { status: 400, headers: { "Content-Type": "text/plain" } });
  
  const resultBuffer = await sharp(buffer).resize(width ? parseInt(width) : null).toFormat("webp").toBuffer();
  return new Response(resultBuffer, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": resultBuffer.byteLength.toString(),
    }
  });
};