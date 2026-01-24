const fs = require('fs');

const crypto = require('crypto');

let bonus = {
    bonusData: [
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""],
        ["", "", "", "", "", "", ""]
    ]
}

try {
    let data = fs.readFileSync("bonus.txt", "utf-8");

    //parses data into usable json
    data = data.split("\n");
    for (let i = 0; i < 10; i++) {
        let dayData = data[i].split(";");

        bonus.bonusData[i][0] = sha256(dayData[0]);
        bonus.bonusData[i][1] = dayData[1];

        for (let j = 0; j < 5; j++) {
            bonus.bonusData[i][j + 2] = dayData[j + 2];
        }
    }

    console.log(JSON.stringify(bonus));
} catch (err) {
    console.error("Error reading file: ", err);
}

function sha256(message) {
    message = formatAnswer(message);
    return crypto.createHash('sha256').update(message).digest('hex');
}

function formatAnswer(a) {
    a = a.toLowerCase();

    a = a.replace(" ", "");

    return a;
}