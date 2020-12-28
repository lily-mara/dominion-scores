let game;

const KEY = '__dominionGame.state';

function save() {
    localStorage.setItem(KEY, JSON.stringify(game));
}

function load() {
    const json = localStorage.getItem(KEY);
    if (json) {
        game = JSON.parse(json);

        if (game.id !== activeGame.getId()) {
            reset();
        }
    } else {
        reset();
    }
}

function reset() {
    game = { times: [], dataPoints: 0, id: activeGame.getId(), startTime: new Date().getTime(), names: [] };
    save();
}

function getAllScoreElements() {
    return document.querySelectorAll('.opponent-vp-counter');
}

function getAllScores() {
    game.times.push(new Date().getTime() - game.startTime);

    for (const elt of getAllScoreElements()) {
        const name = elt.parentElement.firstChild.nodeValue.trim();
        const vp = elt.innerText.trim();

        const points = parseInt(vp.slice(0, -2));

        const playerScores = game[name];

        if (playerScores) {
            playerScores.push(points);
        } else {
            game[name] = [];
            game.names.push(name);

            for (let i = 0; i < game.dataPoints; i++) {
                game[name].push(0);
            }

            game[name].push(points);
        }
    }

    game.dataPoints += 1;
    save();
}

load();

const observer = new MutationObserver(() => {
    getAllScores();
    console.log(game);
});

for (const elt of getAllScoreElements()) {
    observer.observe(elt, { characterData: true, subtree: true });
}