(async () => {
    const KEY = '__dominionGame.state';
    const URL = 'https://56b89pgxxk.execute-api.us-east-1.amazonaws.com/dev/chart';

    const gameJson = localStorage.getItem(KEY);

    await fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: gameJson,
    });
})();