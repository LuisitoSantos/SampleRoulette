// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import App from './App';
import {initialState} from '../storage';

beforeEach(()=>vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,status:200,json:async()=>({recordings:[{id:'12345678-1234-4234-8234-123456789012',title:'A MusicBrainz Song','artist-credit':[{name:'An Artist'}],'first-release-date':'1964-01-01',length:180000,releases:[{id:'12345678-1234-4234-8234-123456789013',title:'First Album'}]}]})}))));
afterEach(()=>{cleanup();localStorage.clear();vi.unstubAllGlobals()});

it('discovers a MusicBrainz song, then saves the same selection as used and creates its episode',async()=>{
 render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Descubrir canción/}));
 await waitFor(()=>expect(screen.getByText('CATÁLOGO MUSICBRAINZ')).toBeTruthy(),{timeout:4000});
 expect(screen.getByRole('heading',{name:'A MusicBrainz Song'})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:/Usar este sample/}));
 await waitFor(()=>{const saved=JSON.parse(localStorage.getItem('sample-roulette-state-v1')||'{}');expect(saved.usedIds).toHaveLength(1);expect(saved.episodes).toHaveLength(1);expect(saved.episodes[0].songId).toBe(saved.usedIds[0]);expect(saved.sessions[0].songId).toBe(saved.usedIds[0])});
 fireEvent.click(screen.getAllByRole('button',{name:/Ruleta/})[0]);fireEvent.click(screen.getByRole('button',{name:/Descubrir canción/}));
 await waitFor(()=>expect(screen.getAllByRole('heading',{name:'A MusicBrainz Song'})).toHaveLength(1),{timeout:4000});
});

it('renders the English navigation and roulette interface when selected',()=>{
 localStorage.setItem('sample-roulette-state-v1',JSON.stringify({...initialState,locale:'en'}));render(<App/>);
 expect(screen.getByRole('heading',{name:/Step outside your orbit/})).toBeTruthy();expect(screen.getAllByText('My Library')).toHaveLength(2);expect(document.documentElement.lang).toBe('en');
});
