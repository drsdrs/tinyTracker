/*  MIDI & Sample based sequencer.
    
    show info of selected item in bottom info bar
    make song view at bottom with thick colored lines
    use proper musical symbol for startPause loopPause 
*/

import PatternManager from './script/PatternManager.js'
import PatternView from './script/PatternView.js'
import Key from './script/Key.js'
import Midi from './script/Midi.js'


const keyEventMap = [
    { key:'w', mod:'Shift', action: ()=>{ c.l(123); } },
    { key:'w', mod: null, action: ()=>{ c.l(321); } },
]

Key.init( keyEventMap );




const MidiClockWorker = new Worker('./script/ClockWorker.js', { type: 'module' });
const MidiClock = function( method, args ){
    if( method==='onClockTick' ){
        return MidiClockWorker.addEventListener( "message", function(e){
            args( e.data );
        });
    }
    MidiClockWorker.postMessage( [ method, args ] );
}


let currentTick;
MidiClock( 'onClockTick', function( tickCnt ){
    //c.l("EE",e,Date.now()-startDate);
    currentTick = tickCnt;
    //PatternView.setRowActive( 0, currentTick);
    PatternView.setRowsActive( [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], currentTick);
    Midi.clock();
});

Midi.init();

// MidiClock( 'init' );
// MidiClock( 'bpm', [122] );
// MidiClock( 'start' );

PatternManager.init( PatternView );

let runs = 0;
let UI_FPS = 1000/8;
let testSum = 0;

function getDeltaTimeFunction(){
    let start = performance.now();
    let delta = 0;
    return function(){
        let now = performance.now();
        delta = (now-start);
        start = now;
        return delta;
    };
}

const measure = getDeltaTimeFunction();

function renderLoop(){
    testSum += measure();
    runs++;
    let res = testSum/runs;
    //c.l( currentTick, res )
    //PatternView.setRowsActive( [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], currentTick);

    setTimeout(function(){
        requestAnimationFrame( renderLoop );
    }, UI_FPS );
}

renderLoop()






const parent = document.querySelector("#pattern-container");

let startY;
let startX;
let scrollY;
let scrollX;
let isDown;
let dragged = false;

let patternToDrag;
let channelsToDrag;
let dragHandle;

parent.addEventListener("mousedown", (e) => mouseIsDown(e));
parent.addEventListener("mouseup", (e) => mouseUp(e));
//parent.addEventListener("mouseleave", (e) => mouseUp(e));
parent.addEventListener("mousemove", (e) => mouseMove(e));

function mouseIsDown(e) {
  isDown = true;
  dragged = false;
  startX = e.pageX - parent.offsetLeft;
  scrollX = parent.scrollLeft;
  if( e.target.classList.contains( "scrollhandle" ) ){
    
    patternToDrag = e.target.closest( '.pattern' );
    channelsToDrag = patternToDrag.getElementsByClassName('channels')[0];
    dragHandle = e.target;
    scrollY = channelsToDrag.scrollTop;
    startY = e.pageY - channelsToDrag.offsetTop;
    c.l("down", startY, patternToDrag, channelsToDrag)
  }
}

function mouseUp(e) {
  if( !dragged && e.target.classList.contains( "cell" ) ) PatternView.selectCell( e );
  isDown = false;
  patternToDrag = false;
}

function mouseMove(e) {
  if (isDown) {
    e.preventDefault();
    const x = e.pageX - parent.offsetLeft;
    const y = e.pageY - parent.offsetTop;
    const walkY = (y - startY);
    const walkX = (x - startX);
    
    if( Math.abs(walkY)>2 && patternToDrag ){
        channelsToDrag.scrollTop =
            walkY*(channelsToDrag.scrollTopMax/channelsToDrag.clientHeight) - scrollY;
        c.l(channelsToDrag.scrollTop)
        dragHandle.style.marginTop =   
            (channelsToDrag.scrollTop/channelsToDrag.scrollTopMax)*patternToDrag.clientHeight + 'px';
    } else if( Math.abs(walkX)>8 ){ parent.scrollLeft = scrollX - walkX*2;}
    dragged = true;
  }
}
// addEventListener( 'beforeunload', function(e){
//         e.stopPropagation();
//         e.preventDefault();
//         return false;
//     },
//     true
// t);