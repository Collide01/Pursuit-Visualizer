/*
    The purpose of this file is to take in the analyser node and a <canvas> element: 
      - the module will create a drawing context that points at the <canvas> 
      - it will store the reference to the analyser node
      - in draw(), it will loop through the data in the analyser node
      - and then draw something representative on the canvas
      - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx, ctx2, canvasWidth, canvasHeight, gradient, analyserNode, audioData;
let gallery = document.querySelector("#gallery");
let objection = document.querySelector("#objection");
let speedlines = document.querySelector("#speedlines");
let speedlines2 = document.querySelector("#speedlines2");
let textbox = document.querySelector("#textbox");
let yellAJ = document.querySelector("#yellAJ");
let yellF = document.querySelector("#yellF");
let yellG = document.querySelector("#yellG");
let yellGE = document.querySelector("#yellGE");
let yellME = document.querySelector("#yellME");
let yellPW = document.querySelector("#yellPW");
let buttonBack = document.querySelector("#button-back");
let buttonArrow = document.querySelector("#button-arrow");
let selectSong = document.querySelector("#select-song");
let option = document.querySelector("#option");
let selected = document.querySelector("#selected");
let mugshotAJ = document.querySelector("#mugshotAJ");
let mugshotF = document.querySelector("#mugshotF");
let mugshotG = document.querySelector("#mugshotG");
let mugshotGE = document.querySelector("#mugshotGE");
let mugshotME = document.querySelector("#mugshotME");
let mugshotPW = document.querySelector("#mugshotPW");
let point = document.querySelector("#point");
// The following timers are used for GIF animations
let galleryTimer = 0;
let objectionTimer = 0;
let speedLinesTimer = 0;
let blinkTimer = 0;

let previousState = "gallery";
let isGallery = false;
let isFullscreen = false;

// The following 4 variables are used for the audio-based speedlines
let prevPosition = [];
let speedlinesAudio = [];
let alreadyHigher = [];
let n = 0;

let mouseOverButton = false; // Used for the Hide Controls button
let controlsHidden = false;
let controlsOffset = 0; // Makes the controls move downwards when the Hide Controls button is clicked

let highlightedSong = ""; // Used for when the user hovers over a song from the Select Track menu
let selectedSong = ""; // Used for when the user selects a song from the Select Track menu
let selectOffset = 0; // Makes the Select Track menu move upwards when the Select Track button is clicked
let selectHidden = true;
let volume;

const init = (canvasElement) => {
    // create drawing context
    ctx = canvasElement.getContext("2d");
    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;

    // Text for the title screen
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = `bold ${(100 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
    ctx.textBaseline = 'top';
    ctx.fillText("Pursuit ~ Visualizer", (canvasWidth / 2) - (425 * (canvasWidth / 960)), 220 * (canvasWidth / 960));
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = `${(60 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
    ctx.textBaseline = 'top';
    ctx.fillText("By: Collin Strauch", (canvasWidth / 2) - (250 * (canvasWidth / 960)), 315 * (canvasWidth / 960));
    ctx.drawImage(point, 0, 365 * (canvasWidth / 960), 953 / 2  * (canvasWidth / 960), 569 / 2  * (canvasWidth / 960));
    ctx.restore();
}

const init2 = (canvasElement) => {
    // create drawing context
    ctx2 = canvasElement.getContext("2d");

    let canvas = document.querySelector("#main-canvas");
    canvasElement.style.top = parseFloat(canvas.offsetHeight);
    canvasElement.style.height = 307 * (parseFloat(canvas.offsetHeight) / 640) + 'px';
    canvasElement.style.left = '50%';
    canvasElement.style.marginLeft = -(parseFloat(canvasElement.offsetWidth) / 2) + 'px';

    // Create menu for the song select
    ctx2.save();
    ctx2.drawImage(selectSong, 0, 0, 729 * (canvasWidth / 960), 307 * (canvasHeight / 640));

    ctx2.fillStyle = "black";
    ctx2.font = `${(16 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
    ctx2.textBaseline = 'top';
    ctx2.fillText("Select Track", 5 * (canvasWidth / 960), 4 * (canvasWidth / 960));

    ctx2.font = `${(16 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
    ctx2.fillText("Cancel", 660 * (canvasWidth / 960), 290 * (canvasWidth / 960));
    ctx2.restore();
}

const setupCanvas = (analyserNodeRef) => {
    // create a gradient that runs top to bottom
    gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "#00ddef" }, { percent: .15, color: "#00f5e7" }, { percent: .20, color: "#58feed" }, { percent: .80, color: "#00f5e7" }, { percent: .85, color: "#00ddef" }, { percent: 1, color: "#00ddef" }]);
    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);
}

const draw = (params = {}) => {
    volume = params.volume;
    let canvas = document.querySelector("#main-canvas");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    // 1 - populate the audioData array with the frequency data from the analyserNode
    // notice these arrays are passed "by reference" 
    analyserNode.getByteFrequencyData(audioData);
    // OR
    //analyserNode.getByteTimeDomainData(audioData); // waveform data

    // 2 - draw image
    switch (params.state) {
        // Displays the gallery
        case "gallery":
            previousState = "gallery";
            isGallery = true;
            galleryTimer++;
            if (volume != 0) {
                speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
            }
            for (let i = 0; i < speedlinesAudio.length; i++) {
                speedlinesAudio.pop();
            }
            ctx.save();
            //Draw the gallery
            if (galleryTimer >= 0 && galleryTimer < 48) {
                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(gallery, Math.floor(galleryTimer / 12) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                // Resets the animation
                galleryTimer = 0;
                ctx.drawImage(gallery, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }

            // Draw the button
            if (!mouseOverButton) {
                ctx.drawImage(buttonBack, 0, 0, 840, 464, canvasWidth/2-(630/2), canvasHeight/2-(348/2), 630 * (canvasWidth / 960), 348 * (canvasWidth / 960));
            }
            else {
                ctx.drawImage(buttonBack, 840, 0, 840, 464, canvasWidth/2-(630/2), canvasHeight/2-(348/2), 630 * (canvasWidth / 960), 348 * (canvasWidth / 960));
            }
            // Uses the speed lines timer to animate the button arrow
            if (speedLinesTimer >= 0 && speedLinesTimer < 27) {
                ctx.drawImage(buttonArrow, Math.floor(speedLinesTimer / 3) * 630, 0, 630, 348, canvasWidth/2-(630/2), canvasHeight/2-(348/2), 630 * (canvasWidth / 960), 348 * (canvasWidth / 960));
            }
            else {
                speedLinesTimer = 0;
                ctx.drawImage(buttonArrow, 0, 0, 630, 348, canvasWidth/2-(630/2), canvasHeight/2-(348/2), 630 * (canvasWidth / 960), 348 * (canvasWidth / 960));
            }
            ctx.restore();
            break;
        // Displays the Objection bubble
        case "objection":
            canvasMouseLeft();
            isGallery = false;
            controlsHidden = false;
            selectHidden = true;
            highlightedSong = "";
            selectedSong = "";
            selectOffset = 0;
            objectionTimer++;
            // Removes all custom speed lines
            for (let i = 0; i < speedlinesAudio.length; i++) {
                speedlinesAudio.pop();
            }
            let maxTimer = 100; // Used to determine how fast the original speedlines go; based on volume
            if (volume >= 0 && volume < 10) maxTimer = 100;
            else if (volume >= 10 && volume < 20) maxTimer = 90;
            else if (volume >= 20 && volume < 30) maxTimer = 80;
            else if (volume >= 30 && volume < 40) maxTimer = 70;
            else if (volume >= 40 && volume < 50) maxTimer = 60;
            else if (volume >= 50 && volume < 60) maxTimer = 50;
            else if (volume >= 60 && volume < 70) maxTimer = 40;
            else if (volume >= 70 && volume < 80) maxTimer = 30;
            else if (volume >= 80 && volume < 90) maxTimer = 20;
            else if (volume >= 90 && volume <= 100) maxTimer = 10;

            ctx.save();
            // Keeps specific elements displayed in the background depending on the state
            if (params.showGradient != 1 && previousState != "gallery") {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.save();
                ctx.fillStyle = "black";
                ctx.globalAlpha = 1;
                ctx.fillRect(0,0,canvasWidth,canvasHeight);
                ctx.restore();
            }
            else {
                ctx.save();
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                ctx.restore();
            }
            switch (previousState) {
                case "gallery":
                    ctx.drawImage(gallery, Math.floor(galleryTimer / 12) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    break;
                case "yellAJ":
                    if (params.showGradient == 0) {
                        ctx.drawImage(speedlines, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    }
                    ctx.globalAlpha = params.characterOpacity;
                    ctx.drawImage(yellAJ, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    ctx.globalAlpha = 1;
                    break;
                case "yellF":
                    if (params.showGradient == 0) {
                        ctx.drawImage(speedlines2, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    }
                    ctx.globalAlpha = params.characterOpacity;
                    ctx.drawImage(yellF, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    ctx.globalAlpha = 1;
                    break;
                case "yellG":
                    if (params.showGradient == 0) {
                        ctx.drawImage(speedlines2, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    }
                    ctx.globalAlpha = params.characterOpacity;
                    ctx.drawImage(yellG, 0, 0, canvasWidth, canvasHeight);
                    ctx.globalAlpha = 1;
                    break;
                case "yellGE":
                    if (params.showGradient == 0) {
                        ctx.drawImage(speedlines, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    }
                    ctx.globalAlpha = params.characterOpacity;
                    ctx.drawImage(yellGE, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    ctx.globalAlpha = 1;
                    break;
                case "yellME":
                    if (params.showGradient == 0) {
                        ctx.drawImage(speedlines, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    }
                    ctx.globalAlpha = params.characterOpacity;
                    ctx.drawImage(yellME, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    ctx.globalAlpha = 1;
                    break;
                case "yellPW":
                    if (params.showGradient == 0) {
                        ctx.drawImage(speedlines, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    }
                    ctx.globalAlpha = params.characterOpacity;
                    ctx.drawImage(yellPW, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                    ctx.globalAlpha = 1;
                    break;
            }

            // Animates the Objection bubble by shifting it back and forth
            if (objectionTimer >= 2 && objectionTimer < 4) {
                ctx.translate(-8, 0);
            }
            else if (objectionTimer >= 4 && objectionTimer < 8) {
                ctx.translate(8, 0);
            }
            else if (objectionTimer >= 8 && objectionTimer < 12) {
                ctx.translate(-8, 0);
            }
            else if (objectionTimer >= 12 && objectionTimer < 16) {
                ctx.translate(8, 0);
            }
            else if (objectionTimer >= 16 && objectionTimer < 20) {
                ctx.translate(-8, 0);
            }
            else if (objectionTimer >= 20 && objectionTimer < 24) {
                ctx.translate(8, 0);
            }
            else if (objectionTimer >= 24 && objectionTimer < 28) {
                ctx.translate(-8, 0);
            }
            else if (objectionTimer >= 28 && objectionTimer < 30) {
                ctx.translate(8, 0);
            }
            ctx.drawImage(objection, 0, 0, canvasWidth, canvasHeight);
            ctx.restore();
            break;
        // Displays Apollo Justice
        case "yellAJ":
            previousState = "yellAJ";
            galleryTimer = 0;
            objectionTimer = 0;
            // Pauses the speedlines if the music stopped
            if (params.currentlyPlaying) {
                if (volume != 0) {
                    speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
                }
            }
            blinkTimer++;
            ctx.save();

            // Draws all of the effects in a specific order
            // Draws speedlines first
            drawSpeedlines(params.showGradient, params.currentlyPlaying, true);
            // Draw circles second
            if (params.showCircles) {
                drawCircles(params.circleX, params.circleY);
            }
            // Draw bars third
            if (params.showBars) {
                if (params.showGradient == 1 || params.showGradient == 0) {
                    drawBars(params.state, false);
                }
                else {
                    drawBars(params.state, true);
                }
            }
            // Draw electric line fourth
            if (params.showLine && (speedLinesTimer % 6 == 0 || speedLinesTimer % 6 == 1 || !params.currentlyPlaying || volume == 0)) {
                drawElectricLine();
            }
            // Draw Apollo Justice fifth
            ctx.globalAlpha = params.characterOpacity;
            if (blinkTimer >= 0 && blinkTimer < 16) {
                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(yellAJ, Math.floor(blinkTimer / 4) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else if (blinkTimer >= 180) {
                blinkTimer = 0;
                ctx.drawImage(yellAJ, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                ctx.drawImage(yellAJ, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            break;
        // Displays Franziska von Karma
        case "yellF":
            previousState = "yellF";
            galleryTimer = 0;
            objectionTimer = 0;
            // Pauses the speedlines if the music stopped
            if (params.currentlyPlaying) {
                if (volume != 0) {
                    speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
                }
            }
            blinkTimer++;
            ctx.save();

            // Draws all of the effects in a specific order
            // Draws speedlines first
            drawSpeedlines(params.showGradient, params.currentlyPlaying, false);
            // Draw circles second
            if (params.showCircles) {
                drawCircles(params.circleX, params.circleY);
            }
            // Draw bars third
            if (params.showBars) {
                if (params.showGradient == 1 || params.showGradient == 0) {
                    drawBars(params.state, false);
                }
                else {
                    drawBars(params.state, true);
                }
            }
            // Draw electric line fourth
            if (params.showLine && (speedLinesTimer % 6 == 0 || speedLinesTimer % 6 == 1 || !params.currentlyPlaying || volume == 0)) {
                drawElectricLine();
            }
            // Draw Franziska von Karma fifth
            ctx.globalAlpha = params.characterOpacity;
            if (blinkTimer >= 0 && blinkTimer < 16) {
                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(yellF, Math.floor(blinkTimer / 4) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else if (blinkTimer >= 180) {
                blinkTimer = 0;
                ctx.drawImage(yellF, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                ctx.drawImage(yellF, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            break;
        // Displays Godot
        case "yellG":
            previousState = "yellG";
            galleryTimer = 0;
            objectionTimer = 0;
            // Pauses the speedlines if the music stopped
            if (params.currentlyPlaying) {
                if (volume != 0) {
                    speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
                }
            }
            ctx.save();

            // Draws all of the effects in a specific order
            // Draws speedlines first
            drawSpeedlines(params.showGradient, params.currentlyPlaying, false);
            // Draw circles second
            if (params.showCircles) {
                drawCircles(params.circleX, params.circleY);
            }
            // Draw bars third
            if (params.showBars) {
                if (params.showGradient == 1 || params.showGradient == 0) {
                    drawBars(params.state, false);
                }
                else {
                    drawBars(params.state, true);
                }
            }
            // Draw electric line fourth
            if (params.showLine && (speedLinesTimer % 6 == 0 || speedLinesTimer % 6 == 1 || !params.currentlyPlaying || volume == 0)) {
                drawElectricLine();
            }
            // Draw Godot fifth
            ctx.globalAlpha = params.characterOpacity;
            ctx.drawImage(yellG, 0, 0, canvasWidth, canvasHeight);
            ctx.globalAlpha = 1;
            ctx.restore();
            break;
        // Displays Gregory Edgeworth
        case "yellGE":
            previousState = "yellGE";
            galleryTimer = 0;
            objectionTimer = 0;
            // Pauses the speedlines if the music stopped
            if (params.currentlyPlaying) {
                if (volume != 0) {
                    speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
                }
            }
            blinkTimer++;
            ctx.save();

            // Draws all of the effects in a specific order
            // Draws speedlines first
            drawSpeedlines(params.showGradient, params.currentlyPlaying, true);
            // Draw circles second
            if (params.showCircles) {
                drawCircles(params.circleX, params.circleY);
            }
            // Draw bars third
            if (params.showBars) {
                if (params.showGradient == 1 || params.showGradient == 0) {
                    drawBars(params.state, false);
                }
                else {
                    drawBars(params.state, true);
                }
            }
            // Draw electric line fourth
            if (params.showLine && (speedLinesTimer % 6 == 0 || speedLinesTimer % 6 == 1 || !params.currentlyPlaying || volume == 0)) {
                drawElectricLine();
            }
            // Draw Gregory Edgeworth fifth
            ctx.globalAlpha = params.characterOpacity;
            if (blinkTimer >= 0 && blinkTimer < 16) {
                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(yellGE, Math.floor(blinkTimer / 4) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else if (blinkTimer >= 180) {
                blinkTimer = 0;
                ctx.drawImage(yellGE, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                ctx.drawImage(yellGE, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            break;
        // Displays Miles Edgeworth
        case "yellME":
            previousState = "yellME";
            galleryTimer = 0;
            objectionTimer = 0;
            // Pauses the speedlines if the music stopped
            if (params.currentlyPlaying) {
                if (volume != 0) {
                    speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
                }
            }
            blinkTimer++;
            ctx.save();

            // Draws all of the effects in a specific order
            // Draws speedlines first
            drawSpeedlines(params.showGradient, params.currentlyPlaying, true);
            // Draw circles second
            if (params.showCircles) {
                drawCircles(params.circleX, params.circleY);
            }
            // Draw bars third
            if (params.showBars) {
                if (params.showGradient == 1 || params.showGradient == 0) {
                    drawBars(params.state, false);
                }
                else {
                    drawBars(params.state, true);
                }
            }
            // Draw electric line fourth
            if (params.showLine && (speedLinesTimer % 6 == 0 || speedLinesTimer % 6 == 1 || !params.currentlyPlaying || volume == 0)) {
                drawElectricLine();
            }
            // Draw Miles Edgeworth fifth
            ctx.globalAlpha = params.characterOpacity;
            if (blinkTimer >= 0 && blinkTimer < 16) {
                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(yellME, Math.floor(blinkTimer / 4) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else if (blinkTimer >= 180) {
                blinkTimer = 0;
                ctx.drawImage(yellME, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                ctx.drawImage(yellME, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            break;
        // Displays Phoenix Wright
        case "yellPW":
            previousState = "yellPW";
            galleryTimer = 0;
            objectionTimer = 0;
            // Pauses the speedlines if the music stopped
            if (params.currentlyPlaying) {
                if (volume != 0) {
                    speedLinesTimer++; // Using this for the button to prevent creating unnecessary variables
                }
            }
            blinkTimer++;
            ctx.save();

            // Draws all of the effects in a specific order
            // Draws speedlines first
            drawSpeedlines(params.showGradient, params.currentlyPlaying, true);
            // Draw circles second
            if (params.showCircles) {
                drawCircles(params.circleX, params.circleY);
            }
            // Draw bars third
            if (params.showBars) {
                if (params.showGradient == 1 || params.showGradient == 0) {
                    drawBars(params.state, false);
                }
                else {
                    drawBars(params.state, true);
                }
            }
            if (params.showLine && (speedLinesTimer % 6 == 0 || speedLinesTimer % 6 == 1 || !params.currentlyPlaying || volume == 0)) {
                drawElectricLine();
            }
            // Draw Phoenix Wright fifth
            ctx.globalAlpha = params.characterOpacity;
            if (blinkTimer >= 0 && blinkTimer < 16) {
                // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                ctx.drawImage(yellPW, Math.floor(blinkTimer / 4) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else if (blinkTimer >= 180) {
                blinkTimer = 0;
                ctx.drawImage(yellPW, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                ctx.drawImage(yellPW, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            ctx.globalAlpha = 1;
            ctx.restore();
            break;
    }

    // Bitmap manipulation
    // A) grab all of the pixels on the canvas and put them in the `data` array
    // `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    if (params.showInvert) {
        drawInvert();
    }

    // Toggles whether the controls are displayed or not
    if (params.state == "yellAJ" || params.state == "yellF" || params.state == "yellG" || params.state == "yellGE" || params.state == "yellME" || params.state == "yellPW") {
        displayControls();
    }

    // Toggles the track select menu
    if (!isGallery) {
        if (!selectHidden) {
            displaySongSelect(true, params.state);
        }
        else {
            displaySongSelect(false, params.state);
        }
    }
}

const drawSpeedlines = (gradientInt, playing, direction) => { // direction is a bool. false = left, true = right
    // Displays either the speedlines or the gradient
    if (gradientInt == 0) {
        let maxTimer = 100; // Used to determine how fast the original speedlines go; based on volume
        if (volume >= 0 && volume < 10) maxTimer = 100;
        else if (volume >= 10 && volume < 20) maxTimer = 90;
        else if (volume >= 20 && volume < 30) maxTimer = 80;
        else if (volume >= 30 && volume < 40) maxTimer = 70;
        else if (volume >= 40 && volume < 50) maxTimer = 60;
        else if (volume >= 50 && volume < 60) maxTimer = 50;
        else if (volume >= 60 && volume < 70) maxTimer = 40;
        else if (volume >= 70 && volume < 80) maxTimer = 30;
        else if (volume >= 80 && volume < 90) maxTimer = 20;
        else if (volume >= 90 && volume <= 100) maxTimer = 10;
        if (speedLinesTimer >= 0 && speedLinesTimer < maxTimer) {
            // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            if (direction) {
                if (volume != 0) {
                    ctx.drawImage(speedlines, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                }
                
            }
            else {
                if (volume != 0) {
                    ctx.drawImage(speedlines2, Math.floor(speedLinesTimer / (maxTimer / 10)) * 960, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
                }
            }
        }
        else {
            speedLinesTimer = 0;
            if (direction) {
                ctx.drawImage(speedlines, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
            else {
                ctx.drawImage(speedlines2, 0, 0, 960, 640, 0, 0, canvasWidth, canvasHeight);
            }
        }
        for (let i = 0; i < speedlinesAudio.length; i++) {
            speedlinesAudio.pop();
        }
    }
    else if (gradientInt == 1) {
        drawGradient(playing, !direction, false);
    }
    else {
        drawGradient(playing, !direction, true);
    }
};

const drawGradient = (currentlyPlaying, direction, noGradient) => { // direction is a bool. false = left, true = right
    if (!noGradient) {
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.globalAlpha = 1;
    }
    else {
        // draws a black background
        ctx.save();
        ctx.fillStyle = "black";
        ctx.globalAlpha = 1;
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        ctx.restore();
    }

    // The variables are used to align the speedlines with the bars
    let barSpacing = 2;
    let margin = 2;
    let screenHeightForBars = canvasHeight * 2 - (audioData.length * barSpacing);
    let barHeight = screenHeightForBars / audioData.length;
    // loop through to create speedlines!
    for (let i = 0; i < audioData.length; i++) {
        if (prevPosition[i] < audioData[i] && !alreadyHigher[i]) {
            alreadyHigher[i] = true;
            let color;
            if (noGradient) {
                color = `hsl(${n * 0.1},100%,50%)`;
            }
            else {
                color = `rgb(100%,100%,100%)`;
            }
            
            let x = 960;
            if (direction) x = -125;
            if (volume != 0) {
                speedlinesAudio.push(new utils.SpeedLine(x, margin + i * (barHeight + barSpacing) - 40, audioData[i] - prevPosition[i], ctx, color, direction));
            }
            n++;
        }
        else if (prevPosition[i] > audioData[i]) {
            alreadyHigher[i] = false;
        }
        prevPosition[i] = audioData[i];
    }
    if (currentlyPlaying) {
        speedlinesAudio.forEach(line => {
            line.drawLine(volume);
        });
    }
}

const drawBars = (state, noGradient) => {
    if (state == "yellAJ" || state == "yellGE" || state == "yellME" || state == "yellPW") {
        let barSpacing = 2;
        let margin = 2;
        let screenHeightForBars = canvasHeight * 2 - (audioData.length * barSpacing);
        let barHeight = screenHeightForBars / audioData.length;
        let barWidth = 500;
        let sideSpacing = 200;

        ctx.save();
        if (!noGradient) {
            ctx.fillStyle = `rgba(255,255,255,0.50)`;
            ctx.strokeStyle = `rgba(0,0,0,0.50)`;
        }
        else {
            ctx.fillStyle = `rgba(0,0,0,0)`;
            ctx.strokeStyle = `rgba(255,255,255,1)`;
        }
        // loop through the data and draw!
        for (let i = 0; i < audioData.length; i++) {
            ctx.fillRect(sideSpacing + (canvasWidth - 200) - audioData[i] * ((volume / 100) * 2), margin + i * (barHeight + barSpacing) - 41, barWidth, barHeight);
            ctx.strokeRect(sideSpacing + (canvasWidth - 200) - audioData[i] * ((volume / 100) * 2), margin + i * (barHeight + barSpacing) - 41, barWidth, barHeight);
        }
        ctx.restore();
    }
    else {
        let barSpacing = 2;
        let margin = 2;
        let screenHeightForBars = canvasHeight * 2 - (audioData.length * barSpacing);
        let barHeight = screenHeightForBars / audioData.length;
        let barWidth = 500;
        let sideSpacing = -300;

        ctx.save();
        if (!noGradient) {
            ctx.fillStyle = `rgba(255,255,255,0.50)`;
            ctx.strokeStyle = `rgba(0,0,0,0.50)`;
        }
        else {
            ctx.fillStyle = `rgba(0,0,0,0)`;
            ctx.strokeStyle = `rgba(255,255,255,1)`;
        }
        // loop through the data and draw!
        for (let i = 0; i < audioData.length; i++) {
            ctx.fillRect(sideSpacing - 200 + audioData[i] * ((volume / 100) * 2), margin + i * (barHeight + barSpacing) - 41, barWidth, barHeight);
            ctx.strokeRect(sideSpacing - 200 + audioData[i] * ((volume / 100) * 2), margin + i * (barHeight + barSpacing) - 41, barWidth, barHeight);
        }
        ctx.restore();
    }
}

const drawElectricLine = () => {
    let ratio = canvasWidth / 960;

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0 * ratio, 180 * ratio);
    let order = Math.random();
    // draws an electric line; the y-value of the points vary according to the music
    for (let i = 0; i < (960 / 60) - 2; i++) {
        let randomAudioData = Math.ceil(Math.random() * 255);
        if (order >= 0.5) {
            if (i % 2 == 0) {
                // a random audioData was chosen to determine the height of the points
                ctx.lineTo(((i+1) * 60) * ratio, (180 * ratio) + ((audioData[randomAudioData] / 255 * 120) * ((volume / 100) * 2)) * ratio);
            }
            else {
                ctx.lineTo(((i+1) * 60) * ratio, (180 * ratio) - ((audioData[randomAudioData] / 255 * 120) * ((volume / 100) * 2)) * ratio);
            }
        }
        else {
            if (i % 2 == 1) {
                // a random audioData was chosen to determine the height of the points
                ctx.lineTo(((i+1) * 60) * ratio, (180 * ratio) + ((audioData[randomAudioData] / 255 * 120) * ((volume / 100) * 2)) * ratio);
            }
            else {
                ctx.lineTo(((i+1) * 60) * ratio, (180 * ratio) - ((audioData[randomAudioData] / 255 * 120) * ((volume / 100) * 2)) * ratio);
            }
        }
    }
    ctx.lineTo(960 * ratio, 180 * ratio);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
};

const drawCircles = (circleX, circleY) => {
    ctx.save();
    ctx.globalAlpha = 0.3;
    // draws random circles everywhere; their color and radius change with the music
    for (let i = 0; i < audioData.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${360 - ((audioData[i] / 255) * 360)},100%,50%)`;
        ctx.arc(circleX[i], circleY[i], (audioData[i] / 8) * ((volume / 100) * 2), 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
}

const drawInvert = () => {
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    // B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4) {
        let red = data[i], green = data[i + 1], blue = data[i + 2];
        data[i] = 255 - red; // set red value
        data[i + 1] = 255 - green; // set green value
        data[i + 2] = 255 - blue; // set blue value
        // data[i+3] is the alpha value but we're leaving that alone
    } // end for

    // D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

const displayControls = () => {
    // Canvas elements use canvasWidth and canvasHeight
    // Non-canvas elements use parseFloat(canvas.offsetWidth) and parseFloat(canvas.offsetHeight)
    let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    if (controlsHidden && controlsOffset < 165) {
        controlsOffset += 11;
    }
    else if (!controlsHidden && controlsOffset > 0) {
        controlsOffset -= 11;
    }

    // Display textbox image
    if (controlsOffset < 165) {
        ctx.drawImage(textbox, 0, (2 * canvasHeight / 3) + (20 * (canvasWidth / 960)) + (controlsOffset * (canvasWidth / 960)), canvasWidth, textbox.height * (canvasWidth / 960));
    }
    let canvas = document.querySelector("#main-canvas");
    let controls = document.querySelector("#controls");
    let buttons = document.querySelectorAll("button");
    let playButton = document.querySelector("#play-button");
    let dropdown = document.querySelector("select");
    let ranges = document.querySelectorAll("input[type='range']");
    let clickableInputs = document.querySelectorAll("input");
    let volumeLabel = document.querySelector("#volume-label");
    let opacityLabel = document.querySelector("#opacity-label");
    let bassLabel = document.querySelector("#bass-label");
    let leftControls = document.querySelector("#left-controls");

    // Display controls; The size of all controls adjust with the size of the canvas
    if (isFullscreen) {
        controls.style.top = `${(2 * parseFloat(canvas.offsetHeight) / 3) + 
                                (60 * (parseFloat(canvas.offsetHeight) / 640.0) + 
                                (controlsOffset * (parseFloat(canvas.offsetHeight) / 640.0)))}px`;
    }
    else {
        if (parseFloat(windowWidth) > 1023) {
            controls.style.top = `${(80) + 
                (2 * parseFloat(canvas.offsetHeight) / 3) + 
                (60 * (parseFloat(canvas.offsetHeight) / 640.0) + 
                (controlsOffset * (parseFloat(canvas.offsetHeight) / 640.0)))}px`;
        }
        else {
            controls.style.top = `${(52) + 
                (2 * parseFloat(canvas.offsetHeight) / 3) + 
                (60 * (parseFloat(canvas.offsetHeight) / 640.0) + 
                (controlsOffset * (parseFloat(canvas.offsetHeight) / 640.0)))}px`;
        }
    }
    
    if (parseFloat(canvas.offsetWidth) > parseFloat(canvas.offsetHeight)) {
        document.querySelector(".is-ancestor").style.width = parseFloat(canvas.offsetWidth) + 'px';
    }
    else {
        document.querySelector(".is-ancestor").style.width = '100vw';
    }
    controls.style.left = '50%';
    controls.style.marginLeft = -(parseFloat(canvas.offsetWidth) / 2) + 10 + 'px';
    controls.style.fontSize = (parseFloat(canvas.offsetHeight) / 640.0) * 100.0 + '%';
    buttons.forEach((button) => {button.style.fontSize = "inherit";});
    buttons.forEach((button) => {button.style.padding = (parseFloat(canvas.offsetHeight) / 640.0) * 6 + 'px';});
    buttons.forEach((button) => {button.style.width = (parseFloat(canvas.offsetHeight) / 640.0) * 140 + 'px';});
    buttons.forEach((button) => {button.style.height = (parseFloat(canvas.offsetHeight) / 640.0) * 24 + 'px';});
    buttons.forEach((button) => {button.style.marginRight = (parseFloat(canvas.offsetHeight) / 640.0) * 8 + 'px';});
    dropdown.style.fontSize = "inherit";
    clickableInputs.forEach((input) => {input.style.width = (parseFloat(canvas.offsetHeight) / 640.0) * 13 + 'px';});
    clickableInputs.forEach((input) => {input.style.height = (parseFloat(canvas.offsetHeight) / 640.0) * 13 + 'px';});
    clickableInputs.forEach((input) => {input.style.marginRight = (parseFloat(canvas.offsetHeight) / 640.0) * 5 + 'px';});
    clickableInputs.forEach((input) => {input.style.whiteSpace = "nowrap";});
    ranges.forEach((range) => {range.style.width = (parseFloat(canvas.offsetHeight) / 640.0) * 80 + 'px';});
    ranges.forEach((range) => {range.style.height = (parseFloat(canvas.offsetHeight) / 640.0) * 10 + 'px';});
    volumeLabel.style.marginLeft = (parseFloat(canvas.offsetHeight) / 640.0) * 0.0 + 'px';
    opacityLabel.style.marginLeft = (parseFloat(canvas.offsetHeight) / 640.0) * 0.0 + 'px';
    bassLabel.style.marginLeft = (parseFloat(canvas.offsetHeight) / 640.0) * 0.0 + 'px';

    // Draws the Hide Controls button; A blue hexagon on the textbox
    ctx.save();
    //#2a8abd fill
    //#98bccc stroke
    if (!mouseOverButton) {
        ctx.fillStyle = "#2a8abd";
    }
    else {
        ctx.fillStyle = "blue";
    }
    ctx.strokeStyle = "#98bccc";
    ctx.lineWidth = 5;
    ctx.beginPath();
    // Numbers are determined by finding the number of pixels from each point on the hexagon to the top left corner of the image
    ctx.moveTo(84 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 14 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); // Leftmost point
    ctx.lineTo(94 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 1 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); //  Top left point
    ctx.lineTo(227 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 1 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); // Top right point
    ctx.lineTo(236 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 14 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); // Rightmost point
    ctx.lineTo(227 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 27 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); // Bottom right point
    ctx.lineTo(94 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 27 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); // Bottom left point
    ctx.lineTo(84 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 14 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960))); // Back to Leftmost point
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    // Text for the Hide Controls button
    ctx.save();
    ctx.fillStyle = "white";
    ctx.font = `${(227 * (canvasWidth / 960)) - (94 * (canvasWidth / 960)) * 2.2}px ace-attorney`; // Size of font adjusts with the canvas
    ctx.textBaseline = 'top';
    if (!controlsHidden) {
        ctx.fillText("Hide Controls", 102 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 5 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960)));
    }
    else {
        ctx.fillText("Show Controls", 95 * (canvasWidth / 960), ((2 * canvasHeight / 3) + 20) + 5 * (canvasWidth / 960) + (controlsOffset * (canvasWidth / 960)));
    }
    ctx.restore();
};

const enableSongSelect = () => {
    selectHidden = false;
};
const displaySongSelect = (direction, state) => { // direction is a bool. true = up, false = down
    let canvas = document.querySelector("#main-canvas");
    let selectCanvas = document.querySelector("#song-select");

    // Adjusts offset depending on which direction the menu is going
    if (direction && selectOffset < 480) {
        selectOffset += 30;
    }
    else if (!direction && selectOffset > 0) {
        selectOffset -= 30;
    }

    selectCanvas.style.height = 307 * (parseFloat(canvas.offsetHeight) / 640) + 'px';
    selectCanvas.style.left = '50%';
    selectCanvas.style.marginLeft = -(parseFloat(selectCanvas.offsetWidth) / 2) + 'px';
    if (isFullscreen) {
        selectCanvas.style.top = parseFloat(canvas.offsetHeight) - (selectOffset * (parseFloat(canvas.offsetHeight) / 640)) + 'px';
    }
    else {
        let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (parseFloat(windowWidth) > 1023) {
            selectCanvas.style.top = 80 + parseFloat(canvas.offsetHeight) - (selectOffset * (parseFloat(canvas.offsetHeight) / 640)) + 'px';
        }
        else {
            selectCanvas.style.top = 52 + parseFloat(canvas.offsetHeight) - (selectOffset * (parseFloat(canvas.offsetHeight) / 640)) + 'px';
        }
        
    }
    

    ctx2.save();
    ctx2.clearRect(0, 0, 729 * (canvasWidth / 960), 307 * (canvasHeight / 640));
    ctx2.drawImage(selectSong, 0, 0, 729 * (canvasWidth / 960), 307 * (canvasHeight / 640));

    ctx2.fillStyle = "black";
    ctx2.font = `${(16 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
    ctx2.textBaseline = 'top';
    ctx2.fillText("Select Track", 5 * (canvasWidth / 960), 4 * (canvasWidth / 960));
    ctx2.restore();

    // Detect which mugshot was highlighted
    // If a mugshot is highlighted, change its border
    if (highlightedSong == "cornered") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.drawImage(selected, 30 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
        ctx2.drawImage(mugshotPW, 22 * (canvasWidth / 960), 37 * (canvasWidth / 960), 156 * (canvasWidth / 960), 156 * (canvasHeight / 640));
        ctx2.font = `${(30 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Pursuit ~ Cornered", 200 * (canvasWidth / 960), 45 * (canvasWidth / 960));
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Game origin: Phoenix Wright: Ace Attorney", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("Presented by: Phoenix Wright", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.drawImage(option, 30 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
    }
    if (highlightedSong == "questioned") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.drawImage(selected, 97 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
        ctx2.drawImage(mugshotF, 22 * (canvasWidth / 960), 37 * (canvasWidth / 960), 156 * (canvasWidth / 960), 156 * (canvasHeight / 640));
        ctx2.font = `${(30 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Pursuit ~ Questioned", 200 * (canvasWidth / 960), 45 * (canvasWidth / 960));
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Game origin: Phoenix Wright: Ace Attorney", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("- Justice for All", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("Presented by: Franziska von Karma", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.drawImage(option, 97 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
    }
    if (highlightedSong == "caught") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.drawImage(selected, 164 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
        ctx2.drawImage(mugshotG, 22 * (canvasWidth / 960), 37 * (canvasWidth / 960), 156 * (canvasWidth / 960), 156 * (canvasHeight / 640));
        ctx2.font = `${(30 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Pursuit ~ Caught", 200 * (canvasWidth / 960), 45 * (canvasWidth / 960));
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Game origin: Phoenix Wright: Ace Attorney", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("- Trials and Tribulations", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("Presented by: Godot", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.drawImage(option, 164 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
    }
    if (highlightedSong == "overtaken") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.drawImage(selected, 231 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
        ctx2.drawImage(mugshotAJ, 22 * (canvasWidth / 960), 37 * (canvasWidth / 960), 156 * (canvasWidth / 960), 156 * (canvasHeight / 640));
        ctx2.font = `${(30 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Pursuit ~ Overtaken", 200 * (canvasWidth / 960), 45 * (canvasWidth / 960));
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Game origin: Apollo Justice: Ace Attorney", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("Presented by: Apollo Justice", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.drawImage(option, 231 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
    }
    if (highlightedSong == "lying") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.drawImage(selected, 298 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
        ctx2.drawImage(mugshotME, 22 * (canvasWidth / 960), 37 * (canvasWidth / 960), 156 * (canvasWidth / 960), 156 * (canvasHeight / 640));
        ctx2.font = `${(30 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Pursuit ~ Lying Coldly", 200 * (canvasWidth / 960), 45 * (canvasWidth / 960));
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Game origin: Ace Attorney Investigations:", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("Miles Edgeworth", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("Presented by: Miles Edgeworth", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.drawImage(option, 298 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
    }
    if (highlightedSong == "truth") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.drawImage(selected, 365 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
        ctx2.drawImage(mugshotGE, 22 * (canvasWidth / 960), 37 * (canvasWidth / 960), 156 * (canvasWidth / 960), 156 * (canvasHeight / 640));
        ctx2.font = `${(30 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Pursuit ~ Wanting to Find the Truth", 200 * (canvasWidth / 960), 45 * (canvasWidth / 960));
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Game origin: Ace Attorney Investigations 2", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("Presented by: Gregory Edgeworth", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.drawImage(option, 365 * (canvasWidth / 960), 217 * (canvasWidth / 960), 67 * (canvasWidth / 960), 67 * (canvasHeight / 640));
    }
    if (highlightedSong == "cancel") {
        ctx2.save();
        ctx2.fillStyle = "gray";
        ctx2.font = `${(16 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Cancel", 660 * (canvasWidth / 960), 304 * (canvasWidth / 960));
        ctx2.restore();
    }
    else {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.font = `${(16 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.fillText("Cancel", 660 * (canvasWidth / 960), 304 * (canvasWidth / 960));
        ctx2.restore();
    }
    if (highlightedSong == "cancel" || highlightedSong == "") {
        ctx2.save();
        ctx2.fillStyle = "black";
        ctx2.font = `${(25 * (canvasWidth / 960))}px ace-attorney`; // Size of font adjusts with the canvas
        ctx2.textBaseline = 'top';
        ctx2.fillText("Select a track by clicking one of the", 200 * (canvasWidth / 960), 104 * (canvasWidth / 960));
        ctx2.fillText("mugshots below.", 200 * (canvasWidth / 960), 138 * (canvasWidth / 960));
        ctx2.fillText("", 200 * (canvasWidth / 960), 172 * (canvasWidth / 960));
        ctx2.restore();
    }

    // Mugshot images
    ctx2.drawImage(mugshotPW, 34 * (canvasWidth / 960), 221 * (canvasWidth / 960), 59 * (canvasWidth / 960), 59 * (canvasHeight / 640));
    ctx2.drawImage(mugshotF, 101 * (canvasWidth / 960), 221 * (canvasWidth / 960), 59 * (canvasWidth / 960), 59 * (canvasHeight / 640));
    ctx2.drawImage(mugshotG, 168 * (canvasWidth / 960), 221 * (canvasWidth / 960), 59 * (canvasWidth / 960), 59 * (canvasHeight / 640));
    ctx2.drawImage(mugshotAJ, 235 * (canvasWidth / 960), 221 * (canvasWidth / 960), 59 * (canvasWidth / 960), 59 * (canvasHeight / 640));
    ctx2.drawImage(mugshotME, 302 * (canvasWidth / 960), 221 * (canvasWidth / 960), 59 * (canvasWidth / 960), 59 * (canvasHeight / 640));
    ctx2.drawImage(mugshotGE, 369 * (canvasWidth / 960), 221 * (canvasWidth / 960), 59 * (canvasWidth / 960), 59 * (canvasHeight / 640));

    if ((selectedSong == "cornered" && state == "yellPW")
        || (selectedSong == "questioned" && state == "yellF")
        || (selectedSong == "caught" && state == "yellG")
        || (selectedSong == "overtaken" && state == "yellAJ")
        || (selectedSong == "lying" && state == "yellME")
        || (selectedSong == "truth" && state == "yellGE")
        || (selectedSong == "cancel")) {
        highlightedSong = "";
        selectedSong = "";
        selectHidden = true;
    }
};

const isFullScreen = (boolean) => {
    isFullscreen = boolean;
}

const canvasHoveredOver = (e) => {
    if (selectHidden) {
        let canvas = document.querySelector("#main-canvas");
        let ratio = parseFloat(canvas.offsetHeight) / 640.0;
        let rect = e.target.getBoundingClientRect();
        let mouseX = e.clientX - rect.x;
        let mouseY = e.clientY - rect.y;
    
        if (isGallery) {
            if (mouseX > parseFloat(canvas.offsetWidth)/2-(630/2) * ratio
                && mouseX < parseFloat(canvas.offsetWidth)/2+(630/2) * ratio
                && mouseY > parseFloat(canvas.offsetHeight)/2-(348/2) * ratio
                && mouseY < parseFloat(canvas.offsetHeight)/2+(348/2) * ratio) {
                mouseOverButton = true;
                canvas.style.cursor = "pointer";
            }
            else {
                mouseOverButton = false;
                canvas.style.cursor = "default";
            }
        }
        else {
            // Checks if the mouse is over the Hide Controls button while it isn't moving
            if (controlsOffset == 0
                && mouseX > 84 * ratio
                && mouseX < 236 * ratio
                && mouseY > ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 1 * ratio
                && mouseY < ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 27 * ratio) {
                mouseOverButton = true;
                canvas.style.cursor = "pointer";
            }
            else if (controlsOffset <= 165
                && mouseX > 84 * ratio
                && mouseX < 236 * ratio
                && mouseY > ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 1 * ratio + controlsOffset * ratio
                && mouseY < ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 27 * ratio + controlsOffset * ratio) {
                mouseOverButton = true;
                canvas.style.cursor = "pointer";
            }
            else {
                mouseOverButton = false;
                canvas.style.cursor = "default";
            }
        }
    }
};

const canvasClicked = (e) => {
    if (!selectHidden && selectOffset >= 480) {
        highlightedSong = "";
        selectedSong = "";
        selectHidden = true;
    }
    else if (selectHidden) {
        let canvas = document.querySelector("#main-canvas");
        let ratio = parseFloat(canvas.offsetHeight) / 640.0;
        let rect = e.target.getBoundingClientRect();
        let mouseX = e.clientX - rect.x;
        let mouseY = e.clientY - rect.y;
    
        if (isGallery) {
            if (mouseX > parseFloat(canvas.offsetWidth)/2-(630/2) * ratio
                && mouseX < parseFloat(canvas.offsetWidth)/2+(630/2) * ratio
                && mouseY > parseFloat(canvas.offsetHeight)/2-(348/2) * ratio
                && mouseY < parseFloat(canvas.offsetHeight)/2+(348/2) * ratio) {
                controlsHidden = true; // This variable is used in this case to transition to the objection screen
                mouseOverButton = false;
                canvas.style.cursor = "default";
            }
        }
        else {
            // Checks if the mouse is over the Hide Controls button while it isn't moving
            if (controlsOffset == 0
                && mouseX > 84 * ratio
                && mouseX < 236 * ratio
                && mouseY > ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 1 * ratio
                && mouseY < ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 27 * ratio) {
                controlsHidden = true;
                mouseOverButton = false;
                canvas.style.cursor = "default";
            }
            else if (controlsOffset <= 165
                && mouseX > 84 * ratio
                && mouseX < 236 * ratio
                && mouseY > ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 1 * ratio + controlsOffset * ratio
                && mouseY < ((2 * parseFloat(canvas.offsetHeight) / 3) + 20 * ratio) + 27 * ratio + controlsOffset * ratio) {
                controlsHidden = false;
                mouseOverButton = false;
                canvas.style.cursor = "default";
            }
        }
    }
};

const canvasMouseLeft = (e) => {
    let canvas = document.querySelector("#main-canvas");
    mouseOverButton = false;
    canvas.style.cursor = "default";
}

const selectCanvasHoveredOver = (e) => {
    let canvas = document.querySelector("#main-canvas");
    let selectedCanvas = document.querySelector("#song-select");
    let ratio = parseFloat(canvas.offsetHeight) / 640.0;
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;

    if (selectOffset >= 480
        && mouseX > 34 * ratio
        && mouseX < 93 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        highlightedSong = "cornered";
        selectedCanvas.style.cursor = "pointer";
    }
    else if (selectOffset >= 480
        && mouseX > 101 * ratio
        && mouseX < 160 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        highlightedSong = "questioned";
        selectedCanvas.style.cursor = "pointer";
    }
    else if (selectOffset >= 480
        && mouseX > 168 * ratio
        && mouseX < 227 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        highlightedSong = "caught";
        selectedCanvas.style.cursor = "pointer";
    }
    else if (selectOffset >= 480
        && mouseX > 235 * ratio
        && mouseX < 294 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        highlightedSong = "overtaken";
        selectedCanvas.style.cursor = "pointer";
    }
    else if (selectOffset >= 480
        && mouseX > 302 * ratio
        && mouseX < 361 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        highlightedSong = "lying";
        selectedCanvas.style.cursor = "pointer";
    }
    else if (selectOffset >= 480
        && mouseX > 369 * ratio
        && mouseX < 428 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        highlightedSong = "truth";
        selectedCanvas.style.cursor = "pointer";
    }
    else if (selectOffset >= 480
        && mouseX > 655 * ratio
        && mouseX < 710 * ratio
        && mouseY > 290 * ratio
        && mouseY < 310 * ratio) {
        highlightedSong = "cancel";
        selectedCanvas.style.cursor = "pointer";
    }
    else {
        highlightedSong = "";
        selectedCanvas.style.cursor = "default";
    }
};

const selectCanvasClicked = (e) => {
    let canvas = document.querySelector("#main-canvas");
    let selectCanvas = document.querySelector("#song-select");
    let ratio = parseFloat(canvas.offsetHeight) / 640.0;
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;

    if (selectOffset >= 480
        && mouseX > 34 * ratio
        && mouseX < 93 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        selectedSong = "cornered";
        selectCanvas.style.cursor = "default";
    }
    else if (selectOffset >= 480
        && mouseX > 101 * ratio
        && mouseX < 160 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        selectedSong = "questioned";
        selectCanvas.style.cursor = "default";
    }
    else if (selectOffset >= 480
        && mouseX > 168 * ratio
        && mouseX < 227 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        selectedSong = "caught";
        selectCanvas.style.cursor = "default";
    }
    else if (selectOffset >= 480
        && mouseX > 235 * ratio
        && mouseX < 294 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        selectedSong = "overtaken";
        selectCanvas.style.cursor = "default";
    }
    else if (selectOffset >= 480
        && mouseX > 302 * ratio
        && mouseX < 361 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        selectedSong = "lying";
        selectCanvas.style.cursor = "default";
    }
    else if (selectOffset >= 480
        && mouseX > 369 * ratio
        && mouseX < 428 * ratio
        && mouseY > 221 * ratio
        && mouseY < 280 * ratio) {
        selectedSong = "truth";
        selectCanvas.style.cursor = "default";
    }
    else if (selectOffset >= 480
        && mouseX > 655 * ratio
        && mouseX < 710 * ratio
        && mouseY > 290 * ratio
        && mouseY < 310 * ratio) {
        selectedSong = "cancel";
        selectCanvas.style.cursor = "default";
    }
};

const selectCanvasMouseLeft = (e) => {
    let canvas = document.querySelector("#song-select");
    highlightedSong = "";
    canvas.style.cursor = "default";
}

const controlsClicked = (e) => {
    if (!selectHidden && selectOffset >= 480) {
        highlightedSong = "";
        selectedSong = "";
        selectHidden = true;
    }
}

export { init, init2, setupCanvas, draw, enableSongSelect, canvasHoveredOver, canvasClicked, canvasMouseLeft, selectCanvasHoveredOver, selectCanvasClicked, selectCanvasMouseLeft, controlsClicked, isFullScreen, isGallery, controlsHidden, selectHidden, selectedSong, highlightedSong, isFullscreen };