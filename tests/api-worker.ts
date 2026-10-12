import { api } from '../lib/api';
import { GET as media } from '../app/api/media/[id]/route';
import Home from '../app/[locale]/page';
import { renderToReadableStream } from 'react-dom/server.browser';
import { metadata } from '../lib/seo';
export default {async fetch(request:Request){const url=new URL(request.url);if(url.pathname.startsWith('/api/app/'))return api(request,url.pathname.slice(9).split('/'));if(url.pathname.startsWith('/api/media/'))return media(request,{params:Promise.resolve({id:url.pathname.split('/').pop()!})});if(url.pathname.startsWith('/meta/'))return Response.json(metadata(url.pathname.split('/').pop() as 'ru'|'kk'|'uz'));if(url.pathname.startsWith('/page/'))return new Response(await renderToReadableStream(await Home({params:Promise.resolve({locale:url.pathname.split('/').pop()!})})),{headers:{'Content-Type':'text/html'}});return new Response('Not found',{status:404});}};
