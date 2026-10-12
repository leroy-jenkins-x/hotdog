export function GET(request: Request) {
  return Response.redirect(new URL('/ru', request.url), 302);
}
