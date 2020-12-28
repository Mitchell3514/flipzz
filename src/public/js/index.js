// @ts-check


function showRules() {
    const CL = document.querySelector("#popup").classList;
    // hidden: display none (see base.css)
    if (CL.contains("hidden")) CL.remove("hidden");     // removes class "hidden", so becomes visible
    else CL.add("hidden");  // if you click again, it disappears
}
