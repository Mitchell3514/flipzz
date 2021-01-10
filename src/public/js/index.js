// @ts-check


function showRules() {
    const CL = document.querySelector("#popup").classList;
    // hidden: display none (see base.css)
    if (CL.contains("hidden")) CL.remove("hidden");     // removes class "hidden", so becomes visible
    else CL.add("hidden");  // if you click again, it disappears
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

