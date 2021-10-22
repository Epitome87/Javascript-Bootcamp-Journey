// Gather DOM elements
const durInput = document.querySelector('#duration');
const startBtn = document.querySelector('#start');
const pauseBtn = document.querySelector('#pause');
const circle = document.querySelector('circle');

const perimeter = circle.getAttribute('r') * 2 * Math.PI;
circle.setAttribute('stroke-dasharray', perimeter);

let duration;

// const timerCallbacks = {
//   // Callback for when Timer starts
//   onStart(totalDuration) {
//     duration = totalDuration;
//   },

//   // Callback for when Timer ticks
//   onTick(timeRemaining) {
//     circle.setAttribute(
//       'stroke-dashoffset',
//       (perimeter * timeRemaining) / duration - perimeter
//     );
//   },

//   // Callback for when Timer completes
//   onComplete() {
//     console.log('Timer is complete!');
//   },
// };

// const timer = new Timer(durInput, startBtn, pauseBtn, timerCallbacks);

const timer = new Timer(durInput, startBtn, pauseBtn, {
  onStart(totalDuration) {
    duration = totalDuration;
  },
  onTick(timeRemaining) {
    circle.setAttribute(
      'stroke-dashoffset',
      (perimeter * timeRemaining) / duration - perimeter
    );
  },
  onComplete() {
    console.log('Complete');
  },
});
