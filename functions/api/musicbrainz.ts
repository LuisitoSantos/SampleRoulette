export async function onRequest({request}: {request:Request}) {
  const incoming=new URL(request.url);
  const query=incoming.searchParams.get('query')||'';
  // Only allow the app's MusicBrainz search, never arbitrary proxy URLs.
  if(!/^tag:"[a-z0-9 &+-]+"(?: AND firstreleasedate:\[\d{4} TO \d{4}\])?$/i.test(query))return new Response('Invalid MusicBrainz query',{status:400});
  const upstream=new URL('https://musicbrainz.org/ws/2/recording');
  upstream.searchParams.set('query',query);upstream.searchParams.set('fmt','json');upstream.searchParams.set('limit','100');
  try {
    const contact=new URL('/',request.url).toString();
    const response=await fetch(upstream,{headers:{'User-Agent':`SampleRoulette/1.1 (${contact})`}});
    return new Response(response.body,{status:response.status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60, stale-while-revalidate=3600','Access-Control-Allow-Origin':incoming.origin,'Vary':'Origin'}});
  } catch { return new Response(JSON.stringify({error:'MusicBrainz is unavailable'}),{status:502,headers:{'Content-Type':'application/json'}}); }
}
