class AudioData {
    constructor(filePath) {
        // 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
        this.audioCtx;

        // **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
        // 2 - WebAudio nodes that are part of our WebAudio audio routing graph
        this.element;
        this.sourceNode;
        this.analyserNode;
        this.gainNode;

        // 3 - here we are faking an enumeration
        this.DEFAULTS = Object.freeze({
            gain : .5,
            numSamples : 256
        });
    
        // 4 - create a new array of 8-bit integers (0-255)
        // this is a typed array to hold the audio frequency data
        this.audioData = new Uint8Array(this.DEFAULTS.numSamples/2);

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        // 2 - this creates an <audio> element
        this.element = new Audio();

        // 3 - have it point at a sound file
        this.element.src = filePath;

        // 4 - create an a source node that points at the <audio> element
        this.sourceNode = this.audioCtx.createMediaElementSource(this.element);

        // Create distortion filter
        this.lowShelfBiquadFilter = this.audioCtx.createBiquadFilter();
		this.lowShelfBiquadFilter.type = "lowshelf";

        // 5 - create an analyser node
        this.analyserNode = this.audioCtx.createAnalyser(); // note the UK spelling of "Analyser"

        /*
        // 6
        We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
        across the sound spectrum.

        If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
        the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
        the amplitude of that frequency.
        */ 

        // fft stands for Fast Fourier Transform
        this.analyserNode.fftSize = this.DEFAULTS.numSamples;

        // 7 - create a gain (volume) node
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.value = this.DEFAULTS.gain;

        // 8 - connect the nodes - we now have an audio graph
        this.sourceNode.connect(this.lowShelfBiquadFilter);
        this.lowShelfBiquadFilter.connect(this.analyserNode);
        this.analyserNode.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
    }

    loadSoundFile(filePath) {
        this.element.src = filePath;
    }
    
    setLoop(bool) {
        this.element.loop = bool;
    }
    
    playCurrentSound() {
        this.element.play();
    }
    
    pauseCurrentSound() {
        this.element.pause();
    }
    
    setVolume(value) {
        value = Number(value); // make sure that it's a Number rather than a String
        this.gainNode.gain.value = value;
    }

    // Used in demo 330-13A-audio-start
    toggleLowshelf(amount) {
        if (amount != 0) {
            this.lowShelfBiquadFilter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
            this.lowShelfBiquadFilter.gain.setValueAtTime(amount, this.audioCtx.currentTime);
        } else {
            this.lowShelfBiquadFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);
        }
    }
}

export {AudioData};