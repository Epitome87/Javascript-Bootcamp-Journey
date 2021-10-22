// Create a Timer class
class Timer {
  // Will receive a reference to 3 HTML elements: an input, and two buttons
  // It will also receive an optional object with callback functions
  constructor(durationInput, startButton, pauseButton, callbacks) {
    this.durationInput = durationInput;
    this.startButton = startButton;
    this.pauseButton = pauseButton;

    this.startButton.addEventListener('click', this.start);
    this.pauseButton.addEventListener('click', this.pause);

    if (callbacks) {
      this.onStart = callbacks.onStart;
      this.onTick = callbacks.onTick;
      this.onComplete = callbacks.onComplete;
    }
  }

  start = () => {
    // Fixing instructor bug! Without calling this, setIntervals seems to stack
    if (this.interval !== null) clearInterval(this.interval);

    if (this.onStart) {
      this.onStart(this.timeRemaining);
    }

    // Call this once outside of setInterval so the first tick has no delay
    this.tick();
    // Need reference to this interval to stop it later
    this.interval = setInterval(() => {
      this.tick();
    }, 50);
  };

  pause = () => {
    console.log("INTERVAL BEFORE: " , this.interval)
    clearInterval(this.interval);
    // Added fix to stacked setIntervals occuring
    this.interval = null;
  };

  tick = () => {
    if (this.timeRemaining <= 0) {
      this.pause();
      if (this.onComplete) {
        this.onComplete();
      }
    } else {
      this.timeRemaining = this.timeRemaining - 0.05;
      if (this.onTick) {
        this.onTick(this.timeRemaining);
      }
    }
  };

  get timeRemaining() {
    return parseFloat(this.durationInput.value);
  }

  set timeRemaining(time) {
    this.durationInput.value = time.toFixed(2);
  }
}
