import json from './solutions.json' with {type: 'json'}

let answerBox = document.getElementById("guessinput");
let guessButton = document.getElementById("guessbutton");

let dayGuessCells = document.querySelectorAll("#dayguesses table tr td");

let activeSolutionId = 0; //changes depending on the week
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

let previousWeekAnswers = document.getElementById("lastweekanswers");
let previousWeekAnswersOpenButton = document.getElementById("seesolutions");
let previousWeekAnswersExitButton = document.querySelector("#lastweekanswers #exitbutton");

let dayIndicator = document.querySelector("#dayindicator h2");
dayIndicator.innerHTML = dayOfWeek + 1;

let countdownMenuShareButton = document.querySelector("#countdownmenu .share");

let onMainPage = true;

let score = parseInt(localStorage.getItem("score")) || 0;
let scoreDisplay = document.querySelector("#score h2");
scoreDisplay.innerHTML = score;

let weekCompleteMenuWordsWillResetText = document.querySelector("#weekcompletemenu #wordswillreset");

let objectClueMenuLeftArrow = document.querySelector("#objectcluemenu #leftarrow");
let objectClueMenuRightArrow = document.querySelector("#objectcluemenu #rightarrow");

let objectClueMenuPageIndex = document.getElementById("clueindex");

async function restoreGuesses() {
    if (guessData == null) {
        guessData = [];
    } else {
        //set guesses to guesses already done today if found
        let dayGuessData = guessData.find(guessData => guessData.date === todayDate);

        if (dayGuessData != undefined) {

            //console.log(dayGuessData.guesses);
            for (let i = 0; i < dayGuessData.guesses.length; i++) {
                //console.log(dayGuessData.guesses[i]);
                answerBox.value = dayGuessData.guesses[i];
                await guess();
            }
        }

        //go through previous day responses for the week
        for (let i = 0; i < dayOfWeek; i++) {
            let dateStr = getDateStr(i + 1, false);

            let dateSaveIndex = guessData.findIndex(guessData => guessData.date == dateStr);

            if (dateSaveIndex != -1) {
                let loadedGuesses = guessData[dateSaveIndex].guesses;

                for (let j = 0; j < loadedGuesses.length; j++) {
                    //console.log(formatAnswer(loadedGuesses[j]));
                    let loadedGuess = await sha256(formatAnswer(loadedGuesses[j]));

                    let correctId = -1;
                    for (let k = 0; k < 7; k++) {
                        if (json.weeks[0].solutions[k].solution == loadedGuess) {
                            correctId = k;
                        }
                    }

                    if (correctId != -1) {
                        objectClueChecks[correctId].classList.add("visible");
                    }
                }
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    guessButton.addEventListener("click", guess);
    objectClueMenuExit.addEventListener("click", closeClueMenu);

    objectClueMenuOverlay.addEventListener("click", (e) => { if (e.target == objectClueMenuOverlay) { closeClueMenu(); } });

    responseHistoryArrowLeft.addEventListener("click", () => { stepResponseHistoryDate(-1) });
    responseHistroyArrowRight.addEventListener("click", () => { stepResponseHistoryDate(1) });

    responseHistoryExitButton.addEventListener("click", () => { responseHistoryPanel.classList.add("hidden"); onMainPage = true; });
    repsonseHistoryOpenButton.addEventListener("click", () => { onMainPage && responseHistoryPanel.classList.remove("hidden"); onMainPage = false; });

    responseHistoryCalendarButton.addEventListener("click", () => { responseHistoryCalendarPanel.classList.add("visible"); buildCalendar(); });
    responseHistoryCalendarPanelExitButton.addEventListener("click", () => { responseHistoryCalendarPanel.classList.remove("visible") });

    countdownMenuExit.addEventListener("click", () => { countdownMenu.classList.remove("visible"); onMainPage = true; });

    infoButton.addEventListener("click", () => { onMainPage && countdownMenu.classList.add("visible"); onMainPage = false; });

    infoMenuExit.addEventListener("click", () => { infoMenu.classList.remove("visible"); onMainPage = true; });
    helpButton.addEventListener("click", () => { onMainPage && infoMenu.classList.add("visible"); onMainPage = false; });

    infoMenuArrow.addEventListener("click", () => { infoMenu.classList.remove("visible"); infoMenuPage2.classList.add("visible"); onMainPage = false; });
    infoMenuBack.addEventListener("click", () => { infoMenu.classList.add("visible"); infoMenuPage2.classList.remove("visible"); onMainPage = false; });

    infoMenuPage2Exit.addEventListener("click", () => { infoMenuPage2.classList.remove("visible"); onMainPage = true; });

    weekCompleteMenuExitButton.addEventListener("click", () => { weekCompleteMenu.classList.remove("visible") });

    weekCompleteShareButton.addEventListener("click", () => { share(true) });

    countdownMenuShareButton.addEventListener("click", () => { share(true) });

    calendarMonthSelect.addEventListener("change", () => { selectedMonth = calendarMonthSelect.selectedIndex; buildCalendar(true) });
    calendarYearSelect.addEventListener("change", () => { selectedYear = calendarYearSelect.selectedIndex + 2025; buildCalendar(true) });

    calendarBackArrow.addEventListener("click", () => { selectedMonth--; buildCalendar(true); });
    calendarForwardArrow.addEventListener("click", () => { selectedMonth++; buildCalendar(true); });

    calendarPopupSpaces.forEach((square, i) => { square.addEventListener("click", () => { calendarSpaceClicked(i) }); });

    objectClueMenuLeftArrow.addEventListener("click", () => {
        let currentCategory = objectClueMenuCategory.innerHTML;

        let currentIndex = -1;
        for (let i = 0; i < 7; i++) {
            if (json.weeks[activeSolutionId].solutions[i].category == currentCategory) {
                currentIndex = i;
            }
        }

        let newIndex = currentIndex - 1;
        if (newIndex < 0) {
            newIndex = 6;
        }

        if(!onMainPage){
            openClueMenu(newIndex);
        }else{
            openClueMenu(0);
        }
    });

    objectClueMenuRightArrow.addEventListener("click", () => {
        let currentCategory = objectClueMenuCategory.innerHTML;

        let currentIndex = -1;
        for (let i = 0; i < 7; i++) {
            if (json.weeks[activeSolutionId].solutions[i].category == currentCategory) {
                currentIndex = i;
            }
        }

        let newIndex = currentIndex + 1;
        if (newIndex > 6) {
            newIndex = 0;
        }

        if(!onMainPage){
            openClueMenu(newIndex);
        }else{
            openClueMenu(0);
        }
    });

    //previousWeekAnswersOpenButton.addEventListener("click", () => { previousWeekAnswers.classList.add("visible"); onMainPage = false });
    previousWeekAnswersExitButton.addEventListener("click", () => { previousWeekAnswers.classList.remove("visible"); onMainPage = true });

    document.addEventListener("keydown", function (event) {
        if (event.key === "1") {
            openClueMenu(0);
        }
        if (event.key === "2") {
            openClueMenu(1);
        }
        if (event.key === "3") {
            openClueMenu(2);
        }
        if (event.key === "4") {
            openClueMenu(3);
        }
        if (event.key === "5") {
            openClueMenu(4);
        }
        if (event.key === "6") {
            openClueMenu(5);
        }
        if (event.key === "7") {
            openClueMenu(6);
        }

        if (event.key == "Escape") {
            closeClueMenu();
        }

        if(event.key == "ArrowLeft"){
            let currentCategory = objectClueMenuCategory.innerHTML;

            let currentIndex = -1;
            for (let i = 0; i < 7; i++) {
                if (json.weeks[activeSolutionId].solutions[i].category == currentCategory) {
                    currentIndex = i;
                }
            }

            let newIndex = currentIndex - 1;
            if (newIndex < 0) {
                newIndex = 6;
            }

            openClueMenu(newIndex);
        }

        if(event.key == "ArrowRight"){
            let currentCategory = objectClueMenuCategory.innerHTML;

            let currentIndex = -1;
            for (let i = 0; i < 7; i++) {
                if (json.weeks[activeSolutionId].solutions[i].category == currentCategory) {
                    currentIndex = i;
                }
            }

            let newIndex = currentIndex + 1;
            if (newIndex > 6) {
                newIndex = 0;
            }

            openClueMenu(newIndex);
        }
    });

});

answerBox.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        event.preventDefault();
        guessButton.click();
    }
});

//setup difficulty color
let objectClues = document.querySelectorAll("#completiongrid #difficultybar td");
let objectClueChecks = document.querySelectorAll("#completiongrid #completionbar td");

let difficultyColors = ["#00ff0055", "#ffff0055", "#ff000055", "#ff00ff55"];

for (let i = 0; i < 7; i++) {
    objectClues[i].style.backgroundColor = difficultyColors[json.weeks[activeSolutionId].solutions[i].difficulty];
}

objectClues.forEach((objectClue, index) => {
    document.addEventListener("DOMContentLoaded", () => {
        objectClue.addEventListener("click", () => openClueMenu(index));
    });
});

await restoreGuesses();
setupComplete = true;

async function guess() {
    let guessCorrect = false;

    if (totalGuessesToday == 5 || answerBox.value == "") {
        return;
    }

    if (answerBox.value.length > 50) {
        answerBox.value = answerBox.value.substring(0, 50);
    }

    let answer = answerBox.value;
    answer = formatAnswer(answer);

    answer = await sha256(answer);

    let correctId = -1;
    for (let i = 0; i < 7; i++) {
        if (json.weeks[0].solutions[i].solution == answer) {
            correctId = i;
        }
    }

    if (correctId != -1 && !objectClueChecks[correctId].classList.contains("visible") && dayGuessCells[totalGuessesToday].style.backgroundColor != "#00ff0099") {
        dayGuessCells[totalGuessesToday].style.backgroundColor = "#00ff0099";
        objectClueChecks[correctId].classList.add("visible");

        if(setupComplete){
            let totalWords = parseInt(localStorage.getItem("totalwords")) || 0;

            totalWords++;
            localStorage.setItem("totalwords", totalWords);
            document.getElementById("wordsstat").innerHTML = totalWords;

            guessCorrect = true;

            score += 5 * (parseInt(json.weeks[activeSolutionId].solutions[correctId].difficulty) + 1) * (7 - dayOfWeek);
            updateScoreDisplay();
        }

        //console.log("correct");
    } else {
        //console.log("wrong");
    }

    dayGuessCells[totalGuessesToday].innerHTML = answerBox.value;
    dayGuessCells[totalGuessesToday].classList.add("filled");

    dayGuesses.push(answerBox.value);

    let index = guessData.findIndex(guessData => guessData.date == todayDate);

    if (setupComplete) {
        if (index == -1) {
            guessData.push({ date: todayDate, guesses: dayGuesses });
        } else {
            guessData[index].guesses = dayGuesses;
        }

        saveGuessData();

        //stats
        let totalGuesses = parseInt(localStorage.getItem("totalguesses")) || 0;

        totalGuesses++;
        localStorage.setItem("totalguesses", totalGuesses);
        document.getElementById("guessesstat").innerHTML = totalGuesses;

        if(!guessCorrect){
            score++;
            updateScoreDisplay();
        }

        //checks for week completion
        let allComplete = true;
        for (let i = 0; i < 7; i++) {
            if (!objectClueChecks[i].classList.contains("visible")) {
                allComplete = false;
            }
        }

        if (allComplete) {
            weekCompleteMenu.classList.add("visible");
            score += 50 * (7 - dayOfWeek);
            updateScoreDisplay();
            updateWeekCompletionPercentageStat();
        }
    }

    answerBox.value = "";

    totalGuessesToday++;

    if (totalGuessesToday == 5) {
        countdownMenu.classList.add("visible");
    }
}

function formatAnswer(a) {
    a = a.toLowerCase();

    a = a.replace(" ", "");

    return a;
}

function sha256(message) {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

let objectClueMenuCategory = document.getElementById("category");
let objectClueTable = document.querySelectorAll("#objectcluemenu > table tr td");

function openClueMenu(itemIndex) {
    if (!onMainPage && !objectClueMenu.classList.contains("visible")) {
        return;
    }

    objectClueMenuPageIndex.innerHTML = (itemIndex + 1).toString();

    onMainPage = false;

    objectClueMenuCategory.innerHTML = json.weeks[activeSolutionId].solutions[itemIndex].category;

    for (let i = 0; i < 7; i++) {
        if (i <= dayOfWeek) {
            objectClueTable[i].innerHTML = json.weeks[activeSolutionId].hint[itemIndex].hints[i];
        } else {
            //fill with date of reveal
            objectClueTable[i].innerHTML = getDateStr(getWeekday() - i, true, false);
        }
    }

    objectClueMenuOverlay.classList.add("visible");
    objectClueMenu.classList.add("visible");
}

function closeClueMenu() {
    onMainPage = true;

    objectClueMenu.classList.remove("visible");
    objectClueMenuOverlay.classList.remove("visible");
}

function saveGuessData() {
    localStorage.setItem("guessData", JSON.stringify(guessData));
}

let countdown = document.getElementById("countdown");

updateCountdown();

setInterval(() => {
    updateCountdown();
}, 1000);

function updateCountdown() {
    let now = new Date();
    let tomorrow = new Date(now) // est offset
    tomorrow.setHours(24, 0, 0, 0);

    let diff = Math.floor((tomorrow - now) / 1000);
    //console.log(diff)

    let hours = Math.floor(diff / 3600);
    let minutes = Math.floor((diff - (hours * 3600)) / 60);
    let seconds = Math.floor((diff - hours * 3600 - minutes * 60));

    hours = hours.toString();
    minutes = minutes.toString();
    seconds = seconds.toString();

    while (hours.length < 2) {
        hours = "0" + hours;
    }

    while (minutes.length < 2) {
        minutes = "0" + minutes;
    }

    while (seconds.length < 2) {
        seconds = "0" + seconds;
    }

    countdown.innerHTML = hours + ":" + minutes + ":" + seconds;

    if (countdown.innerHTML == "00:00:00") {
        window.location.reload();
    }
}

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

let displayDate = 1;

stepResponseHistoryDate(0);

async function stepResponseHistoryDate(val) {
    if (displayDate - val >= 1) {
        displayDate -= val;
    }

    responseHistoryDate.innerHTML = getDateStr(displayDate, true);

    for (let i = 0; i < responseHistoryWeeekday.length; i++) {
        responseHistoryWeeekday[i].classList.remove("active");
    }

    responseHistoryWeeekday[getWeekday(displayDate)].classList.add("active");

    let histDayData = guessData.find(guessData => guessData.date === getDateStr(displayDate, false));

    if (histDayData != undefined) {
        //fill table with the responses from that day
        for (let i = 0; i < histDayData.guesses.length; i++) {
            responseHistoryDayResponses[i].innerHTML = histDayData.guesses[i];

            //set color of box if correct
            let histAnswer = formatAnswer(histDayData.guesses[i]);

            histAnswer = await sha256(histAnswer);

            let correctId = -1;
            for (let i = 0; i < 7; i++) {
                if (json.weeks[0].solutions[i].solution == histAnswer) {
                    correctId = i;
                }
            }

            if (correctId != -1) {
                responseHistoryDayResponses[i].classList.add("correct");
            } else {
                responseHistoryDayResponses[i].classList.remove("correct");
            }
        }
    } else {
        for (let i = 0; i < 5; i++) {
            responseHistoryDayResponses[i].innerHTML = "";
            responseHistoryDayResponses[i].classList.remove("correct");
        }
    }
}

async function definiteResponseHistoryDate(val) {
    //console.log(displayDate, val);
    stepResponseHistoryDate(val + displayDate);
}

async function share(shareWeek = false) { //shares just today if false
    let output = "WeekWord " + getDateStr() + "\n";

    //word completion
    for(let i = 0; i < 7; i++){
        let difficultyVal = parseInt(json.weeks[activeSolutionId].solutions[i].difficulty);

        if(difficultyVal == 0){
            output += "🟩";
        }else if(difficultyVal == 1){
            output += "🟨";
        }else if(difficultyVal == 2){
            output += "🟥";
        }else{
            output += "🟪";
        }
    }

    output += "\n";

    //word completion checks
    for (let i = 0; i < 7; i++) {
        if (objectClueChecks[i].classList.contains("visible")) {
            output += "✅";
        } else {
            output += "⬜";
        }
    }

    output += "\n\n";

    /*
    let daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

    if (shareWeek) {
        for (let i = 0; i <= dayOfWeek; i++) {
            output += daysOfWeek[i] + " ";
        }
    }*/

    output += "Week Progress\n";

    let usedWords = [];

    for(let i = 0; i < 5; i++){
        for(let j = 0; j <= dayOfWeek; j++){
            let histDayData = guessData.find(guessData => guessData.date === getDateStr(dayOfWeek - j, false));

            if(histDayData != undefined && histDayData.guesses.length > i){
                let histAnswer = formatAnswer(histDayData.guesses[i]);

                histAnswer = await sha256(histAnswer);

                let correctId = -1;
                for (let k = 0; k < 7; k++) {
                    if (json.weeks[0].solutions[k].solution == histAnswer) {
                        correctId = k;
                    }
                }

                if (correctId != -1 && usedWords.indexOf(correctId) == -1) {
                    output += "✅";
                    usedWords.push(correctId);
                } else {
                    output += "⬜";
                }
            }else{
                output += "⬛";
            }
        }

        output += "\n";
    }

    //console.log(output);

    if (navigator.share && isMobile()) {
        navigator.share({
            text: output
        });
    } else {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(output)
                .then(() => copyToClipboardNotice())
                .catch(() => legacyCopy(output));
        } else {
            legacyCopy(output);
        }
    }
}

function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    copyToClipboardNotice();
}

let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();

function buildCalendar(isCallback = false) { //what the fuck
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

    if (selectedYear < 1970) {
        selectedYear = 1970;
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

            calendarPopupSpaces[i].innerHTML = transformDate.getDate();

            if (reachedEndOfMonth) {
                calendarPopupSpaces[i].classList.add("hidden");
                calendarPopupSpaces[i].innerHTML = "";
            } else {
                calendarPopupSpaces[i].classList.remove("hidden");
                calendarPopupSpaces[i].classList.remove("today");
            }

            let dateOffset = Math.round((transformDate - new Date()) / (1000 * 60 * 60 * 24));

            let calendarDayData = guessData.find(guessData => guessData.date === getDateStr(-dateOffset, false));

            //console.log(dateOffset);

            if (dateOffset == 0 && !reachedEndOfMonth) {
                calendarPopupSpaces[i].classList.add("today");
            }

            if (calendarDayData != undefined && !reachedEndOfMonth) {
                calendarPopupSpaces[i].classList.add("data");
            } else {
                calendarPopupSpaces[i].classList.remove("data");
            }

            transformDate.setDate(transformDate.getDate() + 1);
        }
    }

    calendarDate.innerHTML = calendarMonthSelect[selectedMonth].text + " " + selectedYear;
}

function calendarSpaceClicked(index) {
    //get if valid date and what it is
    let day = calendarPopupSpaces[index].innerHTML;

    if (day == "") {
        return;
    }

    let clickedDate = new Date();
    clickedDate.setFullYear(selectedYear);
    clickedDate.setMonth(selectedMonth);
    clickedDate.setDate(day);

    if (clickedDate >= new Date()) {
        return;
    }

    let dateOffset = (clickedDate - new Date()) / (1000 * 60 * 60 * 24);

    definiteResponseHistoryDate(dateOffset);
    responseHistoryCalendarPanel.classList.remove("visible");
}

start();

function start() {
    //website start functions
    let allComplete = true;
    for (let i = 0; i < 7; i++) {
        if (!objectClueChecks[i].classList.contains("visible")) {
            allComplete = false;
        }
    }

    if (allComplete) {
        weekCompleteMenu.classList.add("visible");
    }

    //checks if first open
    if (localStorage.getItem("opened") == null) {
        infoMenu.classList.add("visible");

        localStorage.setItem("opened", true);
    }

    //fill year select box with years following 2025
    let currentYear = new Date().getFullYear();

    for (let i = 0; i < currentYear - 2025; i++) {
        calendarYearSelect.add(new Option(i + 2025 + 1));
    }

    //streak updater
    let streak = parseInt(localStorage.getItem("daystreak")) || 1;
    let lastDateStr = localStorage.getItem("lastdate") || null;

    if(getDateStr(0,false) == lastDateStr){
        //same day, do nothing
    }else if(getDateStr(1,false) == lastDateStr){
        //next day, increase streak
        streak++;
        localStorage.setItem("daystreak", streak);
        localStorage.setItem("lastdate", getDateStr(0,false));
    }else{
        //missed day, reset streak
        streak = 1;
        localStorage.setItem("daystreak", streak);
        localStorage.setItem("lastdate", getDateStr(0,false));
    }

    document.getElementById("daystreakstat").innerHTML = streak;

    //other stats
    let totalWords = localStorage.getItem("totalwords") || 0;
    let totalGuesses = localStorage.getItem("totalguesses") || 0;

    document.getElementById("wordsstat").innerHTML = totalWords;
    document.getElementById("guessesstat").innerHTML = totalGuesses;

    updateWeekCompletionPercentageStat();

    //update week completion with correct information
    weekCompleteMenuWordsWillResetText.innerHTML = "Words will reset on Sunday, " + getDateStr(1 - dayOfWeek, true, false);
}

function updateWeekCompletionPercentageStat(){
    let totalCompleted = 0;
    for(let i = 0; i < 7; i++){
        if(objectClueChecks[i].classList.contains("visible")){
            totalCompleted++;
        }
    }

    let percentage = Math.floor((totalCompleted / 7) * 100);

    document.getElementById("weekprogressstat").innerHTML = percentage + "%";
}

function isMobile() {
    return navigator.userAgentData?.mobile ||
           /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function updateScoreDisplay(){
    scoreDisplay.innerHTML = score;
    localStorage.setItem("score", score);
}

function copyToClipboardNotice(){
    let notice = document.getElementById("copiedtoclipboardnotice");

    notice.classList.add("visible");

    setTimeout(() => {
        notice.classList.remove("visible");
    }, 2000);
}