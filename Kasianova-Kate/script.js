// Game State Enums
const CELL_STATE = {
    CLOSED: "closed", 
    OPEN: "open", 
    FLAGGED: "flagged", 
    DETONATED: "detonated",
    FLAGGED_MINE: "flagged-mine",
};

const GAME_STATUS = {
    IN_PROGRESS: "in-progress",
    WIN: "win",
    LOSE: "lose"
};

const GAME_CONFIG = {
    ROWS: 9,
    COLS: 10,
    MINES: 15
};


/**
 * Створює об'єкт, що представляє одну клітинку ігрового поля.
 * @param {boolean} [hasMine=false] - Чи містить клітинка міну.
 * @returns {object} Об'єкт клітинки.
 */
function createCell(hasMine = false) {
    return {
        hasMine: hasMine,          // boolean - indicates if there is a mine
        neighborMines: 0,          // number - how many mines are around
        state: CELL_STATE.CLOSED   // string - can be "closed", "open", or "flagged"
    };
}

// допоміжна функція: підрахунок мін навколо клітинки
/**
 * Підраховує кількість мін у 8 сусідніх клітинках (включно з діагональними).
 * @param {object[][]} board - 2D ігрове поле.
 * @param {number} row - Індекс рядка поточної клітинки.
 * @param {number} col - Індекс стовпця поточної клітинки.
 * @returns {number} Кількість сусідніх мін.
 */
function countAdjacentMines(board, row, col) {
    let count = 0;
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue; // пропустити саму клітинку
            let neighborRow = row + rowOffset;
            let neighborCol = col + colOffset;
            if (neighborRow >= 0 && neighborRow < board.length && neighborCol >= 0 && neighborCol < board[0].length) {
                if (board[neighborRow][neighborCol].hasMine) {
                    count++;
                }
            }
        }
    }
    return count;
}

// 2. Game Board Structure (Two-dimensional array)
/**
 * Створює ініціалізоване ігрове поле (2D масив клітинок).
 * Включає розміщення мін та підрахунок сусідніх мін.
 * @param {number} rows - Кількість рядків.
 * @param {number} cols - Кількість стовпців.
 * @param {number} minesCount - Загальна кількість мін, які потрібно розмістити.
 * @returns {object[][]} Двовимірний масив клітинок (ігрове поле).
 */
function createBoard(rows, cols, minesCount) {
    let board = [];

    // Initialize empty cells
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        let row = [];
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            row.push(createCell());
        }
        board.push(row);
    }

    // Random mine placement
    let placedMines = 0;
    while (placedMines < minesCount) {
        let randomRow = Math.floor(Math.random() * rows);
        let randomCol = Math.floor(Math.random() * cols);
        if (!board[randomRow][randomCol].hasMine) {
            board[randomRow][randomCol].hasMine = true;
            placedMines++;
        }
    }

    // Count neighboring mines
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            if (!board[rowIndex][colIndex].hasMine) {
                board[rowIndex][colIndex].neighborMines = countAdjacentMines(board, rowIndex, colIndex);
            }
        }
    }

    return board;
}

// 3. Game State Structure
/**
 * Створює об'єкт, що містить повний стан гри.
 * Ініціалізує нове ігрове поле.
 * @param {number} rows - Кількість рядків поля.
 * @param {number} cols - Кількість стовпців поля.
 * @param {number} mines - Загальна кількість мін.
 * @returns {object} Об'єкт стану гри.
 */
function createGame(rows, cols, mines) {
    return {
        rows: rows,             // number - dimensions of the field
        cols: cols,             // number - dimensions of the field
        mines: mines,           // number - number of mines
        status: GAME_STATUS.IN_PROGRESS,  // string - can be "in-progress", "win", or "lose"
        board: createBoard(rows, cols, mines)
    };
}

// 4. Sample Game Board with Test Values
/**
 * Створює і повертає невелике статичне тестове ігрове поле (3x3).
 * Використовується для перевірки та налагодження.
 * @returns {object[][]} 2D тестовий масив клітинок.
 */
function createSampleBoard() {
    // Create a 3x3 sample board for testing
    const sampleBoard = [
        [
            { hasMine: false, neighborMines: 1, state: CELL_STATE.CLOSED },
            { hasMine: true, neighborMines: 0, state: CELL_STATE.CLOSED },
            { hasMine: false, neighborMines: 2, state: CELL_STATE.CLOSED }
        ],
        [
            { hasMine: false, neighborMines: 1, state: CELL_STATE.CLOSED },
            { hasMine: true, neighborMines: 0, state: CELL_STATE.CLOSED },
            { hasMine: true, neighborMines: 0, state: CELL_STATE.CLOSED }
        ],
        [
            { hasMine: false, neighborMines: 0, state: CELL_STATE.CLOSED },
            { hasMine: false, neighborMines: 2, state: CELL_STATE.CLOSED },
            { hasMine: false, neighborMines: 1, state: CELL_STATE.CLOSED }
        ]
    ];

    return sampleBoard;
}

// Sample game state for testing
const sampleGame = {
    rows: 3,
    cols: 3,
    mines: 3,
    status: GAME_STATUS.IN_PROGRESS,
    board: createSampleBoard()
};

// Display sample data in console for verification
console.log("Sample Game State:", sampleGame);
console.log("Sample Board (3x3 with 3 mines):", createSampleBoard());

// 4. Рендер та взаємодія з DOM
/**
 * Отримує посилання на ключові елементи DOM, необхідні для гри.
 * @returns {{field: Element, startBtn: Element, timerEl: Element, minesCounterEl: Element}} Об'єкти елементів DOM.
 */
let game = null;
let firstClickHappened = false;
let timerIntervalId = null;
let elapsedSeconds = 0;

function getElements() {
    const field = document.querySelector('.field');
    const startBtn = document.getElementById('start-btn');
    const timerEl = document.getElementById('timer');
    const minesCounterEl = document.getElementById('mines-counter');
    return { field, startBtn, timerEl, minesCounterEl };
}

/**
 * Форматує загальну кількість секунд у формат MM:SS (хвилини:секунди).
 * @param {number} totalSeconds - Загальна кількість секунд.
 * @returns {string} Форматований час.
 */
function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/**
 * Запускає таймер гри (кожну секунду збільшує лічильник та оновлює DOM).
 */
function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    const { timerEl } = getElements();
    if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
    timerIntervalId = setInterval(() => {
        elapsedSeconds += 1;
        if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

/**
 * Зупиняє запущений інтервал таймера.
 */
function stopTimer() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

/**
 * Підраховує кількість клітинок, позначених прапорцем на поточному полі.
 * @returns {number} Кількість встановлених прапорців.
 */
function getFlagCount() {
    if (!game) return 0;
    let flagCount = 0;
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            if (game.board[rowIndex][colIndex].state === CELL_STATE.FLAGGED) flagCount++;
        }
    }
    return flagCount;
}

/**
 * Оновлює лічильник мін на екрані, відображаючи кількість мін мінус кількість прапорців.
 */
function updateMinesCounter() {
    const { minesCounterEl } = getElements();
    if (!minesCounterEl || !game) return;
    const remaining = Math.max(0, game.mines - getFlagCount());
    minesCounterEl.textContent = String(remaining);
}

/**
 * Рендерить ігрове поле на основі поточного стану об'єкта 'game'.
 * Створює елементи DOM для кожної клітинки та застосовує вигляд.
 */
function renderBoard() {
    const { field } = getElements();
    if (!field || !game) return;
    field.innerHTML = '';
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            const cell = game.board[rowIndex][colIndex];
            const cellEl = document.createElement('div');
            cellEl.className = cell.state === CELL_STATE.CLOSED ? 'cell' : 'cell open';
            cellEl.dataset.r = String(rowIndex);
            cellEl.dataset.c = String(colIndex);
            applyCellAppearance(cellEl, cell);
            rowEl.appendChild(cellEl);
        }
        field.appendChild(rowEl);
    }
}

/**
 * Повертає назву CSS-класу для відображення числа суміжних мін (від number-1 до number-8).
 * @param {number} value - Кількість суміжних мін.
 * @returns {string} Назва CSS-класу.
 */
function numberClassFor(value) {
    return value >= 1 && value <= 8 ? `number-${value}` : '';
}

/**
 * Застосовує відповідні CSS-класи та текстовий вміст до елемента клітинки DOM
 * відповідно до її стану (відкрито, закрито, прапорець, міна, число).
 * @param {Element} cellEl - Елемент клітинки DOM.
 * @param {object} cell - Об'єкт клітинки.
 */
function applyCellAppearance(cellEl, cell) {
    cellEl.className = 'cell';
    cellEl.textContent = '';
    
    // Check if we're in post-game state
    const isPostGame = game.status === GAME_STATUS.WIN || game.status === GAME_STATUS.LOSE;
    
    if (cell.state === CELL_STATE.DETONATED) {
        cellEl.classList.add('mine', 'detonated');
        return;
    }
    
    // Handle FLAGGED_MINE state (correctly flagged mine in post-game)
    if (cell.state === CELL_STATE.FLAGGED_MINE) {
        cellEl.classList.add('flag', 'correct-guess', 'mine');
        return;
    }
    
    if (cell.state === CELL_STATE.FLAGGED) {
        cellEl.classList.add('flag');
        
        // Add post-game styling for incorrectly flagged cells
        if (isPostGame) {
            cellEl.classList.add('incorrect-guess');
        }
        return;
    }
    
    if (cell.state === CELL_STATE.OPEN) {
        cellEl.classList.add('open');
        if (cell.hasMine) {
            cellEl.classList.add('mine');
            
            // Add post-game styling for revealed mines
            if (isPostGame && cell.state !== CELL_STATE.DETONATED) {
                cellEl.classList.add('revealed-mine');
            }
            return;
        }
        if (cell.neighborMines > 0) {
            cellEl.classList.add(numberClassFor(cell.neighborMines));
            cellEl.textContent = String(cell.neighborMines);
        }
        return;
    }
    // closed state: no extra classes/content
}

/**
 * Перевіряє, чи знаходяться координати (r, c) в межах ігрового поля.
 * @param {number} r - Індекс рядка.
 * @param {number} c - Індекс стовпця.
 * @returns {boolean} True, якщо координати в межах поля.
 */
function inBounds(rowIndex, colIndex) {
    return rowIndex >= 0 && rowIndex < game.rows && colIndex >= 0 && colIndex < game.cols;
}

/**
 * Рекурсивно відкриває клітинку та поширюється на сусідні клітинки, якщо поточна
 * не має сусідніх мін (логіка "нульового розкриття").
 * Використовує нерекурсивний підхід (стек) для запобігання переповненню стека.
 * @param {number} startRow - Індекс рядка, з якого починається розкриття.
 * @param {number} startCol - Індекс стовпця, з якого починається розкриття.
 */
function floodOpen(startRowIndex, startColIndex) {
    const cellsToProcess = [[startRowIndex, startColIndex]];
    while (cellsToProcess.length) {
        const [currentRowIndex, currentColIndex] = cellsToProcess.pop();
        const currentCell = game.board[currentRowIndex][currentColIndex];
        if (currentCell.state !== CELL_STATE.CLOSED || currentCell.hasMine) continue;
        currentCell.state = CELL_STATE.OPEN;
        if (currentCell.neighborMines === 0) {
            for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                for (let colOffset = -1; colOffset <= 1; colOffset++) {
                    if (rowOffset === 0 && colOffset === 0) continue;
                    const neighborRowIndex = currentRowIndex + rowOffset;
                    const neighborColIndex = currentColIndex + colOffset;
                    if (inBounds(neighborRowIndex, neighborColIndex) && 
                        game.board[neighborRowIndex][neighborColIndex].state === CELL_STATE.CLOSED && 
                        !game.board[neighborRowIndex][neighborColIndex].hasMine) {
                        cellsToProcess.push([neighborRowIndex, neighborColIndex]);
                    }
                }
            }
        }
    }
}

/**
 * Обробляє клік гравця (ліва кнопка миші) для відкриття клітинки.
 * Перевіряє наявність міни, викликає 'floodOpen' для нульових клітинок та перевіряє умову перемоги.
 * @param {number} r - Індекс рядка клітинки.
 * @param {number} c - Індекс стовпця клітинки.
 */
function openCell(rowIndex, colIndex) {
    if (game.status !== GAME_STATUS.IN_PROGRESS) return;
    const cell = game.board[rowIndex][colIndex];
    console.log(game.board);
    if (cell.state !== CELL_STATE.CLOSED) return;
    if (!firstClickHappened) {
        firstClickHappened = true;
        startTimer();
    }
    if (cell.hasMine) {
        cell.state = CELL_STATE.DETONATED;
        game.status = GAME_STATUS.LOSE;
        revealPostGameBoard();
        stopTimer();
        renderBoard();
        showGameEndModal();
        return;
    }
    if (cell.neighborMines === 0) {
        floodOpen(rowIndex, colIndex);
    } else {
        cell.state = CELL_STATE.OPEN;
    }
    checkWinCondition();
    renderBoard();
}

/**
 * Перемикає стан клітинки між 'flagged' (прапорець) та 'closed' (закрито).
 * Працює лише для закритих клітинок. Оновлює лічильник мін.
 * @param {number} r - Індекс рядка клітинки.
 * @param {number} c - Індекс стовпця клітинки.
 */
function toggleFlag(rowIndex, colIndex) {
    if (game.status !== GAME_STATUS.IN_PROGRESS) return;
    const cell = game.board[rowIndex][colIndex];
    if (cell.state === CELL_STATE.OPEN) return;
    
    // Strict flag count logic: flags ≤ mines
    if (cell.state === CELL_STATE.CLOSED) {
        const currentFlagCount = getFlagCount();
        if (currentFlagCount >= game.mines) {
            return; // Cannot place more flags than mines
        }
        cell.state = CELL_STATE.FLAGGED;
    } else if (cell.state === CELL_STATE.FLAGGED) {
        cell.state = CELL_STATE.CLOSED;
    }
    
    updateMinesCounter();
    renderBoard();
}

/**
 * Розкриває всі клітинки з мінами на полі.
 * Викликається після програшу.
 */
function revealAllMines() {
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            const cell = game.board[rowIndex][colIndex];
            if (cell.hasMine && cell.state !== CELL_STATE.DETONATED) {
                cell.state = CELL_STATE.OPEN;
            }
        }
    }
}

/**
 * Reveals the entire board with post-game state indicators
 * Shows correct/incorrect flags and all mine locations
 */
function revealPostGameBoard() {
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            const cell = game.board[rowIndex][colIndex];
            
            // Handle flagged cells - mark as FLAGGED_MINE if they contain a mine
            if (cell.state === CELL_STATE.FLAGGED) {
                if (cell.hasMine) {
                    cell.state = CELL_STATE.FLAGGED_MINE;
                }
                // Incorrectly flagged cells remain as FLAGGED for styling
            }
            
            // If it's a mine that wasn't detonated and not flagged, reveal it
            if (cell.hasMine && cell.state !== CELL_STATE.DETONATED && cell.state !== CELL_STATE.FLAGGED_MINE) {
                cell.state = CELL_STATE.OPEN;
            }
        }
    }
}

/**
 * Перевіряє умову перемоги: чи всі клітинки, які НЕ є мінами, відкриті.
 * Якщо так, встановлює статус гри на 'win' і зупиняє таймер.
 */
function checkWinCondition() {
    // Win if all non-mine cells are opened
    let unopenedSafeCells = 0;
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            const cell = game.board[rowIndex][colIndex];
            if (!cell.hasMine && cell.state !== CELL_STATE.OPEN) unopenedSafeCells++;
        }
    }
    if (unopenedSafeCells === 0) {
        game.status = GAME_STATUS.WIN;
        revealPostGameBoard();
        stopTimer();
        renderBoard();
        showGameEndModal();
    }
}

/**
 * Додає обробники подій до елементів DOM:
 * - Клік по кнопці "Start" для ініціалізації нової гри.
 * - Клік мишею по ігровому полю для відкриття клітинок (ЛКМ) або встановлення/зняття прапорця (ПКМ).
 */
function attachEvents() {
    const { field, startBtn } = getElements();
    if (startBtn) {
        startBtn.addEventListener('click', () => initGame());
    }
    if (field) {
        field.addEventListener('contextmenu', (e) => e.preventDefault());
        field.addEventListener('mousedown', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (!target.classList.contains('cell')) return;
            const rowIndex = Number(target.dataset.r);
            const colIndex = Number(target.dataset.c);
            console.log(rowIndex);
            console.log(colIndex);
            if (!Number.isInteger(rowIndex) || !Number.isInteger(colIndex)) return;
            if (e.button === 2) {
                toggleFlag(rowIndex, colIndex);
            } else if (e.button === 0) {
                openCell(rowIndex, colIndex);
            }
        });
    }
}

/**
 * Ініціалізує нову гру зі стандартними параметрами (9x10, 15 мін).
 * Скидає стан гри, таймер, лічильник прапорців і рендерить поле.
 */
function initGame() {
    game = createGame(GAME_CONFIG.ROWS, GAME_CONFIG.COLS, GAME_CONFIG.MINES);
    firstClickHappened = false;
    stopTimer();
    const { timerEl } = getElements();
    if (timerEl) timerEl.textContent = '00:00';
    updateMinesCounter();
    renderBoard();
    hideGameEndModal();
}

/**
 * Shows the game end modal with statistics
 */
function showGameEndModal() {
    const modal = document.getElementById('game-end-modal');
    const title = document.getElementById('modal-title');
    const result = document.getElementById('modal-result');
    const correctGuesses = document.getElementById('correct-guesses');
    const flagsUsed = document.getElementById('flags-used');
    const minesOpened = document.getElementById('mines-opened');
    const timeElapsed = document.getElementById('time-elapsed');
    
    if (!modal || !game) return;
    
    // Calculate statistics
    const correctMineGuesses = calculateCorrectMineGuesses();
    const totalFlagsUsed = getFlagCount();
    const totalMinesOpened = calculateMinesOpened();
    
    // Update modal content based on game result
    if (game.status === GAME_STATUS.WIN) {
        title.textContent = 'MISSION ACCOMPLISHED';
        result.textContent = 'NEURAL NETWORK SECURED';
        result.className = 'game-result win';
    } else if (game.status === GAME_STATUS.LOSE) {
        title.textContent = 'MISSION FAILED';
        result.textContent = 'SYSTEM COMPROMISED';
        result.className = 'game-result lose';
    }
    
    // Update statistics
    correctGuesses.textContent = correctMineGuesses;
    flagsUsed.textContent = totalFlagsUsed;
    minesOpened.textContent = totalMinesOpened;
    timeElapsed.textContent = formatTime(elapsedSeconds);
    
    // Show modal
    modal.classList.add('show');
}

/**
 * Hides the game end modal
 */
function hideGameEndModal() {
    const modal = document.getElementById('game-end-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Calculates the number of correctly flagged mines
 * @returns {number} Number of correct mine guesses
 */
function calculateCorrectMineGuesses() {
    if (!game) return 0;
    let correctGuesses = 0;
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            const cell = game.board[rowIndex][colIndex];
            if (cell.state === CELL_STATE.FLAGGED_MINE) {
                correctGuesses++;
            }
        }
    }
    return correctGuesses;
}

/**
 * Calculates the number of mines that were opened (clicked)
 * @returns {number} Number of mines opened
 */
function calculateMinesOpened() {
    if (!game) return 0;
    let minesOpened = 0;
    for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
        for (let colIndex = 0; colIndex < game.cols; colIndex++) {
            const cell = game.board[rowIndex][colIndex];
            if (cell.hasMine && (cell.state === CELL_STATE.OPEN || cell.state === CELL_STATE.DETONATED)) {
                minesOpened++;
            }
        }
    }
    return minesOpened;
}

// Ініціалізація після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    attachEvents();
    initGame();
    
    // Add dismiss button event listener
    const dismissBtn = document.getElementById('dismiss-btn');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            hideGameEndModal();
        });
    }
});
