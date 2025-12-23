//лаб 2
const CellState = {
    CLOSED: 'closed',
    OPENED: 'opened',
    FLAGGED: 'flagged',
};

function createCell(hasMine = false, nearbyMines = 0) {
    return {
        hasMine: hasMine, // булеве значення
        nearbyMines: nearbyMines, // кількість сусідніх мін
        state: CellState.CLOSED, // початковий стан
        isFlagged: false
    };
}

const fieldWidth = 3;
const fieldHeight = 3;

// двовимірний масив поля (для лаб 2)
const initialField = [
    [createCell(false, 1), createCell(true, 1), createCell(false, 1)],
    [createCell(false, 1), createCell(false, 1), createCell(false, 1)],
    [createCell(false, 0), createCell(false, 0), createCell(false, 0)],
];

const GameStatus = {
    IN_PROGRESS: 'in_progress',
    WIN: 'win',
    LOSE: 'lose',
};

// лаб 3 функції гри

// 1️⃣ Генерація ігрового поля
function generateField(rows, cols, mines) {
    const field = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(createCell());
        }
        field.push(row);
    }

    // Випадкове розташування мін
    let placedMines = 0;
    while (placedMines < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!field[r][c].hasMine) {
            field[r][c].hasMine = true;
            placedMines++;
        }
    }

    // Обчислення сусідніх мін для кожної клітинки
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            field[r][c].nearbyMines = countNeighbourMines(field, r, c);
        }
    }

    return field;
}

// 2️⃣ Підрахунок кількості сусідніх мін
function countNeighbourMines(field, row, col) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r >= 0 && r < field.length && c >= 0 && c < field[0].length) {
                if (field[r][c].hasMine) count++;
            }
        }
    }
    return count;
}

// 3️⃣ Відкриття клітинки
function openCell(field, row, col) {
    const cell = field[row][col];
    if (cell.state === CellState.OPENED || cell.isFlagged) return;
    if (cell.hasMine) {
        console.log('Game Over!');
        return;
    }
    cell.state = CellState.OPENED;
    if (cell.nearbyMines === 0) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < field.length && c >= 0 && c < field[0].length) {
                    openCell(field, r, c);
                }
            }
        }
    }
}

// 4️⃣ Встановлення/зняття прапорця
function toggleFlag(field, row, col) {
    const cell = field[row][col];
    if (cell.state === CellState.OPENED) return;
    cell.isFlagged = !cell.isFlagged;
}

// 5️⃣ Таймер
let timer;
let seconds = 0;

function startTimer() {
    timer = setInterval(() => {
        seconds++;
        console.log('Time:', seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    console.log('Timer stopped at', seconds, 'seconds');
}

// -------------------- Приклад використання --------------------

// 1️⃣ Генеруємо поле для гри
const gameField = generateField(5, 5, 5);

// 2️⃣ Створюємо об’єкт стану гри
const gameState = {
    width: 5,
    height: 5,
    minesCount: 5,
    status: GameStatus.IN_PROGRESS,
    field: gameField, // Тепер gameField існує
};

console.log('=== Minesweeper Lab 3 Demo ===');
console.log('Generated field:', gameField);

// 3️⃣ Тест відкриття клітинки
openCell(gameField, 0, 0);
console.log('After opening cell (0,0):', gameField);

// 4️⃣ Тест прапорця
toggleFlag(gameField, 1, 1);
console.log('After toggling flag (1,1):', gameField);

// 5️⃣ Тест таймера
startTimer();
setTimeout(() => {
    stopTimer();
    console.log('Demo finished');
}, 3000);

