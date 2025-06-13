let patternIdPool = 0;


const patternConfigTemplate = {
    instumentId: 0,
    resolution: (1/4)*32,    // mul32 when saving, div32 when loading
    start: 0,
    rest: 0,   // in beats OR bars ? // -1 = NO_LOOP // 0=nopause between loops
    loops: -1,
    channels: 1
}

function getNewPattern(){
    const patternConfig = new Uint8Array( Object.values(patternConfigTemplate) );
    const patternData = new Uint8Array( 32 );
}


let demoPatternData = [];
let noteCnt = 0;
let volumeCnt = 0;

for (let pt = 0; pt < 16; pt++) {
  demoPatternData[pt] = [];
  let rows = ((Math.random()*311)+4)>>0;
  let chs = ((Math.random()*4)+1)>>0;
  for (let ch = 0; ch < chs; ch++) {
    let channelData = [];
    for (let i = 0; i < rows; i++) {
      if( Math.random()>.5 ){ channelData.push([0,0,0]); continue; }
      if( Math.random()>.75 ){ channelData.push([255,0,0]); continue; }
      const note = noteCnt++;//((Math.random()*128)>>0);
      const volume = volumeCnt++;//((Math.random()*128)>>0);
      const effect = noteCnt;//((Math.random()*4)<<4) | ((Math.random()*4)>>0);
      channelData.push( [note&0x7F, volume&0x7F, effect&0xFF] );
    }
    demoPatternData[pt].push( channelData);
  }
  let resolution = ((96)/4)>>0//;((Math.random()*96)>>0);

  //c.l(demoPatternData[pt], 1/resolution);
  demoPatternData[pt].config = Object.assign( {}, patternConfigTemplate);
  demoPatternData[pt].config.resolution = resolution;
  demoPatternData[pt].config.id = patternIdPool++;
  //PatternView.renderPattern( demoPatternData[pt], resolution+(1/24) );
}

let activePattern = 0;
let timeoutId = -1;

function playPattern( patternId ){
  const data = demoPatternData[patternId];
  function checkNextStep(){
    /*
      getpos, drawpos, sendMidiNote if incr.
    */
  }
  timeoutId = requestAnimationFrame( chechNextStep );
}

const PatternManager = {
  init: function( PatternView ){
    PatternView.renderAll( demoPatternData );
  },
  playPattern,
  //playAll,
  //playSong,
  pause: null,
  stop: null,

}

export default PatternManager