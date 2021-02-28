let game;

const KEY = '__dominionGame.state';
const URL = 'https://dominion-scores.app.natemara.com/chart';

function save() {
    localStorage.setItem(KEY, JSON.stringify(game));
}

function load() {
    const json = localStorage.getItem(KEY);
    if (json) {
        game = JSON.parse(json);

        resetIfGameChanged();
    } else {
        reset();
    }
}

function resetIfGameChanged() {
    if (game.id !== gameId()) {
        reset();
    }
}

function gameId() {
    if (activeGame) {
        return activeGame.getId();
    }

    return -1;
}

function reset() {
    game = { id: gameId(), startTime: new Date().getTime(), scores: {}, turnChanges: [] };
    save();
}

function timeDelta() {
    return new Date().getTime() - game.startTime;
}

function recordingMessage() {
    const sideBar = document.querySelector('.side-bar');

    const elt = document.createElement('div');
    elt.style.color = 'red';
    elt.innerText = 'This game is being recorded';

    sideBar.insertBefore(elt, sideBar.firstChild);
}

load();
recordingMessage();

const $rootScope = angular.element(document.body).injector().get('$rootScope');

let turn;
$rootScope.$on('newTurn', (_, turnData) => {
    resetIfGameChanged();

    if (turn !== turnData.turnNumber) {
        turn = turnData.turnNumber;

        game.turnChanges.push(timeDelta());
        save();
    }
});

$rootScope.$on('counterChange', (_, counterData) => {
    resetIfGameChanged();

    const counter = activeGame.state.counters[counterData.index];

    if (counter && counter.counterName && counter.counterName.name === 'Points') {
        const points = counter.value;
        const player = activeGame.model.players[counter.owner];

        if (player) {
            const playerName = player.name;

            const scores = game.scores[playerName] || { scores: [], times: [] };

            scores.scores.push(points);
            scores.times.push(timeDelta());

            game.scores[playerName] = scores;
            save();
        }
    }
});

$rootScope.$on('gameFinished', async () => {
    const gameJson = JSON.stringify(game);

    await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: gameJson,
    });
    reset();
});

$rootScope.$on('gameStarted', () => {
    recordingMessage();
    reset();
});
