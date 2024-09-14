export async function GET ()
{
  return Response.json({ success: false, error: "I'm a teapot" }, { status: 418 });
}