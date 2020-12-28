import os
import json
import uuid
from io import BytesIO

import requests
import matplotlib.pyplot as plt

WEBHOOK_URL = os.environ.get('WEBHOOK_URL')


def chart(event, context):
    data = json.loads(event['body'])

    times = [i / 1000 for i in data['times']]

    linestyle = ['.-', '.--', '.:', '--.']

    final_scores = {}

    fig, ax = plt.subplots()
    for i, name in enumerate(data['names']):
        style = linestyle[i % len(linestyle)]
        ax.plot(times, data[name], style, label=name)

        final_scores[name] = data[name][-1]

    plt.title('Dominion game score over time')
    plt.xlabel('Time (s since game start)')
    plt.ylabel('Score')

    high_score = max(final_scores.items(), key = lambda x: x[1])

    ax.legend()

    plot_data = BytesIO()
    plt.savefig(plot_data, format='png', dpi=300)

    plot_data.seek(0)

    requests.post(
        WEBHOOK_URL,
        files = {
            'file': ('chart.png', plot_data, 'image/png'),
        },
        data = {
            'content': f'Game results - {high_score[0]} won with a score of {high_score[1]}',
        },
    )

    return {
        'statusCode': 200,
        'body': 'ok',
    }
