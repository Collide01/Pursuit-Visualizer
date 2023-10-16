/*
  main.js is primarily responsible for hooking up the UI to the rest of the application 
  and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as audio from './audio.js';
import * as canvas from './canvas.js';
import * as utils from './utils.js';
let drawParams = {
  showGradient: 0, // 0 = original, 1 = audio with gradient, 2 = audio without gradient
  showBars: false,
  showLine: false,
  showCircles: false,
  showInvert: false,
  state: "gallery",
  currentlyPlaying: false,
  characterOpacity: 1,
  circleX: [],
  circleY: [],
  volume: 13
}

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
  sound1: "audio/gallery.wav",
  sound2: "audio/dramapound.wav",
  sound3: "audio/objectionPW.wav"
});

let presets = [];
let audioData;
let audioData2; // This will be used for the dramatic pound sound effect
let audioData3; // This will be used for the objection sound effects
let selectedSong; // Used to track which song is currently selected in the dropdown menu
let selectedSongURL;
let currentState; // Used to track which song is currently playing
let timer; // Used to control the amount of time objects are on the canvas
let fsButtonClicked;
let windowWidth;
let windowHeight;

const init = (loadedPresets) => {
  document.querySelector("html").style.overflow = 'hidden';
  document.querySelector("html").style.backgroundColor = 'black';
  document.querySelector("#start").onclick = start;
  presets = loadedPresets;
  let canvasElement = document.querySelector("#main-canvas");
  let canvasElement2 = document.querySelector("#song-select");
  let canvasElement3 = document.querySelector("#cover");

  // Make the canvas as tall or as wide as the document
  adjustCanvas(canvasElement, canvasElement2, canvasElement3);

  canvas.init(canvasElement);
  canvas.init2(canvasElement2);
  responsiveLoop();
}

const start = () => {
  audioData = new audio.AudioData(DEFAULTS.sound1);
  audioData.setLoop(true);
  audioData.playCurrentSound();
  audioData2 = new audio.AudioData(DEFAULTS.sound2); // This will be used for the dramatic pound sound effect
  audioData2.setLoop(false);
  audioData3 = new audio.AudioData(DEFAULTS.sound3); // This will be used for the objection sound effects
  audioData3.setLoop(false);
  document.querySelector("#start").classList.add("is-hidden");
  let canvasElement = document.querySelector("#main-canvas"); // hookup <canvas> element
  setupUI(canvasElement);
  canvas.setupCanvas(audioData.analyserNode);
  timer = 0;
  fsButtonClicked = false;
  loop();
}

const setupUI = (canvasElement) => {
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fs-button");
  const playButton = document.querySelector("#play-button");
  let fullscreen = document.querySelector("#fullscreen");

  // add .onclick event to button
  fsButton.onclick = e => {
    fsButtonClicked = true;
    if (fsButton.innerHTML == "Enter Full Screen") {
      utils.goFullscreen(fullscreen);
      canvas.isFullScreen(true);
      fsButton.innerHTML = "Exit Full Screen";
    }
    else {
      utils.exitFullscreen();
      canvas.isFullScreen(false);
      fsButton.innerHTML = "Enter Full Screen";
    }
  };

  // This is used if the user uses a key to exit full screen instead of the fsButton
  fullscreen.onfullscreenchange = e => {
    if (!fsButtonClicked) {
      if (fsButton.innerHTML == "Exit Full Screen") {
        utils.exitFullscreen();
        canvas.isFullScreen(false);
        fsButton.innerHTML = "Enter Full Screen";
      }
    }
    fsButtonClicked = false;
  };

  // add .onclick event to button
  playButton.onclick = e => {

    // check if context is in suspended state (autoplay policy)
    if (audioData.audioCtx.state == "suspended") {
      audioData.audioCtx.resume();
    }
    if (audioData2.audioCtx.state == "suspended") {
      audioData2.audioCtx.resume();
    }
    if (audioData3.audioCtx.state == "suspended") {
      audioData3.audioCtx.resume();
    }

    // Checks if the selected song in the list is the one currently playing
    if (selectedSong == currentState) {
      if (e.target.dataset.playing == "no") {
        // if track is currently paused, play it
        audioData.playCurrentSound();
        e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"
        drawParams.currentlyPlaying = true;
        // if track IS playing, pause it
      } else {
        audioData.pauseCurrentSound();
        e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
        drawParams.currentlyPlaying = false;
      }
    }
  };

  // C - hookup volume and opacity sliders & labels
  let volumeSlider = document.querySelector("#volume-slider");
  let opacitySlider = document.querySelector("#opacity-slider");
  let bassSlider = document.querySelector("#bass-slider");

  // add .oninput event to slider
  volumeSlider.oninput = e => {
    changeVolume(e.target.value);
  };
  opacitySlider.oninput = e => {
    changeOpacity(e.target.value);
  };
  bassSlider.oninput = e => {
    changeBass(e.target.value);
  };

  // set value of label to match initial value of sliders
  volumeSlider.dispatchEvent(new Event("input"));
  opacitySlider.dispatchEvent(new Event("input"));

  //D - hookup Track Select button
  let trackSelect = document.querySelector("#track-select");
  // add .onclick event to Track Select button
  trackSelect.onclick = canvas.enableSongSelect;

  let presetSelect = document.querySelector("#preset-select");
  presetSelect.onchange = e => {
    if (document.querySelector("#default").selected == true) {
      changeOpacity(presets[0].setOpacity);
      opacitySlider.value = presets[0].setOpacity;
      changeBass(presets[0].setBass);
      bassSlider.value = presets[0].setBass;
      drawParams.showGradient = presets[0].showGradient;
      drawParams.showBars = presets[0].showBars;
      drawParams.showLine = presets[0].showLine;
      drawParams.showCircles = presets[0].showCircles;
      drawParams.showInvert = presets[0].showInvert;
      document.querySelector("#original").checked = true;
      document.querySelector("#barsCB").checked = true;
      document.querySelector("#lineCB").checked = false;
      document.querySelector("#circlesCB").checked = false;
      document.querySelector("#invertCB").checked = false;
    }
    else if (document.querySelector("#custom-speedlines").selected == true) {
      changeOpacity(presets[1].setOpacity);
      opacitySlider.value = presets[1].setOpacity;
      changeBass(presets[1].setBass);
      bassSlider.value = presets[1].setBass;
      drawParams.showGradient = presets[1].showGradient;
      drawParams.showBars = presets[1].showBars;
      drawParams.showLine = presets[1].showLine;
      drawParams.showCircles = presets[1].showCircles;
      drawParams.showInvert = presets[1].showInvert;
      document.querySelector("#with-gradient").checked = true;
      document.querySelector("#barsCB").checked = false;
      document.querySelector("#lineCB").checked = false;
      document.querySelector("#circlesCB").checked = false;
      document.querySelector("#invertCB").checked = false;
    }
    else if (document.querySelector("#flood").selected == true) {
      changeOpacity(presets[2].setOpacity);
      opacitySlider.value = presets[2].setOpacity;
      changeBass(presets[2].setBass);
      bassSlider.value = presets[2].setBass;
      drawParams.showGradient = presets[2].showGradient;
      drawParams.showBars = presets[2].showBars;
      drawParams.showLine = presets[2].showLine;
      drawParams.showCircles = presets[2].showCircles;
      drawParams.showInvert = presets[2].showInvert;
      document.querySelector("#with-gradient").checked = true;
      document.querySelector("#barsCB").checked = true;
      document.querySelector("#lineCB").checked = true;
      document.querySelector("#circlesCB").checked = true;
      createCircles();
      document.querySelector("#invertCB").checked = true;
    }
    else if (document.querySelector("#disco").selected == true) {
      changeOpacity(presets[3].setOpacity);
      opacitySlider.value = presets[3].setOpacity;
      changeBass(presets[3].setBass);
      bassSlider.value = presets[3].setBass;
      drawParams.showGradient = presets[3].showGradient;
      drawParams.showBars = presets[3].showBars;
      drawParams.showLine = presets[3].showLine;
      drawParams.showCircles = presets[3].showCircles;
      drawParams.showInvert = presets[3].showInvert;
      document.querySelector("#without-gradient").checked = true;
      document.querySelector("#barsCB").checked = true;
      document.querySelector("#lineCB").checked = true;
      document.querySelector("#circlesCB").checked = true;
      createCircles();
      document.querySelector("#invertCB").checked = false;
    }
    document.querySelector("#preset").selected = true;
  };

  // checkboxes
  let original = document.querySelector("#original");
  original.onclick = e => {
    drawParams.showGradient = 0;
  };
  let withGradient = document.querySelector("#with-gradient");
  withGradient.onclick = e => {
    drawParams.showGradient = 1;
  };
  let withoutGradient = document.querySelector("#without-gradient");
  withoutGradient.onclick = e => {
    drawParams.showGradient = 2;
  };
  barsCB.onclick = e => {
    if (barsCB.checked == true) {
      drawParams.showBars = true;
    } else {
      drawParams.showBars = false;
    }
  };
  lineCB.onclick = e => {
    if (lineCB.checked == true) {
      drawParams.showLine = true;
    } else {
      drawParams.showLine = false;
    }
  };
  circlesCB.onclick = e => {
    if (circlesCB.checked == true) {
      drawParams.showCircles = true;
      createCircles();
    } else {
      drawParams.showCircles = false;
    }
  };
  invertCB.onclick = e => {
    if (invertCB.checked == true) {
      drawParams.showInvert = true;
    } else {
      drawParams.showInvert = false;
    }
  };

  // Handle mouse events
  canvasElement.onclick = canvas.canvasClicked;
  canvasElement.onmousemove = canvas.canvasHoveredOver;
  canvasElement.onmouseout = canvas.canvasMouseLeft;

  let canvasElement2 = document.querySelector("#song-select");
  canvasElement2.onclick = canvas.selectCanvasClicked;
  canvasElement2.onmousemove = canvas.selectCanvasHoveredOver;
  canvasElement2.onmouseout = canvas.selectCanvasMouseLeft;

  document.querySelector("#controls").onclick = canvas.controlsClicked;
} // end setupUI

const responsiveLoop = () => {
  requestAnimationFrame(responsiveLoop);
  
  let mainCanvas = document.querySelector("#main-canvas");
  let selectCanvas = document.querySelector("#song-select");
  let cover = document.querySelector("#cover");

  // Make the canvas as tall or as wide as the document
  windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  if (parseFloat(windowWidth) > 1023) {
    windowHeight -= 80; // 5rem = 80px
  }
  else {
    windowHeight -= 48; // 3rem = 48px
  }
  let fsButton = document.querySelector("#fs-button");
  if (windowWidth < windowHeight) {
    fsButton.disabled = true;
  }
  else {
    fsButton.disabled = false;
  }

  adjustCanvas(mainCanvas, selectCanvas, cover);
};

const loop = () => {
  requestAnimationFrame(loop);
  
  canvas.draw(drawParams);
  if (!canvas.selectHidden) {
    document.querySelector(".is-ancestor").style.pointerEvents = "none";
  }
  else {
    document.querySelector(".is-ancestor").style.pointerEvents = "auto";
  }

  // Calls an objection and starts the timer for it
  if (drawParams.state == "objection") {
    document.querySelector("#controls").classList.add("is-hidden");
    timer++;
  }
  if (timer >= 80) {
    if (selectedSong == "cornered") {
      drawParams.state = "yellPW";
    }
    else if (selectedSong == "questioned") {
      drawParams.state = "yellF";
    }
    else if (selectedSong == "caught") {
      drawParams.state = "yellG";
    }
    else if (selectedSong == "overtaken") {
      drawParams.state = "yellAJ";
    }
    else if (selectedSong == "lying") {
      drawParams.state = "yellME";
    }
    else if (selectedSong == "truth") {
      drawParams.state = "yellGE";
    }

    if (barsCB.checked == true) {
      drawParams.showBars = true;
    }
    if (circlesCB.checked == true) {
      drawParams.showCircles = true;
      createCircles();
    }
    document.querySelector("#controls").classList.remove("is-hidden");
    audioData.playCurrentSound();
    audioData2.playCurrentSound();
    drawParams.currentlyPlaying = true;
    currentState = selectedSong;
    timer = 0;
  }

  // Checks if the button in the Gallery was clicked
  if (canvas.isGallery && canvas.controlsHidden) {
    selectedSongURL = "audio/SongCornered.wav";
    audioData.loadSoundFile("audio/SongCornered.wav");
    audioData3.loadSoundFile("audio/ObjectionPW.wav");
    audioData3.playCurrentSound();
    drawParams.state = "objection";
    selectedSong = "cornered";
    document.querySelector("#preset-list").classList.remove("is-hidden");
    document.querySelector("#vfx").classList.remove("is-hidden");
    document.querySelector("#vfx2").classList.remove("is-hidden");
    const playButton = document.querySelector("#play-button");
    playButton.dataset.playing = "yes"; // our CSS will set the text to "Pause"
  }

  if (canvas.highlightedSong == "cornered") {
    audioData3.loadSoundFile("audio/ObjectionPW.wav");
  }
  else if (canvas.highlightedSong == "questioned") {
    audioData3.loadSoundFile("audio/ObjectionF.wav");
  }
  else if (canvas.highlightedSong == "caught") {
    audioData3.loadSoundFile("audio/ObjectionG.wav");
  }
  else if (canvas.highlightedSong == "overtaken") {
    audioData3.loadSoundFile("audio/ObjectionAJ.wav");
  }
  else if (canvas.highlightedSong == "lying") {
    audioData3.loadSoundFile("audio/ObjectionME.wav");
  }
  else if (canvas.highlightedSong == "truth") {
    audioData3.loadSoundFile("audio/ObjectionGE.wav");
  }

  if (canvas.selectedSong == "cornered") {
    selectedSong = "cornered";
    audioData.pauseCurrentSound();
    audioData.loadSoundFile("audio/SongCornered.wav");
    audioData3.playCurrentSound();
    songChanged();
  }
  else if (canvas.selectedSong == "questioned") {
    selectedSong = "questioned";
    audioData.pauseCurrentSound();
    audioData.loadSoundFile("audio/SongQuestioned.wav");
    audioData3.playCurrentSound();
    songChanged();
  }
  else if (canvas.selectedSong == "caught") {
    selectedSong = "caught";
    audioData.pauseCurrentSound();
    audioData.loadSoundFile("audio/SongCaught.wav");
    audioData3.playCurrentSound();
    songChanged();
  }
  else if (canvas.selectedSong == "overtaken") {
    selectedSong = "overtaken";
    audioData.pauseCurrentSound();
    audioData.loadSoundFile("audio/SongOvertaken.wav");
    audioData3.playCurrentSound();
    songChanged();
  }
  else if (canvas.selectedSong == "lying") {
    selectedSong = "lying";
    audioData.pauseCurrentSound();
    audioData.loadSoundFile("audio/SongLyingColdly.wav");
    audioData3.playCurrentSound();
    songChanged();
  }
  else if (canvas.selectedSong == "truth") {
    selectedSong = "truth";
    audioData.pauseCurrentSound();
    audioData.loadSoundFile("audio/SongFindTruth.wav");
    audioData3.playCurrentSound();
    songChanged();
  }
};

const songChanged = () => {
  audioData2.loadSoundFile("audio/dramapound.wav");
  let playButton = document.querySelector("#play-button");
  playButton.dataset.playing = "yes";
  drawParams.state = "objection";
  drawParams.currentlyPlaying = false;
  drawParams.showBars = false;
  drawParams.showCircles = false;
};

const createCircles = () => {
  for (let i = 0; i < 255; i++) {
    let x;
    let y;
    for (let j = 0; j < (Math.random() * 15); j++) {
      x = Math.random() * 960;
      y = Math.random() * 640;
    }
    drawParams.circleX[i] = x;
    drawParams.circleY[i] = y;
  }
};

const changeVolume = (volume) => {
  // set the gain
  audioData.setVolume(volume);
  audioData2.setVolume(volume);
  audioData3.setVolume(volume);
  // update value of label to match value of slider
  let volumeLabel = document.querySelector("#volume-label");
  volumeLabel.innerHTML = Math.round((volume * 100));
  drawParams.volume = Math.round((volume * 100));
};

const changeOpacity = (opacity) => {
  drawParams.characterOpacity = opacity;
  // update value of label to match value of slider
  let opacityLabel = document.querySelector("#opacity-label");
  opacityLabel.innerHTML = opacity;
};

const changeBass = (bass) => {
  audioData.toggleLowshelf(bass);
  // update value of label to match value of slider
  let bassLabel = document.querySelector("#bass-label");
  bassLabel.innerHTML = bass;
};

const adjustCanvas = (mainCanvas, selectCanvas, cover) => {
  // Determines the height of the document and canvas with the navbar
  let canvasHeight = parseFloat(mainCanvas.offsetHeight);
  if (parseFloat(windowWidth) > 1023) {
    windowHeight += 80; // 5rem = 80px; 80 * 4 = 320
    canvasHeight += 80;
  }
  else {
    windowHeight += 48; // 3rem = 48px; 48 * 4 = 192
    canvasHeight += 48;
  }

  // Make the canvas as tall or as wide as the document, along with corresponding elements
  if (windowWidth > windowHeight && windowHeight <= canvasHeight) {
    if (!canvas.isFullscreen) {
      if (parseFloat(windowWidth) > 1023) {
        mainCanvas.style.height = "calc(100vh - 5rem)";
        mainCanvas.style.height = "-o-calc(100vh - 5rem)"; /* opera */
        mainCanvas.style.height = "-webkit-calc(100vh - 5rem)"; /* google, safari */
        mainCanvas.style.height = "-moz-calc(100vh - 5rem)"; /* firefox */
        mainCanvas.style.width = `${960 * (parseFloat(mainCanvas.offsetHeight) / 640.0)}px`;
        document.querySelector("#start").style.top = `calc(${(3 * parseFloat(mainCanvas.offsetHeight) / 5)}px + 5rem)`;
        document.querySelector("#start").style.fontSize = (parseFloat(mainCanvas.offsetHeight) / 640.0) * 200.0 + '%';
      }
      else {
        mainCanvas.style.height = "calc(100vh - 3rem)";
        mainCanvas.style.height = "-o-calc(100vh - 3rem)"; /* opera */
        mainCanvas.style.height = "-webkit-calc(100vh - 3rem)"; /* google, safari */
        mainCanvas.style.height = "-moz-calc(100vh - 3rem)"; /* firefox */
        mainCanvas.style.width = `${960 * (parseFloat(mainCanvas.offsetHeight) / 640.0)}px`;
        document.querySelector("#start").style.top = `calc(${(3 * parseFloat(mainCanvas.offsetHeight) / 5)}px + 3rem)`;
        document.querySelector("#start").style.fontSize = (parseFloat(mainCanvas.offsetHeight) / 640.0) * 200.0 + '%';
      }
    }
    else {
      mainCanvas.style.height = "100vh";
      mainCanvas.style.width = `${960 * (parseFloat(mainCanvas.offsetHeight) / 640.0)}px`;
    }
    document.querySelector("#fs-button").disabled = false;
  }
  else {
    mainCanvas.style.width = "100vw";
    mainCanvas.style.height = `${640 * (parseFloat(mainCanvas.offsetWidth) / 960.0)}px`;
    if (parseFloat(windowWidth) > 1023) {
      document.querySelector("#start").style.top = `calc(${(3 * parseFloat(mainCanvas.offsetHeight) / 5)}px + 5rem)`;
    }
    else {
      document.querySelector("#start").style.top = `calc(${(3 * parseFloat(mainCanvas.offsetHeight) / 5)}px + 3rem)`;
    }
    document.querySelector("#start").style.fontSize = (parseFloat(mainCanvas.offsetHeight) / 640.0) * 200.0 + '%';
    document.querySelector("#fs-button").disabled = true;
  }

  selectCanvas.style.width = 729 * (parseFloat(mainCanvas.offsetHeight) / 640) + 'px';
  selectCanvas.style.height = 307 * (parseFloat(mainCanvas.offsetHeight) / 640) + 'px';

  cover.style.height = mainCanvas.offsetHeight;
  cover.style.width = "100vw";
};

export { init };