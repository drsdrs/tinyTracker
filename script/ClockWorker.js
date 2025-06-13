import MidiClock from "./Clock.js";

function postMsgCallback( res ){
	self.postMessage( res );
}

self.onmessage = (e)=> {
	const method = e.data[0];
	let args = e.data[1];
	if( method==='init' ){ args = postMsgCallback; }
	const res = MidiClock[ method ]( args );
	if(res){ self.postMessage( res ); }
};