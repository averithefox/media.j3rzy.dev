import type { RequestHandler } from "./$types";
import { GET as getFile } from "../../raw/[filename]/+server";
import sharp from "sharp";

export const GET: RequestHandler = async ( event ) =>
{
  const response = await getFile(event as any);
  
  if ( response.status !== 200 )
    return response;
  
  const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
  const width = 200; //new URL(event.request.url).searchParams.get("w");
  const mimeType = response.headers.get("Content-Type")!;
  
  if ( mimeType.split("/")[0] !== "image" || mimeType.split("/")[1] === "gif" )
    return Response.json({ success: false, error: "Invalid file type" }, { status: 400 });
  
  const resultBuffer = await sharp(buffer).resize(width).toFormat("webp").toBuffer();
  return new Response(resultBuffer, {
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": resultBuffer.byteLength.toString(),
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};