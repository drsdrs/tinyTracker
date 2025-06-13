let kbKeys = {};

function init( keyEventMap ){
	document.body.addEventListener('keydown', function(e){
		//e.preventDefault();
		kbKeys[e.key] = true;
		keyEventMap.forEach( keyMap=> {
			if( kbKeys[keyMap.key] ){
				if( keyMap.mod ){
					if( kbKeys[keyMap.mod] ){ keyMap.action();}
				}else{
					keyMap.action();
				}
			}
		});
	});
	
	document.body.addEventListener('keyup', function(e){
		//e.preventDefault();
		kbKeys[e.key] = false;
	});

}

const Key = {
	init,
}

export default Key;