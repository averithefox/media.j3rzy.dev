import type { RequestHandler } from "./$types";
import { GET as getFile } from "../../raw/[filename]/+server";
import sharp from "sharp";
import type { RequestEvent } from "@sveltejs/kit";

export const GET: RequestHandler = async ( event ) =>
{
  const response = await getFile(event as unknown as RequestEvent<{ filename: string }, "/raw/[filename]">);
  
  if ( response.status !== 200 )
    return response;
  
  const validSizes: number[] = [ 200, 300, 400 ];
  
  const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
  const mimeType = response.headers.get("Content-Type")!;
  
  if ( mimeType.split("/")[0] !== "image" || mimeType.split("/")[1] === "gif" )
    return new Response(buffer, { headers: response.headers });
  
  const w = new URL(event.request.url).searchParams.get("w");
  let width = w ? (!isNaN(Number(w)) && Number.isInteger(Number(w)) ? Number(w) : 200) : 200;
  width = validSizes.includes(width) ? width : validSizes.reduce(( prev, curr ) => Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev);
  
  const resultBuffer = await sharp(buffer).resize(width).toFormat("webp").toBuffer();
  return new Response(resultBuffer, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": resultBuffer.byteLength.toString(),
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};