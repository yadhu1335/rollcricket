const socket = io();
let mySocketID; //For saving my socketid
let you_are_currently; //To know what i am doing Batting or bowling.
let match_ended = false; //For knowing if the atch has ended or not. This is used to prevent "win_by_default" socket from executing
// Getting my socketId from front end
socket.on("socketid", (mySocketID) => {
  mySocketID = mySocketID;
  console.log(`my socket id is ${mySocketID}`);
});
let prevScore = 1;

const params = new URLSearchParams(window.location.search); // Get the URL search parameters

// Get the value of roomid from the URL
const room_id = params.get("room");
document.getElementById("roomcode").innerText = room_id; //show the value in p tag

const username = params.get("username"); // Get the value of username from the URL
console.log(`your useranme is ${username} and room id is ${room_id}`);

socket.emit("joinroom", room_id, username); //when the room.js website is loaded up it automatically emits "join room".

// should improve this
socket.on("alert", (message) => {
  alert(message);
  //   if (message === "Room is full")
  //   location.href = "../views/index.js";
  if (message.includes("warning")) {
    disable_enable_Buttons("enable");

    //IMP!!! write code to update the value of button in html too
  }
});

socket.on("players info", (value) => {
  users = [];
  for (let [sockeid, username] of Object.entries(value)) {
    users.push(username);
  }
  console.log(`Users=[${users}]`);
  document.getElementById("players").innerText = `${users[0]} vs ${users[1]}`; //showing you username vs opponent username
});

document.getElementById("roomcode_btn").addEventListener("click", () => {
  navigator.clipboard
    .writeText(room_id)
    .then(() => {
      console.log("Room ID copied to clipboard: " + room_id);
    })
    .catch((error) => {
      console.error("Error copying to clipboard:", error);
    });
});

socket.on("start match", () => {
  //  IMP!!! document.getElementById("players").innerText=`${} vs ${}`
  console.log("server gave signal to start the match");
  document.getElementById("match").style.display = "block";
  document.getElementById("insufficient_players").style.display = "none";

  const toss_choice_parentDiv = document.getElementById("choice"); //parent div called choice which will dispaly your choice and opponents choice
  let heads_or_tails_btn; //My choice in heads or tails
  const heads = document.getElementById("heads");
  const tails = document.getElementById("tails");

  const heads_or_tails = document.getElementById("heads_or_tails"); //div where we have the button heads and tails

  heads_or_tails.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON") {
      heads_or_tails_btn = event.target.id; //id will be either heads or tails
      createTag("p", `You chose ${heads_or_tails_btn}`, toss_choice_parentDiv); //appending choice to html
      console.log(`${username} chose Heads`);
      heads.disabled = true;
      tails.disabled = true;
      socket.emit("my_heads_or_tails_choice", event.target.id, room_id);
    }
  });

  socket.on("opponents_heads_or_tails_choice", (heads_or_tails) => {
    let opposition_choice_in_toss = heads_or_tails;
    console.log(`opposition choose ${heads_or_tails}`);

    createTag(
      "p",
      `opposition chose ${opposition_choice_in_toss}`,
      toss_choice_parentDiv
    );

    // Disable the buttons
    if (heads_or_tails == "heads") {
      document.getElementById("heads").disabled = true;
    } else {
      document.getElementById("tails").disabled = true;
    }
  });

  //function to add tags to html
  function createTag(tagname, message, parentDiv, id = null) {
    const tag = document.createElement(tagname);
    tag.textContent = message;
    if (id) {
      tag.id = id;
    }
    parentDiv.appendChild(tag);
  }
  const Game_area = document.getElementById("Game_Area");
  socket.on("toss result", (lose_or_win, toss_favor) => {
    if (lose_or_win === "won") {
      console.log(`You won the toss... the toss is in favour of ${toss_favor}`);
      createTag(
        "p",
        `Congrats!!! The Toss is in favour of ${toss_favor}`,
        toss_choice_parentDiv
      ); //displaying that they have won the toss
      createTag("button", "Bat", Game_area, "bat"); //creating button for "BAT"
      createTag("button", "Bowl", Game_area, "bowl"); //creating button for "BOWL"

      document.getElementById("bat").addEventListener("click", function () {
        socket.emit("bat_or_bowl choice", "bat", room_id);
        console.log(`You chose to bat`);
        document.getElementById("bat").disabled = true;
        document.getElementById("bowl").disabled = true;
      });

      document.getElementById("bowl").addEventListener("click", function () {
        socket.emit("bat_or_bowl choice", "bowl", room_id);
        console.log(`You chose to bowl`);
        document.getElementById("bat").disabled = true;
        document.getElementById("bowl").disabled = true;
      });
    } else {
      console.log(
        `You lost the toss... the toss is in favour of ${toss_favor}`
      );
      createTag(
        "p",
        `Sorry!!! The Toss is in favour of ${toss_favor}`,
        toss_choice_parentDiv
      ); //displaying that they have lost the toss
    }
  });

  socket.on("bat_or_bowl result", (value) => {
    you_are_currently = value; //value will be either bat or bowl.
    createTag("h4", `You got to ${value}`, Game_area, "you_are_currently");
    document.getElementById("choose_value").style.display = "block";

    startTimer(); //starting the timer
  });

  document
    .getElementById("choose_value")
    .addEventListener("click", function (event) {
      if (event.target.tagName === "BUTTON") {
        const targetId = event.target.id;
        console.log(`${targetId} has been pressed`);
        socket.emit(
          "choose value",
          parseInt(targetId),
          room_id,
          you_are_currently
        );
      }
      disable_enable_Buttons("disable");

      stopTimer(); //after user presses a button the timer stops.
    });

  function disable_enable_Buttons(enable_or_disable) {
    //value for enable_or_disable is either "enable" or "disable";
    if (enable_or_disable === "disable") {
      console.log(`disabling buttons`);
      for (let i = 1; i <= 6; i++) {
        document.getElementById(i + "").disabled = true;
      }
    }

    if (enable_or_disable === "enable") {
      console.log(`enabling buttons`);
      for (let i = 1; i <= 6; i++) {
        document.getElementById(i + "").disabled = false;
      }
    }
  }

  socket.on("update you_are_currently", (value) => {
    document.getElementById("score").innerText = `score=${0}`;
    if (value === "bat") {
      document.getElementById(
        "prevScore"
      ).innerHTML = `score to beat is ${prevScore}`;
    } else {
      document.getElementById(
        "prevScore"
      ).innerText = `Your score=${prevScore}`;
    }
    console.log(`Changing sides...signal from server `);
    document.getElementById("you_are_currently").style.display = "none";
    createTag(
      "h4",
      `Switching sides.....You are now ${value}ing`,
      Game_area,
      "you_are_currently_updated"
    );
    alert("switching sides");
    disable_enable_Buttons("enable");
    //code for enabling value buttons(1 to 6)
    you_are_currently = value;
    resetTimer();
    startTimer();
  });

  socket.on("score", (score) => {
    document.getElementById("score").innerText = `score=${score}`;
    prevScore = score;
    disable_enable_Buttons("enable");
    resetTimer(); //reset timer
    startTimer(); //Starting timer
  });

  let final_resut_div = document.getElementById("final result");
  socket.on("final result", (score, win_or_loose, largestScore) => {
    match_ended = true;
    console.log(`match ended= ${match_ended}`);
    stopTimer(); //when final result gets emitted timer stops
    disable_enable_Buttons("disable");
    if (win_or_loose === "win") {
      createTag("h3", "Congrats!! You win the game", final_resut_div);
      createTag("h3", `Score=${score}`, final_resut_div);
      console.log(`You win`);
      createTag("button", "Go Back", final_resut_div, "go_back_btn");
    } else {
      createTag("h3", "Sorry!! You loose the game", final_resut_div);
      createTag(
        "h3",
        `Your score=${score} , u lost by ${Math.abs(
          score - largestScore
        )} runs`,
        final_resut_div
      );
      console.log(`you loose`);
      createTag("button", "Go Back", final_resut_div, "go_back_btn");
    }

    document.getElementById("go_back_btn").addEventListener("click", () => {
      location.href = `../views/index.html`;
    });
  });

  socket.on("won_by_default", (value) => {
    if (match_ended === false) {
      //if match hasnt ended, only then u can win by default
      stopTimer(); //when final result gets emitted timer stops
      console.log(`Win by default`);
      createTag("h3", value, final_resut_div);
      createTag("button", "Go Back", final_resut_div, "go_back_btn");
      document.getElementById("go_back_btn").addEventListener("click", () => {
        location.href = `../views/index.html`;
      });
      disable_enable_Buttons("disable");
    }
  });

  //code for timer
  let timerInterval;
  let timeLeft = 25; // Initial time in seconds

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) {
        clearInterval(timerInterval); // Stop the timer when time runs out
        timerRunsOut(); // Call function when timer runs out
      } else {
        updateTimerDisplay(); // Update the timer display
      }
    }, 1000); // Update timer every second (1000 milliseconds)
  }

  function stopTimer() {
    clearInterval(timerInterval); // Stop the timer
  }

  function resetTimer() {
    stopTimer(); // Stop the timer if it's running
    timeLeft = 25; // Reset the time
    updateTimerDisplay(); // Update the display with the reset time
  }

  function updateTimerDisplay() {
    // Display the remaining time wherever you want
    let timerElement = document.getElementById("timer");
    // Format the time left (for example, as minutes and seconds)
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    let formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    // Update the content of the element with the formatted time
    timerElement.textContent = `Time left: ${formattedTime}`;
  }

  function timerRunsOut() {
    console.log("Timer has run out!");
    // Add your logic to execute when the timer runs out
    socket.emit("Time out", room_id);
  }
});