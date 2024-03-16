let userselection = null;
let youare = null;

function oddeven(val) {
  userselection = val;
  console.log(userselection);
  document.getElementById("OEchoice").innerText = userselection;

  // Disabling the buttons after the user selects one
  document.getElementById("odd").disabled = true;
  document.getElementById("even").disabled = true;

  youare = val;

  // showing the tossing option
  document.getElementById("cointoss").style.display = "block";

  // Initialize batorbowl
  batorbowl = null;
}

let batorbowl = null;
let userchoice = null;
let computerchoice = null;
let bbchoice = ["bat", "bowling"];

function check() {
  bbchoice = ["bat", "bowling"];
  const toss = Math.floor(Math.random() * 2); // 0 or 1
  console.log(toss);

  let val = null;
  if (toss === 0) val = "even";
  else val = "odd";
  console.log("tossval=" + val);
  document.getElementById("cointossresult").innerText = val;
  document.getElementById("Coin").disabled = true;

  if (val === userselection) {
    document.getElementById("usercorrect").style.display = "block";
    // finsing out what the user chose bat or bowl. Needs work done
    document.getElementById("bat").addEventListener("click", function () {
      document.getElementById("userchoice").innerText = "batting";
      batorbowl = "bat";
      document.getElementById("bat").disabled = true;
      document.getElementById("bowl").disabled = true;

      document.getElementById("userchoice").innerText = batorbowl;

      youare = "bat";
      youare = batorbowl === "bat" ? "bat" : "bat";
      console.log("you are now " + youare);
    });

    document.getElementById("bowl").addEventListener("click", function () {
      document.getElementById("userchoice").innerText = "bowling";
      batorbowl = "bowling";
      // disabling the buttons after selection
      document.getElementById("bat").disabled = true;
      document.getElementById("bowl").disabled = true;

      document.getElementById("userchoice").innerText = batorbowl;

      youare = "bowling";
      youare = batorbowl === "bowling" ? "bowling" : "bowling";
      console.log("you are now " + youare);
    });
    console.log(batorbowl);
  } else {
    batorbowl = bbchoice[Math.floor(Math.random() * 2)];
    console.log("batorbowl=" + batorbowl);
    // disabling the buttons after selection
    document.getElementById("compcorrect").style.display = "block";
    document.getElementById("computerchoice").innerText = batorbowl;
    computerchoice = true;

    youare = batorbowl === "bat" ? "bowling" : "bat";
    console.log("you are now " + youare);
  }
  // window.bob = batorbowl;
  document.getElementById("nextpage").disabled = false;

  document.getElementById("currently").innerText = youare;
}
