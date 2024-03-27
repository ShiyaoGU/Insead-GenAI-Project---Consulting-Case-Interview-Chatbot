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

    # 为模型生成回复和后续问题设置更具体的指导
    # 我们在这里通过提供一个结构化的提示，鼓励模型在回答后提出一个问题
    prompt = f"{user_message}\n\n###\n\nAs an interviewer of MBB, please provide a thoughtful response to the candidate's question and ask a follow-up question to engage further.\n\n###\n\n"
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": prompt}
        ],
    
        max_tokens=500,  # 控制生成内容的长度
        
    )

    # 提取模型生成的回复和问题
    generated_response = response.choices[0].message.content

    return jsonify({'message': generated_response})

@app.route('/generate_report')
def generate_report():
    if len(user_data) >= 5:
        # 假设user_data中保存了所有用户消息和机器人回答
        dialogues = " ".join([d['message'] for d in user_data[-5:]])  # 只取最后五次对话
        prompt = f"Based on the following dialogue:\n{dialogues}\n\nGenerate a comprehensive report based on consulting firm's case interview standards."

        response = client.create_completion(
            model="gpt-3.5-turbo",
            prompt=prompt,
            max_tokens=1024,
        )
        report = response.choices[0].text
        return render_template('report.html', report=report)
    else:
        return render_template('report.html', report="This is a test report.")

@app.route('/favicon.ico')
def favicon():
    return '', 204  # 返回204 No Content响应


if __name__ == '__main__':
    app.run(debug=True)