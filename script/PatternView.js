/*	__________________________	*/
/*	_???_	PRIVATE	 DATA  _???_	*/
/*	__________________________	*/
const patternContainer = document.getElementById('pattern-container');
let patternRowElements = [];
let patternData;

const midiNotes = [];
const noteNames = [
	'C', 'C<span class="noteHash">#</span>', 'D', 'D<span class="noteHash">#</span>', 'E', 'F',
	'F<span class="noteHash">#</span>', 'G', 'G<span class="noteHash">#</span>', 'A', 'A<span class="noteHash">#</span>', 'B'
];

for (let midiNumber = 0; midiNumber <= 127; midiNumber++) {
  const octaveNumber = Math.floor(midiNumber / 12); // Octave starts from -1 for MIDI note 0
  const noteIndex = midiNumber % 12;
  const noteLetter = noteNames[noteIndex];
  midiNotes.push([octaveNumber, noteLetter]);
}

const patternHeaderIcons = [
  '<img title="Position" src="assets/svg/position.svg" alt="Position"></img>',
  '<img title="Note" src="assets/svg/note.svg" alt="Note"></img>',
  '<img title="Volume" src="assets/svg/volume.svg" alt="Volume"></img>',
  '<img title="Effect" src="assets/svg/effect.svg" alt="Effect"></img>'
]

/*	___________________________	*/
/*	_!!!_	PRIVATE	FUNCT	  _!!!_	*/
/*	___________________________	*/

// Function to calculate the greatest common divisor (GCD)
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Function to convert a float number to a three-part representation
function int2ThreePart(fullInt) {
    const wholeNumber = Math.floor(fullInt);
    const decimalPart = fullInt - wholeNumber;
    const fractionDenominator = 24;
    const fractionNumerator = Math.round(decimalPart * fractionDenominator);

    // If the fraction is 24, increment the whole number and reset the fraction
    if (fractionNumerator === fractionDenominator) {
        return [ wholeNumber + 1, 0, fractionDenominator ];
    }

    // Simplify the fraction
    const divisor = 1;//gcd(fractionNumerator, fractionDenominator);
    return [ wholeNumber, fractionNumerator / divisor, fractionDenominator / divisor ];
}

function getThreePartNumberHtml( value, resolution ) {
  const beatStep = (value*resolution/96);

  const threePart = int2ThreePart( beatStep );
  if( threePart[1] > 0 ) {
    return `<span class='beatContainer'><span class="fullBeatNum">${(threePart[0]>>2).toString(16).toUpperCase()}</span>
		<span class="beat4Num">${(threePart[0]%4)}</span></span>
		<span class="numerator">${threePart[1]}</span>
		/<span class="denominator">${threePart[2]}</span>`;
  } else {
    return `<span class='fullBeatContainer'><span class="fullBeatNum">${(threePart[0]>>2).toString(16).toUpperCase()}</span>
		<span class="beat4Num">${(threePart[0]%4)}</span>&nbsp&nbsp-</span>`;
  }
}

function getNoteHtml( note ) {
  return '<span>'+midiNotes[note][0].toString(16).toUpperCase()+' '+midiNotes[note][1]+'</span>'
}

function getEffectHtml( fx ) {
	const type = (fx>>6)+10;
  return '<span>'+type.toString(16).toUpperCase()+'|'+(fx&0x0F).toString(16).toUpperCase()+'</span>'
}


function createPatternContainer( patternId ) {
	const container = document.createElement('div');
	container.classList.add( 'pattern', 'clickable','patternId'+patternId );

	const containerHeader = document.createElement('div');
	containerHeader.innerHTML = 'Name: Undefined, ID:'+patternId;

	
	const playPauseContainer = document.createElement('span');
	playPauseContainer.innerHTML +=  
	'<img class="displayNone playBtn" title="Play" src="assets/svg/play.svg" alt="Play"></img>'+
	'<img class="pauseBtn" title="Pause" src="assets/svg/pause.svg" alt="Pause"></img>';
	
	playPauseContainer.style.pointerEvents = 'auto';
	playPauseContainer.onclick = function(e){
		let trg = e.target;
		if( e.target.children.length<2 ){ trg = e.target.parentElement; }
		let playBtn = trg.children[0];
		let pauseBtn = trg.children[1];
		if( playBtn.classList.contains('displayNone') ){
			c.l('PLAY '+patternId)
		} else if( pauseBtn.classList.contains('displayNone') ){
			c.l('PAUSE'+patternId)
		}
		playBtn.classList.toggle('displayNone');
		pauseBtn.classList.toggle('displayNone');
	}
	
	const hideEl = document.createElement('img');
	hideEl.src = "assets/svg/position.svg";
	hideEl.onclick = function(e){

	}

	containerHeader.appendChild( hideEl );
	containerHeader.appendChild( playPauseContainer );
	container.appendChild( containerHeader );
	return container;
}


let lastCellSelected;
let lastPtnSelected;
function createCell(title, value, channelIndex, row, resolution) {
	const cellDiv = document.createElement('div');
	cellDiv.classList.add('cell', title, 'clickable');

	if (title === 'pos' && channelIndex == 0) {
			cellDiv.innerHTML += getThreePartNumberHtml(row, resolution);
			return cellDiv
	} else {
		if (value === 0) {
			cellDiv.innerHTML += '<i>&nbsp</i>';
		} else if (value === 255 && title=='note') {
			cellDiv.innerHTML += '<strong>==</strong>';
		} else if (title === 'note') {
			cellDiv.innerHTML += getNoteHtml(value);
		} else if (title === 'volume') {
			cellDiv.innerHTML += '<span>' + (value < 16 ? '0' : '') + (value.toString(16).toUpperCase()) + '</span>';
		} else if (title === 'effect') {
			if(value) cellDiv.innerHTML += getEffectHtml(value);
		}
	}

	


	return cellDiv;
}


function renderPattern(patternData) {
    const container = createPatternContainer(patternData.config.id);
    const channelCount = patternData.length;
    const rowCount = patternData[0].length;

    patternRowElements[patternData.config.id] = {};

    const channelsDiv = document.createElement('div');
    channelsDiv.classList.add('channels');

    for (let row = 0; row < rowCount; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row', 'rowNr' + row);

        const beatStep = row * patternData.config.resolution / 96;

        if (beatStep % 4 === 0) {
            rowDiv.classList.add('beat4');
        } else if (beatStep % 1 === 0) {
            rowDiv.classList.add('beat1');
        }

        // Create cells for each channel in the current row
        for (let ch = 0; ch < channelCount; ch++) {
            const channelData = patternData[ch];
            const value = channelData[row]; // Get the entire row data for the channel

            // Create cells for 'pos', 'note', 'volume', 'effect'
            ['pos', 'note', 'volume', 'effect'].forEach((title, i) => {
								if( title==='pos' && ch!=0 ) return;
                const cellDiv = createCell(title, value[i-1], ch, row, patternData.config.resolution);
                rowDiv.appendChild(cellDiv);
            });
        }

        const propNameTicks = (row * patternData.config.resolution);
        if (!patternRowElements[patternData.config.id][propNameTicks]) {
            patternRowElements[patternData.config.id][propNameTicks] = [];
        }
        patternRowElements[patternData.config.id][propNameTicks] = rowDiv;
        channelsDiv.appendChild(rowDiv);

			}
			
			container.appendChild(channelsDiv);
			patternContainer.appendChild(container);
		//container.style.width = container.clientWidth+'px';
		//container.style.height = container.clientHeight+4+'px';
		//c.l(container.clientWidth, container.clientHeight, container)
}



/*	°°°°°°°°°°°°°°°°°°	*/
/*	°°°°	PUBLIC	°°°°	*/
/*	°°°°°°°°°°°°°°°°°°	*/
function setRowActive( patternId, posTicks ){
	//c.l( patternId, posTicks, patternData[patternId] )
	posTicks %= patternData[ patternId ][0].length * patternData[ patternId ].config.resolution;
	const activeRow = patternRowElements[ patternId ][ posTicks ];
	if( !activeRow ){ return;}
	if( activeRow.classList.contains( 'active' ) ){ return; }

	patternRowElements[ patternId ][ posTicks ].classList.add( 'active' );
	const lastActiveRow = patternRowElements[ patternId ].lastActiveRow;
	if( lastActiveRow ) lastActiveRow.classList.remove( 'active' );
	patternRowElements[ patternId ].lastActiveRow = activeRow;
	
}

function selectCell( e ) {
		//c.l("cell", row, title, channelIndex)
		if( lastCellSelected ) {
			lastCellSelected.classList.remove('selected'); 
			lastCellSelected.parentElement.classList.remove('selected');
			lastCellSelected.parentElement.parentElement.parentElement.classList.remove('selected');
		}
		e.target.classList.add('selected');
		e.target.parentElement.classList.add('selected');
		e.target.parentElement.parentElement.parentElement.classList.add('selected');
		lastCellSelected = e.target;
	}

function selectPattern( e ) {
	if( lastPtnSelected ){ lastPtnSelected.classList.remove("selected") }
	e.target.classList.add('selected');
	lastPtnSelected = e.target;
}


function createSongRow( data, patternIndex, songLength ){
	const patternEl = document.createElement('div');
	const patternIdEl = document.createElement('span');
	patternIdEl.innerText = 'I:'+patternIndex;
	patternIdEl.style.width = 32+'px';
	patternIdEl.style.display = 'inline-block';
	patternEl.appendChild(patternIdEl);
	patternEl.classList.add('songRow');//, 'patternId'+patternIndex);
	const tickWidth = (window.innerWidth-32)/ songLength;
	c.l('tickWidth',tickWidth, songLength, window.innerWidth)
	let prevPos = 0;
	data.forEach(function( stepData ){
		const stepEl = document.createElement('span');
		stepEl.classList.add( 'songStep','patternId'+patternIndex );
		stepEl.style.marginLeft = ((stepData[0]-prevPos)*tickWidth)+'px';
		stepEl.style.width = ( (stepData[1]-stepData[0]) * tickWidth)+'px';
		patternEl.appendChild( stepEl );
		prevPos = stepData[0];
	});
	return patternEl;
}

const songContainer = document.getElementById('song-container')
function renderSong( patternData ){
	let songLength = ((Math.random()*50)>>0)*24;
	let demoSongData = [];
	let songDataAmount = 16;//(Math.random()*32)>>0;
	demoSongData.songLength = songLength;

	for (let patternIndex = 0; patternIndex < patternData.length; patternIndex++) {
		let startPoint = 0;
		demoSongData[patternIndex] = [];
		for (let songStep = 0; songStep < songDataAmount; songStep++) {
			if(Math.random()>.5&& songStep!=0) startPoint+= ((Math.random()*8)>>0)*24;
			let endPoint = startPoint +  ((Math.random()*8)>>0)*24;
			if( startPoint < songLength && endPoint < songLength ){
				//if( songStep=songDataAmount-1) endPoint = songLength
				demoSongData[patternIndex].push([startPoint, endPoint]);
			} else { continue;  }
			startPoint = endPoint;
		}
		//demoSongData[patternIndex].push([startPoint, songLength]);
		songContainer.appendChild(
			createSongRow( demoSongData[patternIndex], patternIndex, songLength )
		);
	}
	c.l(demoSongData)



}

/*	$$$$$$$$$$$$$$$$$$$$$$	*/
/*	$$$$	MAIN OBJECT	$$$$	*/
/*	$$$$$$$$$$$$$$$$$$$$$$	*/
const PatternView = {
	render: renderPattern,
	renderAll: function( patternDataNew ){
		patternData = patternDataNew;
		patternData.forEach( renderPattern );
		renderSong( patternData );
		c.l("patternRowData", patternRowElements, patternData)
	},
	setRowActive,
	setRowsActive: function( patternIds, posTicks ){
		patternIds.forEach(function(patternId){
			setRowActive( patternId, posTicks );
		});
	},
	selectPattern,
	selectCell,
};

export default PatternView;
