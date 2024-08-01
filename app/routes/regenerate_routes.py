import os
import openai
import logging
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

bp = Blueprint('regenerate', __name__)
CORS(bp)

openai.api_key = os.getenv('REACT_APP_API_KEY')

logging.basicConfig(level=logging.DEBUG)

if openai.api_key:
    logging.debug("OpenAI API key loaded successfully.")
else:
    logging.error("OpenAI API key not found. Please check your environment variables.")

@bp.route('/regenerate', methods=['POST'])
def regenerate_text():
    data = request.json
    prompt = data.get('prompt')

    if not prompt:
        logging.error("No prompt provided")
        return jsonify({'error': 'No prompt provided'}), 400

    try:
        logging.debug(f"Sending request to OpenAI with prompt: {prompt}")
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000, 
            temperature=0.7
        )

        logging.debug(f"OpenAI response: {response}")
        generated_text = response['choices'][0]['message']['content'].strip()
        return jsonify({'generated_text': generated_text})
    except Exception as e:
        logging.error(f"Error generating text: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/generate-new-faq', methods=['POST'])
def generate_new_faq():
    data = request.json
    existing_faq = data.get('existingFaq')

    if not existing_faq:
        logging.error("No existing FAQ provided")
        return jsonify({'error': 'No existing FAQ provided'}), 400

    prompt = (
        f"Generate a new question and answer for an unbiased FAQ which will be put on the website of CSPAN to inform readers. "
        f"Be unbiased, apolitical, and informational. This is the FAQ we are replacing, hence try to avoid repeating this one: {existing_faq}. "
        "This FAQ should be informative without explicitly labeling its parts as a question or answer. Do not use formatting, put a '@' between the question and answer so I am able to separate them. "
        "Keep the answer concise, it should not exceed 50 words."
    )

    try:
        logging.debug(f"Sending request to OpenAI with prompt: {prompt}")
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000, 
            temperature=0.7
        )

        logging.debug(f"OpenAI response: {response}")
        new_faq_text = response['choices'][0]['message']['content'].strip()
        try:
            question, answer = new_faq_text.split('@')
            question = question.strip()
            answer = answer.strip()
            return jsonify({'newFaq': f"{question}@{answer}"})
        except ValueError as ve:
            logging.error(f"Error splitting FAQ response: {str(ve)}")
            return jsonify({'error': 'Error parsing the response from OpenAI'}), 500
    except Exception as e:
        logging.error(f"Error generating new FAQ: {str(e)}")
        return jsonify({'error': str(e)}), 500
