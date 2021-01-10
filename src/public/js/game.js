// @ts-check

// Configures everything that has not to do with the game

// LINK - ../../views/game.ejs#timer
// TODO setInterval, 
function timer() {
    const timer = document.querySelector("#time");
    let timepassed = 
    timer.innerHTML = timepassed;
}

// TODO after game has finished, the PLAY AGAIN button must show up (see game.ejs)

function restartGame() {
    // ???
}


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
