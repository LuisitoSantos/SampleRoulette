export type Era='pre70'|'70-89'|'90-09'|'10+'; export type Genre='soul'|'world'|'rock'|'electronic'|'spanish'|'classical'|'other'; export type Origin='es-latam'|'us-uk'|'world'; export type Vocal='vocal'|'instrumental'|'unknown';
export interface Song {id:string; title:string; artists:string[]; year?:number; genres?:Genre[]; region?:Origin; vocal:Vocal; coverUrl?:string; spotifyId?:string; spotifyUri?:string; spotifyUrl?:string; album?:string; durationMs?:number; source:'demo'|'spotify'|'musicbrainz'; addedAt:string;}
export interface Filters {era:string; genre:string; origin:string; vocal:string}
export interface RouletteSession {id:string; songId:string; createdAt:string; filters:Filters; discardedIds:string[]}
export interface Episode {id:string; number:number; songId:string; createdAt:string; caption:string; hashtags:string[]; status:'Pendiente'|'En producción'|'Producido'|'Editado'|'Programado'|'Publicado'; reelUrl?:string; notes:string; publishDate?:string; views?:number; likes?:number; comments?:number}
export interface State {filters:Filters; usedIds:string[]; usedAt:Record<string,string>; favoriteIds:string[]; sessions:RouletteSession[]; episodes:Episode[]; notes:Record<string,string>; locale:string; catalog:Song[]}
export const DEFAULT_FILTERS:Filters={era:'',genre:'',origin:'',vocal:''};
export function eraOf(year?:number):string {if(!year)return ''; return year<1970?'pre70':year<1990?'70-89':year<2010?'90-09':'10+'}
export function matches(song:Song,f:Filters):boolean {if(f.era&&eraOf(song.year)!==f.era)return false;if(f.genre&&(!song.genres||!song.genres.includes(f.genre as Genre)))return false;return true}
export function chooseSong(songs:Song[],f:Filters,used:string[],excluded:string[],random=Math.random):Song|undefined {const eligible=songs.filter(s=>matches(s,f)&&!used.includes(s.id)&&!excluded.includes(s.id));return eligible[Math.floor(random()*eligible.length)]}
export function markUsed(state:State,id:string,at=new Date().toISOString()):State {return state.usedIds.includes(id)?state:{...state,usedIds:[...state.usedIds,id],usedAt:{...state.usedAt,[id]:at}}}
export function toggleFavorite(state:State,id:string):State {return {...state,favoriteIds:state.favoriteIds.includes(id)?state.favoriteIds.filter(x=>x!==id):[...state.favoriteIds,id]}}
