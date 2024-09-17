import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { metadata as metadataBase } from "@/app/layout";

export async function GET( req: NextRequest )
{
  try
  {
    const filename: string = decodeURIComponent(req.nextUrl.pathname.split("/").slice(1)[0]);
    const record = await db.file.findFirst({ where: { OR: [ { filename }, { hash: filename }, { id: filename } ] } });
    const userAgent = req.headers.get("User-Agent");
    const isBot = userAgent && /bot|crawler|spider|crawling/i.test(userAgent);
    if ( !record ) return Response.json({ success: false, error: "File not found" }, { status: 404 });
    if ( !isBot ) return new Response(JSON.stringify({}), {
      status: 301,
      headers: { Location: new URL(`/raw/${record.filename}`, metadataBase.metadataBase!).toString() },
    });
    const metadata: { [key: string]: string } = {};
    metadata["og:site_name"] = metadataBase.openGraph?.siteName!;
    metadata["og:title"] = metadataBase.openGraph?.title! as string;
    metadata["og:description"] = metadataBase.openGraph?.description! as string;
    metadata["og:url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
    switch ( record.mimeType.split("/")[0] )
    {
      case "video":
        metadata["og:video"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:video:url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:video:secure_url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:video:type"] = record.mimeType;
        metadata["twitter:card"] = "player";
        metadata["twitter:player"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        break;
      case "audio":
        metadata["og:audio"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:audio:url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:audio:secure_url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:audio:type"] = record.mimeType;
        break;
      case "image":
        metadata["og:image"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:image:url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:image:secure_url"] = new URL(`/raw/${record.filename}`, req.nextUrl).toString();
        metadata["og:image:type"] = record.mimeType;
        metadata["twitter:card"] = "summary_large_image";
        break;
    }
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <meta name="theme-color" content="#92afbd">
  ${Object.entries(metadata).map(( [ key, value ] ) => `<meta name="${key}" content="${value}">`).join("\n\t")}
</head>
<body>
</body>
</html>
    `.trim(), { status: 200, headers: { "Content-Type": "text/html" } });
  } catch ( e: any )
  {
    console.error(e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}