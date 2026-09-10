import { mkdir, writeFile } from 'node:fs/promises';

// Original, deterministic sound design: warm body plus filtered air, no sharp transient.
const dir=new URL('../assets/audio/soft/',import.meta.url);
await mkdir(dir,{recursive:true});
for(const [name,hz,duration,air] of [['gun',130,.14,.22],['heavy',85,.22,.3],['swing',170,.17,.65],['bow',230,.15,.18],['magic',290,.23,.12]]){
  const rate=22050,count=Math.ceil(rate*duration),wav=Buffer.alloc(44+count*2);
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);
  wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
  wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
  wav.write('data',36);wav.writeUInt32LE(count*2,40);
  let seed=71,noise=0,phase=0;
  for(let i=0;i<count;i++){
    const t=i/rate,u=t/duration;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    noise+=.16*((seed/4294967296*2-1)-noise);
    phase+=2*Math.PI*hz*(1-.45*u)/rate;
    const envelope=Math.min(1,t/.009)*Math.exp(-5*u)*Math.min(1,(duration-t)/.025);
    const sample=(Math.sin(phase)*(1-air)+noise*air)*envelope*.55;
    wav.writeInt16LE(Math.round(sample*32767),44+i*2);
  }
  await writeFile(new URL(name+'.wav',dir),wav);
}
