import {useEffect,useState} from 'react';

type Placement='bottomDesktop'|'bottomMobile'|'sideLeft'|'sideRight';
type Props={placement:Placement;code:string;width:number;height:number;className:string;label:string};

/** Adsterra's publisher snippet is sandboxed in its own frame. */
function AdsterraSlot({placement,code,width,height,className,label}:Props){
  if(!code.trim())return null;
  const document=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:grid;place-items:center;overflow:hidden">${code}</body></html>`;
  return <aside className={`ad-slot ${className}`} aria-label={label} data-placement={placement}><span>PUBLICIDAD</span><iframe title={label} width={width} height={height} srcDoc={document} sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin"/></aside>;
}

export function AdsterraPlacements({snippets}:{snippets:typeof import('../ads').adsterraSnippets}){
  const [mobile,setMobile]=useState<boolean>();
  const [wide,setWide]=useState(false);
  useEffect(()=>{if(typeof window.matchMedia!=='function'){setMobile(false);setWide(window.innerWidth>=1800);return}const mobileQuery=window.matchMedia('(max-width: 760px)');const wideQuery=window.matchMedia('(min-width: 1800px)');const updateMobile=()=>setMobile(mobileQuery.matches);const updateWide=()=>setWide(wideQuery.matches);updateMobile();updateWide();mobileQuery.addEventListener('change',updateMobile);wideQuery.addEventListener('change',updateWide);return()=>{mobileQuery.removeEventListener('change',updateMobile);wideQuery.removeEventListener('change',updateWide)}},[]);
  return <>
    {wide&&<AdsterraSlot placement="sideLeft" code={snippets.sideLeft} width={300} height={250} className="ad-rail ad-rail-left" label="Publicidad lateral izquierda"/>}
    {wide&&<AdsterraSlot placement="sideRight" code={snippets.sideRight} width={160} height={300} className="ad-rail ad-rail-right" label="Publicidad lateral derecha"/>}
    {mobile!==undefined&&<AdsterraSlot placement={mobile?'bottomMobile':'bottomDesktop'} code={snippets.bottomDesktop} width={728} height={90} className="ad-bottom" label="Banner publicitario"/>}
  </>;
}
