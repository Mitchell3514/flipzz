// @ts-check


function showRules() {
    const CL = document.querySelector("#popup").classList;
    if (CL.contains("hidden")) CL.remove("hidden");
    else CL.add("hidden");
}
