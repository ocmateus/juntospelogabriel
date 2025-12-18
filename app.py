from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Rota principal que renderiza o index.html
@app.route('/')
def index():
    return render_template('index.html')

# Rota para servir arquivos estáticos (CSS, JS, JSON)
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

if __name__ == '__main__':
    app.run(debug=True) # debug=True para desenvolvimento, desativar em produçãoph