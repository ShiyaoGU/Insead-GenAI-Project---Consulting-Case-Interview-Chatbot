from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for
from flask_cors import CORS
from flask_session import Session
from flask import session
import os
from openai import OpenAI
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import torch
import ffmpeg

app = Flask(__name__)
CORS(app)
# app.config["SESSION_PERMANENT"] = False
# app.config["SESSION_TYPE"] = "filesystem"
# Session(app)


client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# # Dummy database
# conversation_history = [] # add into Vector database 



@app.route('/')
def home():
    return render_template('index.html')


@app.route('/menu')
def menu():
    return render_template('menu.html')

@app.route('/chatbot')
def chatbot_page():
    return render_template('chatbot.html')

@app.route('/submit-case', methods=['POST'])
def submit_case():
    data = request.json

    # 验证数据是否完整
    required_fields = ['geography', 'caseType', 'industry', 'difficulty']
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Missing data"}), 400

    geography = data.get('geography')
    case_type = data.get('caseType')
    industry = data.get('industry')
    difficulty = data.get('difficulty')

    # 在这里可以处理数据，例如保存到数据库
    print("Received data:", geography, case_type, industry, difficulty)

    # 返回给前端的响应
    return jsonify({"status": "success", "message": "Case received"})


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

# @app.route('/chatbot')
# def chatbot_page():
#     # 确保每次访问chatbot页面时，会话是新的
#     session.pop('conversation_history', None)
#     return render_template('chatbot.html')

# @app.route('/chatbot_message', methods=['POST'])
# def chatbot_message():
#     data = request.json
#     user_message = data['message']

#     # 初始化会话中的对话历史
#     if 'conversation_history' not in session:
#         session['conversation_history'] = []
    
#     # 更新会话中的对话历史
#     session['conversation_history'].append({"role": "user", "content": user_message})
    
#     # 生成回应的逻辑（保持不变）
#     prompt = f"{user_message}\n\n###\n\nAs an interviewer of MBB, please provide a thoughtful response to the candidate's question and ask a follow-up question to engage further.\n\n###\n\n"
    
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": prompt},
#             {"role": "user", "content": user_message},
#             {"role": "assistant", "content": prompt}
#         ],
#         max_tokens=500,
#     )

#     generated_response = response.choices[0].message.content

#     # 将回应也添加到会话中的对话历史
#     session['conversation_history'].append({"role": "assistant", "content": generated_response})

#     # 由于session是一个不可变对象，我们需要修改后重新指定它以保存更改
#     session.modified = True

#     return jsonify({'message': generated_response})


# Whisper Model Initialization
device = "cuda" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
model_id = "openai/whisper-large-v3"
model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True).to(device)
processor = AutoProcessor.from_pretrained(model_id)
asr_pipeline = pipeline("automatic-speech-recognition", model=model, tokenizer=processor.tokenizer, feature_extractor=processor.feature_extractor, device=device)

@app.route('/upload_audio', methods=['POST'])
def upload_audio():
    # This route should handle the audio file upload, save it, and pass it to the Whisper model
    if 'audio_file' in request.files:
        audio_file = request.files['audio_file']
        audio_path = f"./{audio_file.filename}"
        audio_file.save(audio_path)
        transcription_result = asr_pipeline(audio_path)
        text = transcription_result["text"]
        # Now you can handle the transcribed text as if it was a regular text message
        # by passing it to your chatbot model, etc.
        return jsonify({'transcribed_text': text})
    return jsonify({'error': 'No audio file provided'}), 400

@app.route('/generate_report')
def generate_report():
    # Render the report page
    return render_template('report.html')  # the HTML content for this page is in 'report.html' template


#  @app.route('/generate_report')
# def generate_report():
#     # 假设 conversation_history 存储了对话历史
#     conversation_history = session.get('conversation_history', []) """

#     if not conversation_history:
#         return "No conversation history available to generate a report.", 400
    
#     # 使用对话历史生成报告的逻辑
#     prompt_for_report = "Based on the following conversation, generate a comprehensive report.\n\nConversation:\n" + "\n".join([f"{message['role']}: {message['content']}" for message in conversation_history]) + "\n\n###\n\nReport:"

#     response_for_report = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": prompt_for_report},
#             {"role": "user", "content": "Please generate a report."},
#             {"role": "assistant", "content": prompt_for_report}
#         ],
#         max_tokens=1000,
#     )

#     generated_report = response_for_report.choices[0].message.content
    
#     # 清空对话历史
#     session.pop('conversation_history', None)
    
#     # 渲染报告页面
#     return render_template('report.html', report=generated_report) 

@app.route('/favicon.ico')
def favicon():
    return '', 204  # 返回204 No Content响应


# 应该只有一个这样的入口点
if __name__ == '__main__':
    app.run(debug=True)  
