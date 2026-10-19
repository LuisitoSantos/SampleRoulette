import {afterEach,expect,it,vi} from 'vitest';
import {DEFAULT_FILTERS} from './model';
import {discoverFromMusicBrainz} from './musicbrainz';

afterEach(()=>vi.unstubAllGlobals());
it('maps MusicBrainz recordings while leaving unsupported metadata unknown',async()=>{
 const fetchMock=vi.fn(async()=>({ok:true,status:200,json:async()=>({recordings:[{id:'12345678-1234-4234-8234-123456789012',title:'Blue Room','artist-credit':[{artist:{name:'A Band'}}],'first-release-date':'1978-03-01',length:205000,releases:[{id:'12345678-1234-4234-8234-123456789013',title:'Blue Room LP'}]}]})}));vi.stubGlobal('fetch',fetchMock);
 const songs=await discoverFromMusicBrainz({...DEFAULT_FILTERS,genre:'soul',era:'70-89'});
 expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('tag%3A%22'),{cache:'force-cache'});
 expect(songs[0]).toMatchObject({id:'mb:12345678-1234-4234-8234-123456789012',title:'Blue Room',artists:['A Band'],year:1978,genres:['soul'],vocal:'unknown',source:'musicbrainz',album:'Blue Room LP'});
 expect(songs[0].region).toBeUndefined();expect(songs[0].spotifyUrl).toBeUndefined();
});
