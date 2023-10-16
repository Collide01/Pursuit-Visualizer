// Why are the all of these ES6 Arrow functions instead of regular JS functions?
// No particular reason, actually, just that it's good for you to get used to this syntax
// For Project 2 - any code added here MUST also use arrow function syntax

const makeColor = (red, green, blue, alpha = 1) => {
    return `rgba(${red},${green},${blue},${alpha})`;
};
  
const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = () => {
    const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor,255-floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx,startX,startY,endX,endY,colorStops) => {
  let lg = ctx.createLinearGradient(startX,startY,endX,endY);
  for(let stop of colorStops){
    lg.addColorStop(stop.percent,stop.color);
  }
  return lg;
};

const goFullscreen = (element) => {
  if (element.requestFullscreen) {
      element.requestFullscreen();
      let canvasElement = document.querySelector("#main-canvas");
      canvasElement.style.height = "100vh";
  } else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
      let canvasElement = document.querySelector("#main-canvas");
      canvasElement.style.height = "100vh";
  } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
      element.mozRequestFullScreen();
      let canvasElement = document.querySelector("#main-canvas");
      canvasElement.style.height = "100vh";
  } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
      let canvasElement = document.querySelector("#main-canvas");
      canvasElement.style.height = "100vh";
  }
  // .. and do nothing if the method is not supported
  else {
    let fullScreenButton = document.querySelector("#fs-button");
    fullScreenButton.disabled = true;
    fullScreenButton.innerHTML = "Full screen not supported";
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozExitFullscreen) {
      document.mozExitFullscreen();
  } else if (document.mozExitFullScreen) { // camel-cased 'S' was changed to 's' in spec
      document.mozExitFullScreen();
  } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
  }

  let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  let canvasElement = document.querySelector("#main-canvas");
  let canvasElement3 = document.querySelector("#cover");
  // Make the canvas as tall or as wide as the document
  if (windowWidth > windowHeight) {
    if (parseFloat(windowWidth) > 1023) {
      canvasElement.style.height = "calc(100vh - 5rem)";
      canvasElement.style.height = "-o-calc(100vh - 5rem)"; /* opera */
      canvasElement.style.height = "-webkit-calc(100vh - 5rem)"; /* google, safari */
      canvasElement.style.height = "-moz-calc(100vh - 5rem)"; /* firefox */
    }
    else {
      canvasElement.style.height = "calc(100vh - 3rem)";
      canvasElement.style.height = "-o-calc(100vh - 3rem)"; /* opera */
      canvasElement.style.height = "-webkit-calc(100vh - 3rem)"; /* google, safari */
      canvasElement.style.height = "-moz-calc(100vh - 3rem)"; /* firefox */
    }
  }
  else {
    canvasElement.style.width = "100vw";
    canvasElement.style.height = `${640 * (windowWidth / 960.0)}px`;
  }
  canvasElement3.style.height = canvasElement.offsetHeight;
  canvasElement3.style.width = "100vw";
};

class SpeedLine {
  constructor(x, y, width, ctx, color, direction) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.ctx = ctx;
    this.color = color;
    this.direction = direction;
  }

  drawLine(volume) {
    if (this.volume != 0) {
      if (!this.direction) {
        if (this.x > -151) {
          this.x -= 55 * (volume / 50.0) + 10;
          this.ctx.save();
          this.ctx.fillStyle = this.color;
          this.ctx.globalAlpha = 0.8;
          let speedLineWidth = this.width - 8;
          if (speedLineWidth <= 0) {
            this.width = 0;
          }
          this.ctx.fillRect(this.x,this.y + 2,(this.width * 25) * (volume / 50.0),4);
          this.ctx.globalAlpha = 1;
          this.ctx.restore();
        }
      }
      else {
        if (this.x < 981) {
          this.x += 55 * (volume / 50.0) + 10;
          this.ctx.save();
          this.ctx.fillStyle = this.color;
          this.ctx.globalAlpha = 0.8;
          let speedLineWidth = this.width - 8;
          if (speedLineWidth <= 0) {
            this.width = 0;
          }
          this.ctx.fillRect(this.x,this.y + 2,(this.width * 25) * (volume / 50.0),4);
          this.ctx.globalAlpha = 1;
          this.ctx.restore();
        }
      }
    }
  }
}

export {makeColor, getRandomColor, getLinearGradient, goFullscreen, exitFullscreen, SpeedLine};