let mic, fft;
let snowflakes = [];
let startTime; // New variable to track the start time
let micAccessScreen;

function setup() {
    createCanvas(windowWidth, windowHeight); // Create a fullscreen canvas
    angleMode(DEGREES);
    
    // Create the microphone access screen
    createMicAccessScreen();
    
    // Create snowflake objects
    for (let i = 0; i < 1000; i++) {
        snowflakes.push(new Snowflake());
    }
    
    startTime = millis(); // Initialize startTime
}

function draw() {
    background(0); // Set the background to black
    
    // Calculate elapsed time
    let elapsedTime = (millis() - startTime) / 1000; // Convert milliseconds to seconds
    
    // Update and display each snowflake in the array
    for (let flake of snowflakes) {
        flake.update(elapsedTime);
        flake.display();
    }
    
    // Draw the audio visualization
    translate(width / 2, height / 2); // Translate to the center of the canvas
    drawAudioVisualization();
}

// Request microphone access
async function askForMicrophoneAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic = new p5.AudioIn();
        mic.setSource(stream.getAudioTracks()[0]);
        mic.start();
        fft = new p5.FFT();
        fft.setInput(mic);
        
        // Hide the microphone access screen
        micAccessScreen.hide();
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
}

function createMicAccessScreen() {
    micAccessScreen = createDiv('klik op het scherm om mic access te geven');
    micAccessScreen.style('position', 'fixed');
    micAccessScreen.style('top', '0');
    micAccessScreen.style('left', '0');
    micAccessScreen.style('width', '100%');
    micAccessScreen.style('height', '100%');
    micAccessScreen.style('background-color', 'black');
    micAccessScreen.style('color', 'white');
    micAccessScreen.style('display', 'flex');
    micAccessScreen.style('justify-content', 'center');
    micAccessScreen.style('align-items', 'center');
    micAccessScreen.style('font-size', '36px');
    micAccessScreen.style('z-index', '9999');
    
    // Request microphone access when the screen is clicked
    micAccessScreen.mouseClicked(askForMicrophoneAccess);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // Resize the microphone access screen
    micAccessScreen.size(windowWidth, windowHeight);
}

// Function to draw the audio visualization
function drawAudioVisualization() {
    if (!fft) return; // Ensure fft is initialized before drawing
    let spectrum = fft.analyze(); // Get the spectrum analysis
    let maxRadius = min(width, height) * 0.4; // Maximum radius of the circle

    noFill();
    strokeWeight(3);
    stroke(255, 0, 255);
    
    // Draai de cirkel
    let rotationSpeed = 1; // Pas de snelheid van de rotatie aan
    rotate(frameCount * rotationSpeed); // Draai op basis van het frame aantal

    beginShape();
    for (let i = 0; i < spectrum.length; i++) {
        let amp = spectrum[i];
        let radius = map(amp, 0, 255, 100, maxRadius);
        let angle = map(i, 0, spectrum.length, 0, 360); // Hoek gelijkmatig verdeeld
        let x = radius * cos(angle);
        let y = radius * sin(angle);
        vertex(x, y); // Gebruik vertex om een gesloten vorm te maken
    }
    endShape(CLOSE); // Sluit de vorm
}

// Define the snowflake class
class Snowflake {
    constructor() {
        this.posX = 0;
        this.posY = random(-height, 180);
        this.initialAngle = random(0, 360);
        this.size = random(1, 3);
        this.radius = sqrt(random(pow(width / 2, 2)));
        this.color = color(random(1, 256), random(1, 256), random(1, 256));
    }

    update(time) {
        let angularSpeed = 10;
        let angle = this.initialAngle + angularSpeed * time;
        this.posX = width / 2 + this.radius * sin(angle);
        let ySpeed = 8 / this.size;
        this.posY += ySpeed;
        if (this.posY > height) {
            this.posY = -50;
        }
    }

    display() {
        fill(this.color);
        noStroke();
        ellipse(this.posX, this.posY, this.size);
    }
}