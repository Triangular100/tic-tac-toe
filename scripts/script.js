
const board = (function() {
    const board = new Array(9).fill("");

    // Blank out all elements in the array
    const newGame = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = "";
        }
    };

    // Takes a position [0, 8] and a marker ("X", "O")
    const place = (position, marker) => board[position] = marker;

    const retrieve = (position) => board[position];

    // Checks if all positions given are empty on the board.
    const empty = (posititions) => {
        for (let pos of posititions) {
            if (board[pos] !== "") {
                return false;
            }
        }

        return true;

    };

    // Checks if the positions given are equal in value
    // Note: marker can be empty string
    const equal = (positions) => {
        let marker = board[positions[0]];
        for (let i = 1; i < positions.length; i++) {
            if (marker !== board[positions[i]]) {
                return false;
            }
        }

        return true;
    };

    const full = () => {
        for (let i = 0; i < 9; i++) {
            if (empty([i])) {
                return false;
            }
        }

        return true;
    };

    return { newGame, place, retrieve, empty, equal, full };
})();


const bot = (function() {

    const think = (state, marker) => thinkEasy(state, marker);

    // Move will depend on the following rules
    // 1. If bot can win, win
    // 2. If opponent can win, block
    // 3. Choose a random position
    const thinkEasy = (state, marker) => {
        let pos = canWin(state, marker);
        if (pos !== "") {
            return pos;
        }

        const opponentMarker = marker === "X" ? "O" : "X";
        pos = canWin(state, opponentMarker);
        if (pos !== "") {
            return pos;
        }

        return randomMove(state);
    };

    // Returns the position which will cause a win (returns "" when no win is found)
    const canWin = (state, marker) => {
        let pos = winRows(state, marker);
        if (pos !== "") {
            return pos;
        }

        pos = winCols(state, marker);
        if (pos !== "") {
            return pos;
        }

        pos = winDiagonals(state, marker);
        if (pos !== "") {
            return pos;
        }

        return "";
    };

    const winRows = (state, marker) => {
        // If there's a potential of a 3 in a row,
        // Then return the position that will cause the 3 in a row
        // Ex: if middle row has X "" X return the index where "" is at
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                let index1 = row * 3 + (col % 3);
                let index2 = row * 3 + ((col + 1) % 3);
                let index3 = row * 3 + ((col + 2) % 3);
                if (potentialWin(state, marker, index1, index2, index3)) {
                    return index3;
                }
            }
        }
        return "";
    };

    const winCols = (state, marker) => {
        for (let col = 0; col < 3; col++) {
            for (let row = 0; row < 3; row++) {
                let index1 = ((row * 3) + col) % 9;
                let index2 = ((row * 3) + 3 + col) % 9;
                let index3 = ((row * 3) + 6 + col) % 9;
                if (potentialWin(state, marker, index1, index2, index3)) {
                    return index3;
                }
            }
        }


        return "";
    };

    const winDiagonals = (state, marker) => {
        // top left to bot right diagonal (0, 4, 8)
        for (let i = 0; i < 3; i++) {
            let index1 = ((i) % 3) * 4;
            let index2 = ((i + 1) % 3) * 4;
            let index3 = ((i + 2) % 3) * 4;
            if (potentialWin(state, marker, index1, index2, index3)) {
                return index3;
            }
        }

        // bot left to top right diagonal (2, 4, 6)
        for (let i = 0; i < 3; i++) {
            let index1 = ((i) % 3) * 2 + 2;
            let index2 = ((i + 1) % 3) * 2 + 2;
            let index3 = ((i + 2) % 3) * 2 + 2;
            if (potentialWin(state, marker, index1, index2, index3)) {
                return index3;
            }
        }

        return "";
    };

    const potentialWin = (state, marker, index1, index2, index3) => {
        if (state.retrieve(index1) === marker && state.retrieve(index2) === marker && state.empty([index3])) {
            return true;
        }
        return false;
    };

    const randomMove = (state) => {
        const moves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        let index, pos;
        do {
            index = Math.floor(Math.random() * moves.length);
            pos = moves.splice(index, 1)[0];
        } while (!state.empty([pos]) && moves.length > 0);

        return pos;
    };

    return { think };
})();


const game = (function(board) {
    // Win states according to the classic tic tac toe rules.
    // Three of the markers must fill a row, column, or diagonal to win.
    const winStates = [
        // Rows
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // Columns
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // Diagonals
        [0, 4, 8],
        [2, 4, 6]
    ];

    let gameMode = "pvp";

    let score1 = 0;
    let score2 = 0;

    const player1 = "X";
    let firstMove = "X";
    let marker = "X";
    let playerWon = "";

    const newGame = () => {
        firstMove = "X";
        marker = "X";
        playerWon = "";
        score1 = 0;
        score2 = 0;
        board.newGame();
    };

    const nextMatch = () => {
        // If player 1 ("X") went first, then player 2 will go first next match
        firstMove = firstMove === "X" ? "O" : "X";
        marker = firstMove;
        playerWon = "";
        board.newGame();
    };

    const mode = (val) => gameMode = val;

    const getMode = () => gameMode;

    const valid = (position) => board.empty([position]);

    const place = (pos) => {
        board.place(pos, marker);
        let previousMarker = marker;
        swapMarker();
        return previousMarker;
    };

    const swapMarker = () => marker = marker === "X" ? "O" : "X";

    const over = () => {
        const winner = checkWin();
        if (winner) {
            incrementScore(winner);
            return true;
        }

        if (checkDraw()) {
            return true;;
        }

        return false;
    };

    const checkWin = () => {
        let winner = "";

        for (let i = 0; i < winStates.length; i++) {
            if (board.empty(winStates[i])) {
                continue;
            }

            if (board.equal(winStates[i])) {
                winner = board.retrieve(winStates[i][0]);
                playerWon = winner === player1 ? "Player 1" : "Player 2";
                break;
            }
        }

        return winner;
    };

    const checkDraw = () => board.full();

    const incrementScore = (winner) => winner === player1 ? score1++ : score2++;

    const getScore = () => [score1, score2];

    const getWinner = () => playerWon;

    // If player 1 ("X") went first, then player 2 will go first next match.
    const nextTurn = () => firstMove === player1 ? "Player 2" : "Player 1";

    const getBoard = () => board;

    return { newGame, nextMatch, mode, getMode, valid, place, over, getScore, getWinner, nextTurn, getBoard };
})(board);


const display = (function() {

    const score1 = document.querySelector(".score-1");
    const score2 = document.querySelector(".score-2");
    let cells = "";

    const setCells = (cellsParam) => cells = cellsParam;

    const newGame = () => {
        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.add("open");
            cells[i].classList.remove("taken");
            cells[i].innerHTML = "";
        }
    };

    const place = (position, marker) => {
        cells[position].innerHTML = marker;
        cells[position].classList.remove("open");
        cells[position].classList.add("taken");
    };

    const botPlace = (position, marker) => {
        setTimeout(() => {
            cells[position].innerHTML = marker;
            cells[position].classList.add("bot-hover");
        }, 200);

        setTimeout(() => {
            cells[position].classList.remove("bot-hover");
            cells[position].classList.remove("open");
            cells[position].classList.add("taken");
        }, 500);
    };

    const updateScore = (s1, s2) => {
        score1.innerHTML = s1;
        score2.innerHTML = s2;
    };

    return { setCells, newGame, place, botPlace, updateScore };
})();


const menu = (function(game, display, bot) {

    const pvpButton = document.getElementById("pvp");
    const pvaiButton = document.getElementById("pvai");
    const newGameButton = document.querySelector(".new-game");
    const menuContainer = document.querySelector(".menu-container");
    const settingsButton = document.querySelector(".settings");
    const winMenuContainer = document.querySelector(".win-menu-container");
    const winnerSpan = document.querySelector(".winner");
    const nextPlayerSpan = document.querySelector(".next-player");
    const page = document.querySelector(".page");
    const aiModeImg = document.querySelector(".ai-mode");

    const start = () => {
        startMainMenu();
        startWinMenu();
        startInGameSettings();
    };

    const startMainMenu = () => {
        pvpButton.addEventListener("click", () => {
            pvaiButton.classList.remove("active");
            pvpButton.classList.add("active");
            aiModeImg.src = "images/ai.svg";
            game.mode("pvp");
        });

        pvaiButton.addEventListener("click", () => {
            pvpButton.classList.remove("active");
            pvaiButton.classList.add("active");
            aiModeImg.src = "images/ai-easy.svg";
            game.mode("pvai");
        });

        newGameButton.addEventListener("click", () => {
            menuContainer.classList.remove("active");
            newGame();
        });

        menuContainer.addEventListener("click", ev => {
            if (ev.target !== menuContainer) {
                return;
            }
            menuContainer.classList.remove("active");
        });
    };

    const startWinMenu = () => {
        winMenuContainer.addEventListener("click", () => {
            page.classList.remove("blur");
            winMenuContainer.classList.remove("active");

            const next = game.nextTurn();
            game.nextMatch();
            display.newGame();

            // If player vs bot and bot's turn, bot will make a move
            if (game.getMode() !== "pvp" && next === "Player 2") {
                pos = bot.think(game.getBoard(), "O");
                game.place(pos);
                display.botPlace(pos, "O");
            }
        });
    };

    const startInGameSettings = () => {
        settingsButton.addEventListener("click", () => {
            menuContainer.classList.add("active");
        });
    };

    const newGame = () => {
        game.newGame();
        display.newGame();
        display.updateScore(...game.getScore());
    };

    const showWinner = () => {
        page.classList.add("blur");

        const winner = game.getWinner();
        if (winner === "Player 1") {
            winnerSpan.innerHTML = "Player 1 won!";
        } else if (winner === "Player 2") {
            winnerSpan.innerHTML = "Player 2 won!";
        } else {
            winnerSpan.innerHTML = "Draw!";
        }

        nextPlayerSpan.innerHTML = game.nextTurn();

        winMenuContainer.classList.add("active");
    };

    return { start, showWinner };

})(game, display, bot);


const main = (function(game, menu, display, bot) {

    const cells = document.querySelectorAll(".game-cell");

    const startGame = () => {
        initDisplay();
        menu.start();
    };

    const initDisplay = () => {
        display.setCells(cells);
        bindCellsEvents();
    };

    const bindCellsEvents = () => {
        for (let i = 0; i < cells.length; i++) {
            bindCellEvent(cells[i]);
        };
    };

    const bindCellEvent = (cell) => {
        cell.addEventListener("click", () => {
            let pos = cell.id;
            place(pos);
        });
    };

    const place = (pos) => {
        if (!game.valid(pos)) {
            return;
        }

        let marker = game.place(pos);
        display.place(pos, marker);

        if (checkGameOver()) {
            return;
        }

        if (game.getMode() !== "pvp" && marker === "X") {
            botPlace("O");
        }

        checkGameOver();
    };

    const botPlace = (marker) => {
        let pos = bot.think(game.getBoard(), marker);
        game.place(pos);
        display.botPlace(pos, marker);
    };

    const checkGameOver = () => {
        if (game.over()) {
            display.updateScore(...game.getScore());
            menu.showWinner();
            return true;
        }

        return false;
    };

    return { startGame };

})(game, menu, display, bot);


main.startGame();