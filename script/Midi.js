let inputs;
let outputs;


function onMIDISuccess(midiAccess) {
	inputs = midiAccess.inputs;
	outputs = midiAccess.outputs;
	outputs.values().forEach( (out,i)=> {
		console.log('MIDI out:',out.name,i,out);
		
	});
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

/*	PUBLIC */

function init(){
		// TODO MIDI menu INSIDE pattern, choose MIDI port and channel
		// use latesd pattern config for new patterns!
		// if no MIDI is avail. show red "No MIDI" somewhere in footer or header
	if (navigator.requestMIDIAccess) {
			console.log('This browser supports WebMIDI!');
	} else {
		// TODO rewrite funt to return null if no support
			return console.log('WebMIDI is not supported in this browser.');
	}
	navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure );
}

let state = 0;
let lastNote = -1;

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const CLOCK = 0xF8;

const Midi = {
	init,
	// need event if midiPorts changes, to change midi-options in pattern-menu 
	getOutputs: null,
	clock: function(){
		outputs.values().forEach( out=>{
			out.send([CLOCK]);
		});
	},
	sendRandomNote: function(){
		outputs.values().forEach( out=>{
			if( lastNote != -1 ){
				out.send([NOTE_ON, lastNote, 80]);
				lastNote = -1;
			} else {
				lastNote = 32+(Math.random()*64)>>0;
				out.send([NOTE_OFF, lastNote, 0]);
			}
		});
	},
}

export default Midi;