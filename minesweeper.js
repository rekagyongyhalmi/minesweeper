const fieldWidth = 15;
const fieldHeight = 10;
const totalMines = 30;
var cellsToReveal;

class Cell {
    constructor(i, j) {
        this.hasMine = false;
        this.mineCount = 0;
        this.hidden = true;
        this.id = i + "-" + j;
    }
}

var mineIds;
var field;
var mineCounter;

newGame();

document.getElementById("new").addEventListener("click", function () {
    newGame();
});

function newGame() {
    hideMines();
    drawField();
}

function hideMines() {
    mineIds = new Set();
    mineCounter = totalMines;
    cellsToReveal = fieldHeight * fieldWidth - totalMines;
    do {
        let x = Math.floor(Math.random() * fieldHeight);
        let y = Math.floor(Math.random() * fieldWidth);
        mineIds.add(x + "-" + y);
    } while (mineIds.size < totalMines);
}

function drawField() {
    field = new Array();
    document.getElementById("counter").innerHTML = mineCounter;
    let playingField = "";

    for (let i = 0; i < fieldHeight; i++) {
        row = new Array();
        let tableRow = "<tr>";

        for (let j = 0; j < fieldWidth; j++) {
            let c = new Cell(i, j);
            row.push(c);
            if (mineIds.has(c.id)) {
                c.hasMine = true;
            }
            let tableCell = '<td id="' + c.id + '"> </td>';

            tableRow = tableRow.concat(tableCell);
        }
        field.push(row);
        playingField = playingField.concat(tableRow);
    }

    document.getElementById("playingField").innerHTML = playingField;
    let tableCells = document.querySelectorAll("td");
    tableCells.forEach((element) => {
        element.addEventListener("click", function () {
            revealCell(element);
        });
        element.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            return false;
        });
        element.addEventListener("contextmenu", function () {
            stateChange(element);
        });
    });
}

function getNeighbors(px, py) {
    let nbs = new Set();
    px = parseInt(px);
    py = parseInt(py);

    let top = Math.max(0, px - 1);
    let bottom = Math.min(px + 1, fieldHeight - 1);
    let left = Math.max(0, py - 1);
    let right = Math.min(py + 1, fieldWidth - 1);

    for (let a = top; a <= bottom; a++) {
        for (let b = left; b <= right; b++) {
            nbs.add(field[a][b]);
        }
    }
    return nbs;
}

function countMines(center, n, m) {
    let neighbors = getNeighbors(n, m);
    let count = 0;

    neighbors.forEach(function (nb) {
        if (nb.hasMine) {
            count += 1;
        }
    });

    center.mineCount = count;
}

function revealCell(tc) {
    let coordinates = tc.id.split("-");
    let x = coordinates[0];
    let y = coordinates[1];
    let cell = field[x][y];
    if (cell.hidden) {
        cell.hidden = false;
        tc.classList.add("cell-revealed");

        if (cell.hasMine) {
            tc.innerHTML = "&#127879;";
            tc.classList.add("mapped-color-star");
            gameLost();
        } else {
            cellsToReveal -= 1;
            countMines(cell, x, y);
            if (cell.mineCount == 0) {
                getNeighbors(x, y).forEach((n) => {
                    if (n.hidden) {
                        revealCell(document.getElementById(n.id));
                    }
                });
            }
            tc.innerHTML = cell.mineCount;
            tc.classList.add("mapped-color-" + cell.mineCount);
            if (cellsToReveal == 0) {
                gameWon();
            }
        }
    }
}

function stateChange(tc) {
    if (tc.innerHTML == " ") {
        tc.innerHTML = "!";
        mineCounter -= 1;
        tc.classList.add("mapped-color-exclamation");
    } else if (tc.innerHTML == "!") {
        tc.innerHTML = " ";
        mineCounter += 1;
        tc.classList.remove("mapped-color-exclamation");
    }

    document.getElementById("counter").innerHTML = mineCounter;
}

function gameLost() {
    document.querySelectorAll("td").forEach((t) => {
        if (mineIds.has(t.id)) {
            t.innerHTML = "&#127879;";
            t.classList.add("exploded");
        }
    });
}

function gameWon() {
    document.querySelectorAll("td").forEach((t) => {
        if (mineIds.has(t.id)) {
            t.innerHTML = "&#10004;";
            t.classList.add("marked-mine");
        }
        document.getElementById("counter").innerHTML = 0;
    });
}
