import {Muxer,ArrayBufferTarget} from 'mp4-muxer';
import type {Song} from './model';
const W=1080,H=1920,FPS=30,FRAMES=180;
const rounded=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
async function loadImage(url?:string):Promise<HTMLImageElement|undefined>{if(!url)return;return new Promise(resolve=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>resolve(i);i.onerror=()=>resolve(undefined);i.src=url})}
function paint(c:CanvasRenderingContext2D,s:Song,episode:number,frame:number,cover?:HTMLImageElement,spinSongs:Song[]=[]){const t=frame/FPS;const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#151719');bg.addColorStop(1,'#08090a');c.fillStyle=bg;c.fillRect(0,0,W,H);
// Subtle soundwave-like bars and glow
c.globalAlpha=.18;c.fillStyle='#c7ff55';for(let i=0;i<36;i++){const h=10+((i*37+frame*7)%120);c.fillRect(36+i*30,H*.72-h,5,h)}c.globalAlpha=1;
c.fillStyle='#c7ff55';c.font='700 30px Arial';c.fillText(`SATURDAY SAMPLE  #${String(episode).padStart(3,'0')}`,80,126);
c.fillStyle='#737778';c.font='500 22px Arial';c.fillText('SAMPLE ROULETTE',80,174);
const spinEnd=4.95; let y= H*.43;
if(t<spinEnd){const p=Math.min(1,t/spinEnd);const ease=1-Math.pow(1-p,3);const labels=[...spinSongs.filter(x=>x.id!==s.id).slice(0,10),s].map(x=>`${x.title}  /  ${x.artists.join(', ')}`);const laps=labels.length*126;const offset=126+ease*(laps*4-126);
  const travel=offset% (labels.length*126);for(let k=-2;k<4;k++){const idx=((Math.floor(offset/126)+k)%labels.length+labels.length)%labels.length;const yy=y+(k*126)+(126-(offset%126));const distance=Math.abs(yy-y);c.globalAlpha=Math.max(.15,1-distance/650);c.textAlign='center';c.fillStyle='#f1f1ed';c.font=distance<70?'700 42px Arial':'500 32px Arial';c.fillText(labels[idx],W/2,yy);c.globalAlpha=1;}void travel;
  c.strokeStyle='#c7ff55';c.lineWidth=3;c.beginPath();c.moveTo(95,y-66);c.lineTo(W-95,y-66);c.moveTo(95,y+66);c.lineTo(W-95,y+66);c.stroke();
}else{
const reveal=Math.min(1,(t-spinEnd)/.25);c.save();c.globalAlpha=reveal;c.translate(W/2,H*.39);c.scale(.94+.06*reveal,.94+.06*reveal);
const size=540;if(cover){c.save();rounded(c,-size/2,-size/2,size,size,22);c.clip();c.drawImage(cover,-size/2,-size/2,size,size);c.restore()}else{const coverBg=c.createRadialGradient(-size*.22,-size*.28,10,0,0,size*.85);coverBg.addColorStop(0,'#b7c548');coverBg.addColorStop(.28,'#475426');coverBg.addColorStop(.7,'#1b251d');coverBg.addColorStop(1,'#16191b');c.fillStyle=coverBg;rounded(c,-size/2,-size/2,size,size,22);c.fill();c.strokeStyle='#e6ef9a55';c.lineWidth=2;for(const d of [430,300,180]){c.beginPath();c.arc(0,0,d/2,0,Math.PI*2);c.stroke()}c.fillStyle='#f1f5cd';c.textAlign='center';c.font='700 230px Arial';c.fillText(s.title.slice(0,1),0,78);c.font='700 20px Arial';c.fillText('DEMO ARTWORK · SAMPLE ROULETTE',0,220)}
c.restore();c.textAlign='center';c.fillStyle='#fafaf6';c.font='700 54px Arial';const title=s.title.length>28?s.title.slice(0,26)+'…':s.title;c.fillText(title,W/2,H*.39+355);c.fillStyle='#a8adad';c.font='400 34px Arial';c.fillText(s.artists.join(', '),W/2,H*.39+414);c.fillStyle='#c7ff55';c.font='700 24px Arial';c.fillText('YOUR NEXT SAMPLE STARTS HERE',W/2,H*.39+514)}
c.fillStyle='#777d7f';c.textAlign='left';c.font='500 20px Arial';c.fillText('DISCOVER  /  CREATE  /  REPEAT',80,H-100)}
const SAMPLE_RATE=48_000, AUDIO_FRAMES=SAMPLE_RATE*6;
function makeRouletteAudio(){
 const data=new Float32Array(AUDIO_FRAMES*2);const ticks:number[]=[];let t=.18;
 while(t<4.86){const p=t/4.86; ticks.push(t);t+=.055+.19*Math.pow(p,1.65)}
 for(let i=0;i<AUDIO_FRAMES;i++){
  const time=i/SAMPLE_RATE;let sample=0;
  for(const at of ticks){const dt=time-at;if(dt>=0&&dt<.045){const envelope=Math.exp(-dt*115);sample+=envelope*(.34*Math.sin(2*Math.PI*(1150-300*dt)*dt)+.12*Math.sin(2*Math.PI*2850*dt))}}
  const bell=time-4.98;if(bell>=0&&bell<.72){const env=Math.exp(-bell*5.7);sample+=env*(.24*Math.sin(2*Math.PI*880*bell)+.13*Math.sin(2*Math.PI*1320*bell)+.08*Math.sin(2*Math.PI*1760*bell));const impact=Math.exp(-bell*38);sample+=impact*.22*Math.sin(2*Math.PI*110*bell)}
  const v=Math.max(-.95,Math.min(.95,sample));data[i*2]=v;data[i*2+1]=v;
 }
 return data;
}
export async function renderMp4(song:Song,episode:number,onProgress:(p:number)=>void,spinSongs:Song[]=[song]){
 if(!('VideoEncoder'in window)||!('AudioEncoder'in window))throw new Error('Este navegador no admite WebCodecs de vídeo y audio. Prueba con Chrome o Edge de escritorio actualizado.');
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo crear el lienzo de vídeo.');
 const cover=await loadImage(song.coverUrl);const target=new ArrayBufferTarget();const muxer=new Muxer({target,video:{codec:'avc',width:W,height:H,frameRate:FPS},audio:{codec:'aac',numberOfChannels:2,sampleRate:SAMPLE_RATE},fastStart:'in-memory'});
 const videoConfig={codec:'avc1.420028',width:W,height:H,bitrate:5_000_000,framerate:FPS};const videoSupport=await VideoEncoder.isConfigSupported(videoConfig);
 if(!videoSupport.supported)throw new Error('El dispositivo no ofrece un encoder H.264 para 1080×1920 a 30 fps. Prueba Chrome o Edge de escritorio en otro equipo.');
 const audioConfig={codec:'mp4a.40.2',sampleRate:SAMPLE_RATE,numberOfChannels:2,bitrate:128_000};const audioSupport=await AudioEncoder.isConfigSupported(audioConfig);
 if(!audioSupport.supported)throw new Error('Este dispositivo no puede codificar audio AAC para el MP4. Prueba Chrome o Edge de escritorio actualizado.');
 let failure:Error|undefined;
 const audioEncoder=new AudioEncoder({output:(chunk,meta)=>muxer.addAudioChunk(chunk,meta),error:e=>{failure=e}});audioEncoder.configure(audioSupport.config||audioConfig);
 const samples=makeRouletteAudio(),chunkFrames=1024;
 for(let start=0;start<AUDIO_FRAMES;start+=chunkFrames){const count=Math.min(chunkFrames,AUDIO_FRAMES-start);const chunk=samples.subarray(start*2,(start+count)*2);const audioData=new AudioData({format:'f32',sampleRate:SAMPLE_RATE,numberOfFrames:count,numberOfChannels:2,timestamp:Math.round(start*1_000_000/SAMPLE_RATE),data:chunk});audioEncoder.encode(audioData);audioData.close()}
 await audioEncoder.flush();if(failure)throw new Error(`Falló el encoder AAC: ${failure.message}`);audioEncoder.close();
 const encoder=new VideoEncoder({output:(chunk,meta)=>muxer.addVideoChunk(chunk,meta),error:e=>{failure=e}});encoder.configure(videoSupport.config||videoConfig);
 try{for(let f=0;f<FRAMES;f++){if(failure)throw new Error(`Falló el encoder H.264: ${(failure as Error).message}`);paint(ctx,song,episode,f,cover,spinSongs);const frame=new VideoFrame(canvas,{timestamp:Math.round(f*1_000_000/FPS),duration:Math.round(1_000_000/FPS)});encoder.encode(frame,{keyFrame:f%60===0});frame.close();if(f%3===0){onProgress(Math.round((f/FRAMES)*95));await new Promise(r=>setTimeout(r,0))}}await encoder.flush();if(failure)throw new Error(`Falló el encoder H.264: ${(failure as Error).message}`)}finally{if(encoder.state!=='closed')encoder.close()}
 muxer.finalize();onProgress(100);return new Blob([target.buffer],{type:'video/mp4'})
}
export async function downloadCard(song:Song,episode?:number){const c=document.createElement('canvas');c.width=800;c.height=260;const x=c.getContext('2d')!;x.fillStyle='#111315';x.beginPath();x.roundRect(0,0,800,260,22);x.fill();if(song.coverUrl){const image=await loadImage(song.coverUrl);if(image)x.drawImage(image,24,24,212,212)}if(!song.coverUrl){x.fillStyle='#c7ff55';x.font='700 24px Arial';x.fillText('SAMPLE',54,134);x.fillText('ROULETTE',54,166)}x.fillStyle='#c7ff55';x.font='700 17px Arial';x.fillText(episode?`SATURDAY SAMPLE #${String(episode).padStart(3,'0')}`:'SAMPLE ROULETTE',264,76);x.fillStyle='#f4f4ef';x.font='700 30px Arial';x.fillText(song.title.slice(0,26),264,130);x.fillStyle='#a8adad';x.font='400 22px Arial';x.fillText(song.artists.join(', ').slice(0,38),264,170);const blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('No se pudo exportar el PNG.')),'image/png'));const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Saturday-Sample-${String(episode??1).padStart(3,'0')}-card.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
