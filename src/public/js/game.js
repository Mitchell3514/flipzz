// @ts-check

// Configures everything that has not to do with the game


let idinterval;   // used to clear interval
let minute = 0;
let second = 0;

function timer() {
 idinterval = setInterval(() => { updateTime(); }, 1000);
}

function updateTime() {
  if ((second + 1) == 61) {
    second = 0;
    minute++;
  }
  if (minute == 60) {
    minute = 0;
  }
  document.getElementById('minutes').innerHTML = returnData(minute);
  document.getElementById('seconds').innerHTML = returnData(second);
}

function returnData(input) {
  return input > 9 ? input : `0${input}`;      // if digit below 10, add 0 in front
}

function stopTimer() {
  clearInterval(idinterval);
}

// to be called in flipzz?
timer();
stopTimer();



/* MEDIA QUERY */
// alert users if their screen width is below 320px (phone width)
var mediaQueryList = window.matchMedia('(max-width: 500px)');
mediaQueryList.addListener(screenTest);

function screenTest(e) {
  if (e.matches) {
    /* the viewport is 320 pixels wide or less */
    alert("This page may look better on a larger device!"); 
  } else {
    /* the viewport is more than than 320 pixels wide */
	return;
  }
}
