import json from './solutions.json' with {type: 'json'}

console.log("[LOAD] Script start");

// ----------------------------------------------------
// ELEMENT GETS
// ----------------------------------------------------
console.log("[LOAD] Grabbing DOM elements");

let answerBox = document.getElementById("guessinput");
let guessButton = document.getElementById("guessbutton");

let dayGuessCells = document.querySelectorAll("#dayguesses table tr td");

let activeSolutionId = 0;
let dayOfWeek = new Date().getDay();

let totalGuessesToday = 0;
let dayGuesses = [];

let guessData = JSON.parse(localStorage.getItem("guessData"));

let todayDate = getDateStr();

let objectClueMenu = document.getElementById("objectcluemenu");
let objectClueMenuOverlay = document.getElementById("objectcluemenuoverlay");
let objectClueMenuExit = document.getElementById("objectcluemenuclose");

let setupComplete = false;

let responseHistoryArrowLeft = document.getElementById("arrowleft");
let responseHistroyArrowRight = document.getElementById("arrowright");

let responseHistoryPanel = document.getElementById("weekresponses");
let responseHistoryDate = document.getElementById("responsehistorydate");
let responseHistoryWeeekday = document.querySelectorAll("#dayofweekindicator table tr td");
let responseHistoryDayResponses = document.querySelectorAll("#weekresponses #dayresponses table tr td");
let responseHistoryExitButton = document.querySelector("#weekresponses #exitbutton");

let responseHistoryCalendarButton = document.querySelector("#weekresponses #calendarbutton");
let responseHistoryCalendarPanel = document.getElementById("calendarpopup");
let responseHistoryCalendarPanelExitButton = document.querySelector("#calendarpopup #exitbutton");

let repsonseHistoryOpenButton = document.getElementById("seeresponsehistory");

let countdownMenu = document.getElementById("countdownmenu");
let countdownMenuExit = document.querySelector("#countdownmenu #exitbutton");

let infoMenu = document.getElementById("infomenu");
let infoMenuExit = document.querySelector("#infomenu #exitbutton");

let infoMenuPage2 = document.getElementById("infomenupage2");
let infoMenuPage2Exit = document.querySelector("#infomenupage2 #exitbutton");

let infoMenuArrow = document.querySelector("#infomenu #nextpagebutton");
let infoMenuBack = document.querySelector("#infomenupage2 #prevpagebutton");

let infoButton = document.getElementById("info");
let helpButton = document.getElementById("help");

let weekCompleteMenu = document.getElementById("weekcompletemenu");
let weekCompleteMenuExitButton = document.querySelector("#weekcompletemenu #exitbutton");
let weekCompleteShareButton = document.querySelector("#weekcompletemenu .share");

let calendarPopupSpaces = document.querySelectorAll("#calendarpopup #calendar td");

let calendarMonthSelect = document.querySelector("#dateselectbar #month");
let calendarYearSelect = document.querySelector("#dateselectbar #year");

let calendarDate = document.getElementById("calendardate");

let calendarBackArrow = document.querySelector("#calendarpopup #backarrow");
let calendarForwardArrow = document.querySelector("#calendarpopup #forwardarrow");

let calendarGraphic = document.getElementById("calendargraphic");

console.log("[LOAD] All DOM references acquired");

// ----------------------------------------------------
// RESTORE GUESSES
// ----------------------------------------------------
async function restoreGuesses() {
    console.log("[RESTORE] Starting restoreGuesses()");

    if (guessData == null) {
        console.log("[RESTORE] No guessData found, creating new array");
        guessData = [];
    } else {
        console.log("[RESTORE] Loaded guessData:", guessData);

        let dayGuessData = guessData.find(g => g.date === todayDate);

        if (dayGuessData != undefined) {
            console.log("[RESTORE] Found guesses for today:", dayGuessData.guesses);

            for (let i = 0; i < dayGuessData.guesses.length; i++) {
                console.log("[RESTORE] Restoring guess:", dayGuessData.guesses[i]);
                answerBox.value = dayGuessData.guesses[i];
                await guess();
            }
        }

        console.log("[RESTORE] Restoring previous days for this week...");

        for (let i = 0; i < dayOfWeek; i++) {
            let dateStr = getDateStr(i + 1, false);
            console.log("[RESTORE] Checking previous day:", dateStr);

            let dateSaveIndex = guessData.findIndex(g => g.date == dateStr);

            if (dateSaveIndex != -1) {
                console.log("[RESTORE] Found saved guesses for day", dateStr);
                let loadedGuesses = guessData[dateSaveIndex].guesses;

                for (let j = 0; j < loadedGuesses.length; j++) {
                    let loadedGuess = await sha256(formatAnswer(loadedGuesses[j]));

                    console.log("[RESTORE] Checking hash against solutions:", loadedGuess);

                    let correctId = -1;
                    for (let k = 0; k < 7; k++) {
                        if (json.weeks[0].solutions[k].solution == loadedGuess) {
                            correctId = k;
                        }
                    }

                    if (correctId != -1) {
                        console.log("[RESTORE] Marking previous correct clue as visible:", correctId);
                        objectClueChecks[correctId].classList.add("visible");
                    }
                }
            }
        }
    }
    console.log("[RESTORE] Finished restoreGuesses()");
}

// ----------------------------------------------------
// DOMContentLoaded
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    console.log("[INIT] DOMContentLoaded fired");

    guessButton.addEventListener("click", guess);
    objectClueMenuExit.addEventListener("click", () => {
        console.log("[CLUE] Closing clue menu");
        closeClueMenu();
    });

    objectClueMenuOverlay.addEventListener("click", (e) => {
        if (e.target == objectClueMenuOverlay) {
            console.log("[CLUE] Click outside overlay — closing menu");
            closeClueMenu();
        }
    });

    responseHistoryArrowLeft.addEventListener("click", () => {
        console.log("[HISTORY] Arrow left clicked");
        stepResponseHistoryDate(-1)
    });

    responseHistroyArrowRight.addEventListener("click", () => {
        console.log("[HISTORY] Arrow right clicked");
        stepResponseHistoryDate(1)
    });

    responseHistoryExitButton.addEventListener("click", () => {
        console.log("[HISTORY] Closing response history panel");
        responseHistoryPanel.classList.add("hidden")
    });

    repsonseHistoryOpenButton.addEventListener("click", () => {
        console.log("[HISTORY] Opening response history panel");
        responseHistoryPanel.classList.remove("hidden")
    });

    responseHistoryCalendarButton.addEventListener("click", () => {
        console.log("[CALENDAR] Opening calendar");
        responseHistoryCalendarPanel.classList.add("visible");
        buildCalendar();
    });

    responseHistoryCalendarPanelExitButton.addEventListener("click", () => {
        console.log("[CALENDAR] Closing calendar popup");
        responseHistoryCalendarPanel.classList.remove("visible")
    });

    countdownMenuExit.addEventListener("click", () => {
        console.log("[COUNTDOWN] Closing countdown menu");
        countdownMenu.classList.remove("visible")
    });

    infoButton.addEventListener("click", () => {
        console.log("[INFO] Opening countdown menu");
        countdownMenu.classList.add("visible")
    });

    infoMenuExit.addEventListener("click", () => {
        console.log("[INFO] Closing info menu");
        infoMenu.classList.remove("visible")
    });

    helpButton.addEventListener("click", () => {
        console.log("[INFO] Opening info menu (help)");
        infoMenu.classList.add("visible")
    });

    infoMenuArrow.addEventListener("click", () => {
        console.log("[INFO] Switching to page 2");
        infoMenu.classList.remove("visible");
        infoMenuPage2.classList.add("visible")
    });

    infoMenuBack.addEventListener("click", () => {
        console.log("[INFO] Back to page 1");
        infoMenu.classList.add("visible");
        infoMenuPage2.classList.remove("visible")
    });

    infoMenuPage2Exit.addEventListener("click", () => {
        console.log("[INFO] Closing page 2");
        infoMenuPage2.classList.remove("visible")
    });

    weekCompleteMenuExitButton.addEventListener("click", () => {
        console.log("[WEEK] Closing week complete menu");
        weekCompleteMenu.classList.remove("visible")
    });

    weekCompleteShareButton.addEventListener("click", () => {
        console.log("[WEEK] Share button clicked");
        share(true)
    });

    calendarMonthSelect.addEventListener("change", () => {
        console.log("[CALENDAR] Month changed to", calendarMonthSelect.selectedIndex);
        selectedMonth = calendarMonthSelect.selectedIndex;
        buildCalendar(true)
    });

    calendarYearSelect.addEventListener("change", () => {
        console.log("[CALENDAR] Year changed to", calendarYearSelect.selectedIndex + 2025);
        selectedYear = calendarYearSelect.selectedIndex + 2025;
        buildCalendar(true)
    });

    calendarBackArrow.addEventListener("click", () => {
        console.log("[CALENDAR] Back month");
        selectedMonth--;
        buildCalendar(true);
    });

    calendarForwardArrow.addEventListener("click", () => {
        console.log("[CALENDAR] Forward month");
        selectedMonth++;
        buildCalendar(true);
    });

    calendarPopupSpaces.forEach((square, i) => {
        square.addEventListener("click", () => {
            console.log("[CALENDAR] Clicked square index", i);
            calendarSpaceClicked(i)
        });
    });

    console.log("[INIT] Event listeners attached");
});

// ----------------------------------------------------
// Guess on Enter
// ----------------------------------------------------
answerBox.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        console.log("[GUESS] Enter pressed — triggering guess()");
        event.preventDefault();
        guessButton.click();
    }
});

// ----------------------------------------------------
// Difficulty colors init
// ----------------------------------------------------
console.log("[INIT] Setting up difficulty colors");

let objectClues = document.querySelectorAll("#completiongrid #difficultybar td");
let objectClueChecks = document.querySelectorAll("#completiongrid #completionbar td");

let difficultyColors = ["#00ff0055", "#ffff0055", "#ff000055", "#ff00ff55"];

for (let i = 0; i < 7; i++) {
    objectClues[i].style.backgroundColor = difficultyColors[json.weeks[activeSolutionId].solutions[i].difficulty];
    console.log(`[INIT] Difficulty square ${i} color set`);
}

objectClues.forEach((objectClue, index) => {
    document.addEventListener("DOMContentLoaded", () => {
        objectClue.addEventListener("click", () => {
            console.log("[CLUE] Opening clue for index:", index);
            openClueMenu(index)
        });
    });
});

console.log("[INIT] Restoring guesses...");
await restoreGuesses();
setupComplete = true;
console.log("[INIT] Setup complete");

// ----------------------------------------------------
// GUESS FUNCTION
// ----------------------------------------------------
async function guess() {
    console.log("[GUESS] Guess triggered");

    if (totalGuessesToday == 5) {
        console.log("[GUESS] Already reached 5 guesses — ignoring");
        return;
    }
    if (answerBox.value == "") {
        console.log("[GUESS] Empty guess — ignoring");
        return;
    }

    if (answerBox.value.length > 50) {
        console.log("[GUESS] Trimming long input");
        answerBox.value = answerBox.value.substring(0, 50);
    }

    console.log("[GUESS] Raw guess:", answerBox.value);

    let answer = answerBox.value;
    answer = formatAnswer(answer);

    console.log("[GUESS] Formatted answer:", answer);

    answer = await sha256(answer);

    console.log("[GUESS] SHA256 hash:", answer);

    let correctId = -1;
    for (let i = 0; i < 7; i++) {
        if (json.weeks[0].solutions[i].solution == answer) {
            correctId = i;
        }
    }

    if (correctId != -1) {
        console.log("[GUESS] Correct guess index:", correctId);

        if (!objectClueChecks[correctId].classList.contains("visible")) {
            dayGuessCells[totalGuessesToday].style.backgroundColor = "#00ff0099";
            objectClueChecks[correctId].classList.add("visible");
        }
    } else {
        console.log("[GUESS] Incorrect guess");
    }

    dayGuessCells[totalGuessesToday].innerHTML = answerBox.value;
    dayGuessCells[totalGuessesToday].classList.add("filled");

    dayGuesses.push(answerBox.value);

    let index = guessData.findIndex(g => g.date == todayDate);

    if (setupComplete) {
        console.log("[GUESS] Saving guess to localStorage");
        if (index == -1) {
            guessData.push({ date: todayDate, guesses: dayGuesses });
        } else {
            guessData[index].guesses = dayGuesses;
        }

        saveGuessData();
    }

    answerBox.value = "";

    totalGuessesToday++;
    console.log("[GUESS] Guess count today:", totalGuessesToday);

    if (totalGuessesToday == 5) {
        console.log("[GUESS] Max guesses hit — showing countdown menu");
        countdownMenu.classList.add("visible");
    }
}

// ----------------------------------------------------
// FORMAT ANSWER
// ----------------------------------------------------
function formatAnswer(a) {
    return a.toLowerCase().replace(" ", "");
}

// ----------------------------------------------------
// SHA256
// ----------------------------------------------------
function sha256(message) {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

// ----------------------------------------------------
// CLUE MENU
// ----------------------------------------------------
let objectClueMenuCategory = document.getElementById("category");
let objectClueTable = document.querySelectorAll("#objectcluemenu > table tr td");

function openClueMenu(itemIndex) {
    console.log("[CLUE] Opening clue menu for index", itemIndex);

    objectClueMenuCategory.innerHTML = json.weeks[activeSolutionId].solutions[itemIndex].category;

    for (let i = 0; i < 7; i++) {
        if (i <= dayOfWeek) {
            objectClueTable[i].innerHTML = json.weeks[activeSolutionId].hint[itemIndex].hints[i];
        } else {
            objectClueTable[i].innerHTML = getDateStr(getWeekday() - i, true, false);
        }
    }

    objectClueMenuOverlay.classList.add("visible");
    objectClueMenu.classList.add("visible");
}

function closeClueMenu() {
    console.log("[CLUE] Closing clue menu");
    objectClueMenu.classList.remove("visible");
    objectClueMenuOverlay.classList.remove("visible");
}

// ----------------------------------------------------
// SAVE GUESS DATA
// ----------------------------------------------------
function saveGuessData() {
    console.log("[SAVE] Saving guessData:", guessData);
    localStorage.setItem("guessData", JSON.stringify(guessData));
}

// ----------------------------------------------------
// COUNTDOWN
// ----------------------------------------------------
let countdown = document.getElementById("countdown");

console.log("[COUNTDOWN] Starting update loop");
updateCountdown();
setInterval(() => {
    updateCountdown();
}, 1000);

function updateCountdown() {
    let now = new Date();
    let tomorrow = new Date(now)
    tomorrow.setHours(24, 0, 0, 0);

    let diff = Math.floor((tomorrow - now) / 1000);

    let hours = Math.floor(diff / 3600);
    let minutes = Math.floor((diff - (hours * 3600)) / 60);
    let seconds = Math.floor((diff - hours * 3600 - minutes * 60));

    countdown.innerHTML =
        (hours < 10 ? "0" : "") + hours + ":" +
        (minutes < 10 ? "0" : "") + minutes + ":" +
        (seconds < 10 ? "0" : "") + seconds;

    if (countdown.innerHTML == "00:00:00") {
        console.log("[COUNTDOWN] End reached — reloading");
        window.location.reload();
    }
}

// ----------------------------------------------------
// GET DATE HELPERS
// ----------------------------------------------------
function getDateStr(dayOffset = 0, display = false, showYear = true) {
    let date = new Date();
    date.setDate(date.getDate() - dayOffset);

    if (!display) {
        if (showYear) {
            return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
        } else {
            return (date.getMonth() + 1) + "/" + date.getDate();
        }
    } else {
        if (showYear) {
            return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        } else {
            return (date.getMonth() + 1) + "/" + date.getDate();
        }
    }
}

function getWeekday(dayOffset = 0) {
    let date = new Date();
    date.setDate(date.getDate() - dayOffset);
    return date.getDay();
}

// ----------------------------------------------------
// RESPONSE HISTORY
// ----------------------------------------------------
let displayDate = 1;

console.log("[HISTORY] Initializing response history");
stepResponseHistoryDate(0);

async function stepResponseHistoryDate(val) {
    console.log("[HISTORY] stepResponseHistoryDate +", val);

    if (displayDate - val >= 1) {
        displayDate -= val;
    }

    let dateStr = getDateStr(displayDate, true);
    console.log("[HISTORY] Displaying date:", dateStr);

    responseHistoryDate.innerHTML = dateStr;

    responseHistoryWeeekday.forEach(d => d.classList.remove("active"));
    responseHistoryWeeekday[getWeekday(displayDate)].classList.add("active");

    let histDayData = guessData.find(g => g.date === getDateStr(displayDate, false));

    if (histDayData != undefined) {
        console.log("[HISTORY] Found stored data:", histDayData.guesses);

        for (let i = 0; i < histDayData.guesses.length; i++) {
            responseHistoryDayResponses[i].innerHTML = histDayData.guesses[i];

            let histAnswer = await sha256(formatAnswer(histDayData.guesses[i]));

            let correctId = -1;
            for (let k = 0; k < 7; k++) {
                if (json.weeks[0].solutions[k].solution == histAnswer) {
                    correctId = k;
                }
            }

            if (correctId != -1) {
                responseHistoryDayResponses[i].classList.add("correct");
            } else {
                responseHistoryDayResponses[i].classList.remove("correct");
            }
        }
    } else {
        console.log("[HISTORY] No guesses found for date");
        for (let i = 0; i < 5; i++) {
            responseHistoryDayResponses[i].innerHTML = "";
            responseHistoryDayResponses[i].classList.remove("correct");
        }
    }
}

async function definiteResponseHistoryDate(val) {
    console.log("[HISTORY] definiteResponseHistoryDate", val);
    stepResponseHistoryDate(val + displayDate);
}

// ----------------------------------------------------
// SHARE (placeholder)
// ----------------------------------------------------
function share(shareWeek = false) {
    console.log("[SHARE] share() called. shareWeek =", shareWeek);
}

// ----------------------------------------------------
// CALENDAR
// ----------------------------------------------------
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();

function buildCalendar(isCallback = false) {
    console.log("[CALENDAR] buildCalendar() called. Callback:", isCallback);
    console.log("[CALENDAR] Month:", selectedMonth, "Year:", selectedYear);

    if (!isCallback) {
        calendarMonthSelect.selectedIndex = selectedMonth;
        calendarYearSelect.selectedIndex = selectedYear - 2025;
    }

    if (selectedMonth == -1) {
        selectedYear--;
        selectedMonth = 11;
    }

    if (selectedMonth == 12) {
        selectedYear++;
        selectedMonth = 0;
    }

    let todayDate = new Date();
    todayDate.setMonth(selectedMonth);
    todayDate.setFullYear(selectedYear);

    let transformDate = new Date(todayDate);

    while (transformDate.getDate() != 1) {
        transformDate.setDate(transformDate.getDate() - 1);
    }

    let gridFillStart = transformDate.getDay();
    let reachedEndOfMonth = false;

    console.log("[CALENDAR] Starting grid fill at weekday", gridFillStart);

    for (let i = 0; i < calendarPopupSpaces.length; i++) {
        if (gridFillStart > i) {
            calendarPopupSpaces[i].classList.add("hidden");
            calendarPopupSpaces[i].classList.remove("data");
            calendarPopupSpaces[i].classList.remove("today");
            calendarPopupSpaces[i].innerHTML = "";
        } else {
            if (transformDate.getDate() == 1 && i - gridFillStart != 0) {
                reachedEndOfMonth = true;
            }

            if (!reachedEndOfMonth) {
                calendarPopupSpaces[i].innerHTML = transformDate.getDate();
            } else {
                calendarPopupSpaces[i].innerHTML = "";
            }

            if (Math.round((transformDate - new Date()) / (1000 * 60 * 60 * 24)) == 0) {
                calendarPopupSpaces[i].classList.add("today");
            } else {
                calendarPopupSpaces[i].classList.remove("today");
            }

            let dateOffset = (transformDate - new Date()) / (1000 * 60 * 60 * 24);
            let calendarDayData = guessData.find(g => g.date === getDateStr(-dateOffset - 1, false));

            if (calendarDayData != undefined) {
                calendarPopupSpaces[i].classList.add("data");
            } else {
                calendarPopupSpaces[i].classList.remove("data");
            }

            transformDate.setDate(transformDate.getDate() + 1);
        }
    }

    calendarDate.innerHTML = calendarMonthSelect[selectedMonth].text + " " + selectedYear;
    console.log("[CALENDAR] Calendar render complete");
}

function calendarSpaceClicked(index) {
    console.log("[CALENDAR] Space clicked:", index);

    let day = calendarPopupSpaces[index].innerHTML;

    if (day == "") {
        console.log("[CALENDAR] Clicked empty space — ignoring");
        return;
    }

    let clickedDate = new Date();
    clickedDate.setFullYear(selectedYear);
    clickedDate.setMonth(selectedMonth);
    clickedDate.setDate(day);

    if (clickedDate >= new Date()) {
        console.log("[CALENDAR] Clicked future date — ignoring");
        return;
    }

    let dateOffset = (clickedDate - new Date()) / (1000 * 60 * 60 * 24);

    console.log("[CALENDAR] Opening history for offset:", dateOffset);
    definiteResponseHistoryDate(dateOffset);

    responseHistoryCalendarPanel.classList.remove("visible");
}

// ----------------------------------------------------
// START
// ----------------------------------------------------
start();

function start() {
    console.log("[INIT] Starting final setup tasks");

    let allComplete = true;

    for (let i = 0; i < 7; i++) {
        if (!objectClueChecks[i].classList.contains("visible")) {
            allComplete = false;
        }
    }

    if (allComplete) {
        console.log("[INIT] All clues complete — showing weekComplete menu");
        weekCompleteMenu.classList.add("visible");
    }

    if (localStorage.getItem("opened") == null) {
        console.log("[INIT] First-time visitor — showing info menu");
        infoMenu.classList.add("visible");
        localStorage.setItem("opened", true);
    }

    let currentYear = new Date().getFullYear();
    for (let i = 0; i < currentYear - 2025; i++) {
        calendarYearSelect.add(new Option(i + 2025 + 1));
    }

    console.log("[INIT] Start() complete");
}
