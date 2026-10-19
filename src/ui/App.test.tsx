// @vitest-environment jsdom
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import App from './App';
import {initialState} from '../storage';

beforeEach(()=>vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>({recordings:[{id:'12345678-1234-4234-8234-123456789012',title:'A MusicBrainz Song','artist-credit':[{name:'An Artist'}],'first-release-date':'1964-01-01',length:180000,releases:[{id:'12345678-1234-4234-8234-123456789013',title:'First Album'}]}]})}))));
afterEach(()=>{cleanup();localStorage.clear();vi.unstubAllGlobals()});

it('discovers a MusicBrainz song on the single roulette screen',async()=>{
 render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Descubrir canción/}));
 await waitFor(()=>expect(screen.getByText('CATÁLOGO MUSICBRAINZ')).toBeTruthy(),{timeout:4000});
 expect(screen.getByRole('heading',{name:'A MusicBrainz Song'})).toBeTruthy();
 await waitFor(()=>expect(JSON.parse(localStorage.getItem('sample-roulette-state-v1')||'{}').sessions).toHaveLength(1));
 expect(screen.queryByText('Mi biblioteca')).toBeNull();expect(screen.queryByText('Contenido')).toBeNull();
});

it('renders social links and a language selector without section navigation',()=>{
 localStorage.setItem('sample-roulette-state-v1',JSON.stringify({...initialState,locale:'en'}));render(<App/>);
 expect(screen.getByRole('heading',{name:/Step outside your orbit/})).toBeTruthy();expect(screen.getByRole('link',{name:/Spotify de SVNTS/})).toBeTruthy();expect(screen.getByRole('link',{name:/Instagram de SVNTS/})).toBeTruthy();expect(screen.getByRole('combobox',{name:'Cambiar idioma'})).toBeTruthy();expect(screen.queryByText('My Library')).toBeNull();expect(document.documentElement.lang).toBe('en');
});
