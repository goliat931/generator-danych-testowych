from flask import Flask, jsonify, render_template
import random

app = Flask(__name__)

# Nowa trasa, która wyświetla plik index.html
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate-pesel', methods=['GET'])
def generate_pesel():
    # Bardzo uproszczona logika generowania numeru PESEL
    pesel = ''.join([str(random.randint(0, 9)) for _ in range(11)])
    return jsonify({'pesel': pesel})

if __name__ == '__main__':
    app.run(debug=True)