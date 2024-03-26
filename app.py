from flask import Flask, request, jsonify, render_template, redirect, url_for
import os
from openai import OpenAI

app = Flask(__name__)

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Dummy database
user_data = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.json
    user_data.append(data)  # Simple data storage
    return jsonify({"status": "success", "data": data})

@app.route('/chatbot')
def chatbot_page():
    return render_template('chatbot.html')

@app.route('/chatbot_message', methods=['POST'])
def chatbot_message():
    data = request.json
    user_message = data['message']

    # 使用客户端进行聊天完成
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": user_message}],
        model="gpt-3.5-turbo",
    )

    return jsonify({'message': response.choices[0].message.content})

if __name__ == '__main__':
    app.run(debug=True)
