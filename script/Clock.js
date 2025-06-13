/*	___________________	*/
/*	____	PRIVATE	 ____	*/
/*	___________________	*/
function getMidiClockMilliseconds(bpm) {
    return 2500 / bpm; // 60000 / 24 = 2500
}

let bpm = 120; // Set your desired BPM
let timeout = getMidiClockMilliseconds(bpm);
let start = performance.now();
let bpmTickMs = 0;
let bpmTick = 0;
let bpmBeat = 0;
let bpmTickCb = function(){  }

let timeoutId = -1;

function measure() {
    let now = performance.now();
    bpmTickMs += now - start;
    start = now;

    if (bpmTickMs >= timeout) {
        //console.log("TICK:", bpmTick, bpmBeat, getTickPosition());
				//console.log('Tick:', bpmTickMs.toFixed(5), 'Timeout:', timeout.toFixed(5), 'Drift:', (bpmTickMs - timeout).toFixed(5));
        bpmTickMs -= timeout; // Reset the elapsed time
				bpmTickCb( getTickPosition() );
				if( bpmTick<24 ){ bpmTick++; }
				else {
					bpmTick = 0;
					bpmBeat++;
				}
    }

    let remainingTime = (timeout - bpmTickMs)/3;   // Calculate the remaining time until the next tick
    if (remainingTime > 0) {
        timeoutId = setTimeout(measure, remainingTime);
    } else {	// If the drift is negative, we can call measure immediately
        measure();
    }
}

/*	°°°°°°°°°°°°°°°°°°	*/
/*	°°°°	PUBLIC	°°°°	*/
/*	°°°°°°°°°°°°°°°°°°	*/
function init( bpmTickCbNew ){
	bpmTickCb = bpmTickCbNew;
}

function getSetBPM( bpmNew ){
	if( bpmNew ){
		bpm = bpmNew;
		timeout = getMidiClockMilliseconds( bpm );
	} else {	// if no arg supplied, return bpm
		return bpm;
	}
}

function startTimer(){
	timeoutId = setTimeout(measure, timeout);
}

function pause(){
	clearTimeout( timeoutId );
}

function stop(){
	bpmTick = bpmBeat = bpmTickMs = 0;
	pause();
}

function getTickPosition(){
	return ( bpmBeat*24 + (bpmTick) );
}

/*	$$$$$$$$$$$$$$$$$$$$$$	*/
/*	$$$$	MAIN OBJECT	$$$$	*/
/*	$$$$$$$$$$$$$$$$$$$$$$	*/
const MidiClock = {
	init,
	bpm: getSetBPM,
	start: startTimer,
	pause,
	stop,
};

/*     clock (decimal 248, hex 0xF8)
    start (decimal 250, hex 0xFA)
    continue (decimal 251, hex 0xFB)
    stop (decimal 252, hex 0xFC) */ 

export default MidiClock;