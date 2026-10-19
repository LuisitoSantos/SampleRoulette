import type {Filters,Genre,Song} from './model';

type Recording={id?:string;title?:string;'artist-credit'?:Array<{name?:string;artist?:{name?:string}}>; 'first-release-date'?:string;length?:number;releases?:Array<{id?:string;title?:string}>};
const tags:Record<Genre,string[]>={soul:['soul','funk','r&b'],world:['afrobeat','highlife','salsa','reggae','bossa nova','cumbia'],rock:['psychedelic rock','indie rock','pop rock'],electronic:['disco','electronic','house','funk'],spanish:['flamenco','spanish music','rumba'],classical:['soundtrack','film score','classical'],other:['jazz','folk','punk','ambient']};
const allTags=Object.values(tags).flat();
const bounds:Record<string,[number,number]>={pre70:[1900,1969],'70-89':[1970,1989],'90-09':[1990,2009],'10+':[2010,2026]};
let lastRequestAt=0;
function pick<T>(items:T[]){return items[Math.floor(Math.random()*items.length)]}
export async function discoverFromMusicBrainz(filters:Filters):Promise<Song[]>{
  const query=new URLSearchParams();
  const genre=filters.genre as Genre|'';
  const tag=pick(genre&&tags[genre]?tags[genre]:allTags);
  const parts=[`tag:"${tag.replaceAll('"','')}"`];
  const yearBounds=bounds[filters.era];if(yearBounds)parts.push(`firstreleasedate:[${yearBounds[0]} TO ${yearBounds[1]}]`);
  query.set('query',parts.join(' AND '));query.set('fmt','json');query.set('limit','100');
  const wait=Math.max(0,1000-(Date.now()-lastRequestAt));if(wait)await new Promise(resolve=>setTimeout(resolve,wait));lastRequestAt=Date.now();
  const response=await fetch(`/api/musicbrainz?${query}`,{cache:'force-cache'});
  if(!response.ok)throw new Error(response.status===503?'MusicBrainz está limitando solicitudes. Espera un segundo y vuelve a intentarlo.':`MusicBrainz respondió con error (${response.status}).`);
  const data=await response.json() as {recordings?:unknown};
  if(!Array.isArray(data.recordings))return [];
  return (data.recordings as Recording[]).flatMap(recording=>{
    if(!recording||typeof recording.id!=='string'||! /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(recording.id)||typeof recording.title!=='string'||!recording.title.trim())return [];
    const artists=(recording['artist-credit']||[]).map(x=>x.name||x.artist?.name||'').filter(Boolean);
    if(!artists.length)return [];
    const year=Number(recording['first-release-date']?.slice(0,4));
    const release=recording.releases?.find(r=>typeof r?.id==='string'&&/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(r.id));
    return [{id:`mb:${recording.id}`,title:recording.title.trim(),artists,year:Number.isFinite(year)&&year>0?year:undefined,genres:genre?[genre]:[],vocal:'unknown',coverUrl:release?.id?`https://coverartarchive.org/release/${release.id}/front-250`:undefined,album:typeof release?.title==='string'?release.title:undefined,durationMs:Number.isFinite(recording.length)?recording.length:undefined,source:'musicbrainz',addedAt:new Date().toISOString()} satisfies Song];
  });
}
