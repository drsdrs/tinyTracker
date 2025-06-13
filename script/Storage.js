const DEBUG = true;
const storagePrgPrefix = '_prg_';
let appName = 'UndefinedAppName';
let c;
if( DEBUG ){
  c = console;
  c.l = c.log;
} else {
  c = { log: function(){} };
  c.l = c.log;
}


function getPrgList() {
  const data = localStorage.getItem('prgList');
  return data ? JSON.parse(data) : [];
}

function setPrgList(prgList) {
  localStorage.setItem('prgList', JSON.stringify(prgList));
}

function getActivePrgName() {
  let name = localStorage.getItem('activePrgName');
  if (name) return name;

  const prgList = getPrgList();
  if (prgList.length > 0) {
    name = prgList[0];
    setActivePrgName(name);
    return name;
  }

  throw new Error("No active program name found and prgList is empty");
}

function setActivePrgName(name) {
  c.log('setActivePrgName', name);
  localStorage.setItem('activePrgName', name);
}

function addToPrgList(name) {
  const prgList = getPrgList();
  if ( !prgList.includes(name) ) {
    prgList.push(name);
    setPrgList(prgList);
  }
}

function removeFromPrgList(name) {
  const prgList = getPrgList().filter(n => n !== name);
  setPrgList(prgList);
}

function savePrg(name, codeObj, fpsIndex, scaleIndex) {
  if (typeof name !== 'string' || !name.trim()) {
    console.warn('[Storage.savePrg] Invalid program name:', name);
    throw new Error('Invalid program name');
  }

  addToPrgList(name);
  localStorage.setItem(appName+storagePrgPrefix + name, JSON.stringify(codeObj));

  c.log(`[Storage.savePrg] Saved "${name}" with FPS index ${fpsIndex}, Scale index ${scaleIndex}`);
}


function loadPrg(name) {
  const json = localStorage.getItem(appName+storagePrgPrefix + name);
  //c.l("loading "+name+', res:',json)
  if (!json) {
    throw new Error(`No program found with name: ${name}`);
  }
  return JSON.parse(json);
}

function removePrg() {
  const name = getActivePrgName();
  removeFromPrgList(name);
  localStorage.removeItem(appName+storagePrgPrefix + name);

  const prgList = getPrgList();
  if (prgList.length === 0) {
    savePrg('New', { title: 'Empty' });
    setActivePrgName( 'New' );
  } else {
    setActivePrgName( prgList[0] );
  }
}

// -- DEMO LOADING --
async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

async function parseAndSaveDemo(name, text) {
  try {
    savePrg(name, { title, setup, preLoop, loop}, fps, scale );
  } catch (err) {
    console.error(`Error parsing demo "${name}":`, err);
  }
}

async function loadAndSaveDemos( demoPrgFileUrls ) {
  await Promise.all(
    demoPrgFileUrls.map(async (name) => {
      try {
        const code = await loadText(`./script/templates/${name}.coffee`);
        await parseAndSaveDemo(name, code);
      } catch (err) {
        console.error(`Failed to load demo ${name}:`, err);
      }
    })
  );
}

function initPrgList() {
  if (localStorage.getItem('prgList') == null) {
    setPrgList([]);
  }
}


const Storage = {
  init: async function ( appNameNew = 'UndefinedAppName', demoPrgFileUrls = [] ) {
    appName = appNameNew;
    initPrgList();
    await loadAndSaveDemos( demoPrgFileUrls );
    return;
  },

  save: savePrg,
  load: loadPrg,
  remove: removePrg,
  delete: removePrg, // alias
  list: getPrgList,
  getActivePrgName,
  setActivePrgName,
  getActivePrgIndex: () => getPrgList().indexOf(getActivePrgName()),
};

export default Storage;
