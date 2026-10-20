import {DEFAULT_FILTERS,type State} from './model';
const KEY='sample-roulette-state-v1';
export const initialState:State={filters:DEFAULT_FILTERS,usedIds:[],usedAt:{},favoriteIds:[],sessions:[],episodes:[],notes:{},locale:'es',catalog:[]};
export function readState():State {try {const raw=localStorage.getItem(KEY); if(!raw)return initialState;const x=JSON.parse(raw) as Partial<State>;const filters={...DEFAULT_FILTERS,...x.filters,origin:'',vocal:''};if(!['70s','80s','90s','00s','current'].includes(filters.era))filters.era='';return {...initialState,...x,usedAt:x.usedAt||{},filters}}catch{return initialState}}
export function writeState(s:State){try{localStorage.setItem(KEY,JSON.stringify(s))}catch{/* private mode/storage quota: keep app usable for this session */}}
