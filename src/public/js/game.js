// @ts-check

// Configures everything that has not to do with the game


const timeSPAN = document.querySelector("span#time");
const date = new Date(Date.UTC(0, 0, 0, 0, 0, 0, 0));
let idinterval;   // used to clear interval
let seconds = 0;



function startTimer() { // eslint-disable-line
	idinterval = setInterval(() => { updateTime(); }, 1000);		// interval id needed to clear interval
}

function updateTime() {
	date.setUTCSeconds(seconds === 61 ? seconds = 1 : seconds++);
	let h = date.getUTCHours() > 0 ? 3 : 0;
	timeSPAN.innerHTML = date.toJSON().substr(14 - h, 5 + h);
}

function stopTimer() { // eslint-disable-line
    clearInterval(idinterval);
}

/* MEDIA QUERY */
// alert users if their screen width is below 500px 
var mediaQueryList = window.matchMedia('(max-width: 500px)');
mediaQueryList.addListener(screenTest);

function screenTest(e) {
    if (e.matches) {
		/* the viewport is 320 pixels wide or less */
		alert("This page may look better on a larger device!"); 
    }
}
