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
    };
}

const fieldWidth = 3;
const fieldHeight = 3;

// двовимірний масив поля
const gameField = [
    [createCell(false, 1), createCell(true, 1), createCell(false, 1)],
    [createCell(false, 1), createCell(false, 1), createCell(false, 1)],
    [createCell(false, 0), createCell(false, 0), createCell(false, 0)],
];

const GameStatus = {
    IN_PROGRESS: 'in_progress',
    WIN: 'win',
    LOSE: 'lose',
};

const gameState = {
    width: fieldWidth,
    height: fieldHeight,
    minesCount: 1,
    status: GameStatus.IN_PROGRESS,
    field: gameField,
};



