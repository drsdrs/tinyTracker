function getMidiClockMilliseconds(bpm) {
    return 2500 / bpm; // 60000 / 24 = 2500
}

let bpm = 120; // Set your desired BPM
let timeout = getMidiClockMilliseconds(bpm);
let start = performance.now();
let bpmTickMs = 0;
let bpmTick = 0;

function measure() {
    let now = performance.now();
    bpmTickMs += now - start;
    start = now;

    if (bpmTickMs >= timeout) {
        console.log('Tick:', bpmTickMs.toFixed(5), 'Timeout:', timeout.toFixed(5), 'Drift:', (bpmTickMs - timeout).toFixed(5));
        bpmTickMs -= timeout; // Reset the elapsed time
        bpmTick++;
    }

    let remainingTime = (timeout - bpmTickMs)/3;   // Calculate the remaining time until the next tick
    if (remainingTime > 0) {
        setTimeout(measure, remainingTime);
    } else {	// If the drift is negative, we can call measure immediately
        measure();
    }
}

// Start the measurement
setTimeout(measure, timeout);
