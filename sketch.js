var width = window.innerWidth;
var height = window.innerHeight;
var halfWidth = width / 2;
var halfHeight = height / 2;

var baseRadius = (width*0.25 + height*0.25)*0.5;
var minRadius = baseRadius*0.25;
var maxRadius = baseRadius*1.75;

var particles = [];

function preload(){
    sound = loadSound("5.mp3");
}
  
function setup(){
    frameRate(60);
    angleMode(DEGREES);
    var canvas = createCanvas(width, height);
    windowResized();
    canvas.mouseClicked(togglePlay);
    fft = new p5.FFT();
    sound.amp(0.2);
}

function windowResized(){
    width = window.innerWidth;
    height = window.innerHeight;
    resizeCanvas(width, height);

    halfWidth = width / 2;
    halfHeight = height / 2;

    baseRadius = min(width*0.25, height*0.25);
    minRadius = baseRadius*0.25;
    maxRadius = baseRadius*1.75;

    particles = [];
}

function draw(){
    background(0);

    let spectrum = fft.analyze();
    let spectrumMomentum = 0;
    let waveform = fft.waveform();
    let waveformMomentum = 0;

    // while(spectrum[spectrum.length-1] === 0)spectrum.pop();
    noStroke();
    for(let i=0; i<spectrum.length; i++){
        let x = map(i, 0, spectrum.length, 0, halfWidth);
        let h = -halfHeight + map(spectrum[i], 0, 255, halfHeight, 0);
        spectrumMomentum += spectrum[i];
        fill(map(i, 0, spectrum.length, 0, 255), 0, 255);
        rect(x, height, halfWidth/spectrum.length, h);
        rect(width-x, height, halfWidth/spectrum.length, h);
    }
    spectrumMomentum /= spectrum.length;

    translate(halfWidth, halfHeight);
    noFill();
    stroke(255, 255, 255, 255);
    strokeWeight(4);
    beginShape();
    for(let d=0; d<=180; d++){
        let i = floor(map(d, 0, 180, 0, waveform.length-1));
        let r = map(waveform[i], -1, 1, minRadius, maxRadius);
        vertex(r*sin(d), r*cos(d));
        waveformMomentum += waveform[i];
        if(r > (baseRadius+maxRadius)*0.4175){
            particles.push([r*sin(d), r*cos(d), map(waveform[i], -1, 1, 5, 25), d]);
        }
    }
    endShape();
    beginShape();
    for(let d=0; d<=180; d++){
        let i = floor(map(d, 0, 180, 0, waveform.length-1));
        let r = map(waveform[i], -1, 1, minRadius, maxRadius);
        vertex(r*-sin(d), r*cos(d));
    }
    endShape();

    fill(255, 255, 255, 128);
    noStroke();
    let momentum = abs(pow(spectrumMomentum, 0.25)) + abs(pow(waveformMomentum, 2));
    for(let i=0; i<particles.length; i++){
        particles[i][0] += momentum*sin(particles[i][3]);
        particles[i][1] += momentum*cos(particles[i][3]);
        if(particles[i][0] > halfWidth || particles[i][1] < -halfHeight || particles[i][1] > halfHeight){
            particles.splice(i, 1);
        }else{
            circle(particles[i][0], particles[i][1], particles[i][2]);
            circle(-particles[i][0], particles[i][1], particles[i][2]);
        }
    }
}

function togglePlay() {
    if (sound.isPlaying()) {
      sound.pause();
      noLoop();
    } else {
      sound.loop();
      loop();
    }
}