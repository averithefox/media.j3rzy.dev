import { NextRequest } from "next/server";

export async function GET( { nextUrl }: NextRequest )
{
  return Response.redirect(new URL("/", nextUrl), 302);
}