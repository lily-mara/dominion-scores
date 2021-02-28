import os
import json
import uuid
from io import BytesIO

import requests
import matplotlib.pyplot as plt
import waitress
from flask import Flask, jsonify
import flask


WEBHOOK_URL = os.environ.get('WEBHOOK_URL')

app = Flask(__name__)


@app.route('/chart', methods=['POST'])
def chart():
    data = flask.request.get_json()

    linestyle = ['.-', '.--', '.:', '--.']

    final_scores = {}

    fig, ax = plt.subplots()
    for (i, (name, data_points)) in enumerate(data['scores'].items()):
        style = linestyle[i % len(linestyle)]

        times = [i / 1000 for i in data_points['times']]
        ax.plot(times, data_points['scores'], style, label=name)

        final_scores[name] = data_points['scores'][-1]

    for timestamp in data['turnChanges']:
        plt.axvline(x=timestamp / 1000, alpha=0.5, color='grey', linestyle='--', linewidth=0.25)

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

    return 'ok'


@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    return response


if __name__ == "__main__":
    waitress.serve(app, listen='*:80')
