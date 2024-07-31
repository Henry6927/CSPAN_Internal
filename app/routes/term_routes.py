import json
import logging
import time
import requests
import re
from flask import Blueprint, jsonify, request
from flask_cors import CORS
from app.models import Term, Audit, Keyword, db
from sqlalchemy.exc import IntegrityError
import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="../../.env")

bp = Blueprint('terms', __name__)
CORS(bp, resources={r"/*": {"origins": [os.getenv('REACT_APP_FRONTEND_URL'), os.getenv('REACT_APP_BACKEND_URL')]}})
logging.basicConfig(level=logging.INFO)

@bp.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin in [os.getenv('REACT_APP_FRONTEND_URL'), os.getenv('REACT_APP_BACKEND_URL')]:
        response.headers.add('Access-Control-Allow-Origin', origin) 
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


AIRTABLE_BASE_ID = os.getenv('REACT_APP_AIRTABLE_BASE_ID')
AIRTABLE_API_KEY = os.getenv('REACT_APP_AIRTABLE_API_KEY')
AIRTABLE_TABLE_NAME = os.getenv('REACT_APP_AIRTABLE_TABLE_NAME')

@bp.route('/delete_terms_above/<int:limit>', methods=['DELETE'])
def delete_terms_above(limit):
    try:
        terms_to_delete = Term.query.filter(Term.id > limit).all()
        num_rows_deleted = len(terms_to_delete)
        
        for term in terms_to_delete:
            db.session.delete(term)
        
        db.session.commit()
        return jsonify({"message": f"Deleted {num_rows_deleted} terms with IDs greater than {limit}."}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting terms with IDs greater than {limit}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@bp.route('/keywords', methods=['GET'])
def get_keywords():
    keywords = Keyword.query.all()
    return jsonify([
        {
            "id": keyword.id,
            "keyword": keyword.keyword,
            "priority": keyword.priority
        } for keyword in keywords
    ])

@bp.route('/sync_keywords', methods=['POST'])
def sync_keywords():
    try:
        keywords = Keyword.query.all()
        terms = Term.query.all()

        logging.info(f"Found {len(keywords)} keywords and {len(terms)} terms")

        if not keywords:
            return jsonify({"message": "No keywords found in the database"}), 404

        if not terms:
            return jsonify({"message": "No terms found in the database"}), 404

        for term in terms:
            term_keywords_high = []
            term_keywords_medium = []
            term_keywords_low = []
            faq_keywords_high = []
            faq_keywords_medium = []
            faq_keywords_low = []

            if term.response:
                term_keywords_high += extract_keywords_from_text(term.response, keywords, "high", term.name)
                term_keywords_medium += extract_keywords_from_text(term.response, keywords, "medium", term.name)
                term_keywords_low += extract_keywords_from_text(term.response, keywords, "low", term.name)

            faq_content = " ".join(filter(None, [
                term.faqTitle, term.faqQ1, term.faqA1,
                term.faqQ2, term.faqA2, term.faqQ3,
                term.faqA3, term.faqQ4, term.faqA4,
                term.faqQ5, term.faqA5
            ]))

            term_keywords_high += extract_keywords_from_text(faq_content, keywords, "high", term.name)
            term_keywords_medium += extract_keywords_from_text(faq_content, keywords, "medium", term.name)
            term_keywords_low += extract_keywords_from_text(faq_content, keywords, "low", term.name)
            faq_keywords_high += extract_keywords_from_faq_answers(term, keywords, "high", term.name)
            faq_keywords_medium += extract_keywords_from_faq_answers(term, keywords, "medium", term.name)
            faq_keywords_low += extract_keywords_from_faq_answers(term, keywords, "low", term.name)

            term_keywords_high = set(term_keywords_high) if term_keywords_high else set()
            term_keywords_medium = set(term_keywords_medium) if term_keywords_medium else set()
            term_keywords_low = set(term_keywords_low) if term_keywords_low else set()
            faq_keywords_high = set(faq_keywords_high) if faq_keywords_high else set()
            faq_keywords_medium = set(faq_keywords_medium) if faq_keywords_medium else set()
            faq_keywords_low = set(faq_keywords_low) if faq_keywords_low else set()

            term.highKeywords = ", ".join(term_keywords_high) if term_keywords_high else term.highKeywords
            term.mediumKeywords = ", ".join(term_keywords_medium) if term_keywords_medium else term.mediumKeywords
            term.lowKeywords = ", ".join(term_keywords_low) if term_keywords_low else term.lowKeywords
            term.faqHighKeywords = ", ".join(faq_keywords_high) if faq_keywords_high else term.faqHighKeywords
            term.faqMediumKeywords = ", ".join(faq_keywords_medium) if faq_keywords_medium else term.faqMediumKeywords
            term.faqLowKeywords = ", ".join(faq_keywords_low) if faq_keywords_low else term.faqLowKeywords

            db.session.commit()

        return jsonify({"message": "Keywords synced successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error syncing keywords: {str(e)}")
        return jsonify({"message": str(e)}), 500

def extract_keywords_from_text(text, keywords, priority, term_name):
    extracted_keywords = []
    for keyword in keywords:
        if keyword.keyword.lower() in text.lower() and keyword.priority.lower() == priority and keyword.keyword.lower() != term_name.lower():
            extracted_keywords.append(keyword.keyword)
    return extracted_keywords

def extract_keywords_from_faq_answers(term, keywords, priority, term_name):
    extracted_keywords = []
    faq_answers = [
        term.faqA1, term.faqA2, term.faqA3,
        term.faqA4, term.faqA5
    ]
    for answer in faq_answers:
        if answer:
            for keyword in keywords:
                if keyword.keyword.lower() in answer.lower() and keyword.priority.lower() == priority and keyword.keyword.lower() != term_name.lower():
                    extracted_keywords.append(keyword.keyword)
    return extracted_keywords

@bp.route('/clear_keywords', methods=['DELETE'])
def clear_keywords():
    try:
        terms = Term.query.all()
        for term in terms:
            term.highKeywords = ""
            term.mediumKeywords = ""
            term.lowKeywords = ""
        db.session.commit()
        return jsonify({"message": "Cleared high, medium, and low keywords for all terms."}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error clearing keywords: {str(e)}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@bp.route('/keywords', methods=['POST'])
def add_keyword():
    data = request.json
    keyword = data.get('keyword')
    priority = data.get('priority')

    if not keyword or not priority:
        return jsonify({"message": "Keyword and priority are required"}), 400

    existing_keyword = Keyword.query.filter_by(keyword=keyword).first()
    if existing_keyword:
        return jsonify({"message": "A keyword with this name already exists"}), 409

    new_keyword = Keyword(keyword=keyword, priority=priority)
    db.session.add(new_keyword)
    db.session.commit()

    return jsonify({"message": "Keyword added successfully"}), 201

def sanitize_for_airtable(value):
    if isinstance(value, str):
        value = value.encode('unicode_escape').decode('utf-8')
    return value

def delete_all_airtable_records():
    base_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}"
    }
    while True:
        response = requests.get(base_url, headers=headers)
        if response.status_code == 200:
            records = response.json().get('records', [])
            if not records:
                break
            for record in records:
                delete_url = f"{base_url}/{record['id']}"
                requests.delete(delete_url, headers=headers)
        else:
            logging.error(f"Error fetching data from Airtable: {response.status_code} {response.text}")
            response.raise_for_status()

def send_to_airtable(data):
    base_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {k: sanitize_for_airtable(v) for k, v in data.items()}

    logging.info(f"Creating new record with URL: {base_url}")
    response = requests.post(base_url, headers=headers, json={"fields": data})

    if response.status_code in [200, 201]:
        return response.json()
    else:
        logging.error(f"Error response from Airtable: {response.status_code} {response.text}")
        response.raise_for_status()

def send_to_airtable_batch(data_batch):
    for data in data_batch:
        send_to_airtable(data)


def send_to_airtable_batch(data_batch):
    for data in data_batch:
        send_to_airtable(data)

def sanitize_keywords(value):
    if isinstance(value, str):
        value = value.strip('[]').replace("\"", "").replace('"', '').replace("'", "").strip()
    return value

@bp.route('/send_to_airtable', methods=['POST'])
def send_all_to_airtable():
    try:
        terms = Term.query.all()
        if not terms:
            delete_all_airtable_records()
            return jsonify({"message": "All terms in Airtable deleted successfully as no terms exist in the database."}), 200

        delete_all_airtable_records()
        records = []
        for term in terms:
            audit_data = fetch_audit_data(term.id)
            if audit_data is None or audit_data.get('auditData') is None:
                audit_fields = {
                    "FAQ": "False",
                    "Summary": "False",
                    "Technical_Stuff": "False",
                    "notes": ''
                }
            else:
                audit_fields = {
                    "FAQ": format_boolean(audit_data.get('auditData', {}).get('FAQ', False)),
                    "Summary": format_boolean(audit_data.get('auditData', {}).get('Summary', False)),
                    "Technical_Stuff": format_boolean(audit_data.get('auditData', {}).get('Technical_Stuff', False)),
                    "notes": audit_data.get('notes', '') or ''
                }

            record = {
                "fields": {
                    "id": str(term.id),
                    "name": term.name,
                    "faqTitle": term.faqTitle,
                    "faqQ1": term.faqQ1,
                    "faqA1": term.faqA1,
                    "faqQ2": term.faqQ2,
                    "faqA2": term.faqA2,
                    "faqQ3": term.faqQ3,
                    "faqA3": term.faqA3,
                    "faqQ4": term.faqQ4,
                    "faqA4": term.faqA4,
                    "faqQ5": term.faqQ5,
                    "faqA5": term.faqA5,
                    "highKeywords": term.highKeywords,
                    "mediumKeywords": term.mediumKeywords,
                    "lowKeywords": term.lowKeywords,
                    "faqHighKeywords": term.faqHighKeywords,
                    "faqMediumKeywords": term.faqMediumKeywords,
                    "faqLowKeywords": term.faqLowKeywords,
                    "prompt": term.prompt,
                    "response": term.response,
                    **audit_fields
                }
            }

            logging.info(f"Sanitized record: {json.dumps(record, indent=2)}")

            records.append(record)
            time.sleep(0.1)

        logging.info(f"Records to be sent: {records}")
        for i in range(0, len(records), 10):
            batch = records[i:i + 10]
            try:
                send_to_airtable_batch([record['fields'] for record in batch])
            except requests.exceptions.RequestException as e:
                logging.error(f"Error sending batch to Airtable: {e}")
                return jsonify({"message": f"An error occurred: {str(e)}"}), 500

        return jsonify({"message": "All terms sent to Airtable successfully."}), 200
    except Exception as e:
        logging.error(f"Unhandled exception: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

def fetch_audit_data(term_id):
    audit_url = f"http://10.10.8.178:5000/api/audit/{term_id}"
    retries = 5
    delay = 0.1
    while retries > 0:
        try:
            audit_response = requests.get(audit_url)
            if audit_response.status_code == 200:
                return audit_response.json()
            else:
                logging.error(f"Error fetching audit data for term_id {term_id}: {audit_response.status_code}")
                return {"auditData": None, "notes": None}
        except requests.exceptions.RequestException as e:
            logging.error(f"Error fetching audit data for term_id {term_id}: {e}")
            retries -= 1
            time.sleep(delay)
            delay *= 2
    return {"auditData": None, "notes": None}

def format_boolean(value):
    return str(value)

@bp.route('/', methods=['GET'])
def get_terms():
    try:
        terms = Term.query.all()
        terms_with_audit = []
        for term in terms:
            audit = Audit.query.filter_by(id=term.id).first()
            term_data = {
                "id": term.id,
                "name": term.name,
                "faqTitle": term.faqTitle,
                "faqQ1": term.faqQ1,
                "faqA1": term.faqA1,
                "faqQ2": term.faqQ2,
                "faqA2": term.faqA2,
                "faqQ3": term.faqQ3,
                "faqA3": term.faqA3,
                "faqQ4": term.faqQ4,
                "faqA4": term.faqA4,
                "faqQ5": term.faqQ5,
                "faqA5": term.faqA5,
                "highKeywords": term.highKeywords,
                "mediumKeywords": term.mediumKeywords,
                "lowKeywords": term.lowKeywords,
                "faqHighKeywords": term.faqHighKeywords,
                "faqMediumKeywords": term.faqMediumKeywords,
                "faqLowKeywords": term.faqLowKeywords,
                "prompt": term.prompt,
                "response": term.response,
                "notes": term.notes,
                "audit": {
                    "FAQ": audit.FAQ if audit else None,
                    "Summary": audit.Summary if audit else None,
                    "Technical_Stuff": audit.Technical_Stuff if audit else None,
                    "notes": audit.notes if audit else None
                } if audit else None
            }
            terms_with_audit.append(term_data)
        
        logging.info(f"Sending response with terms: {terms_with_audit}")
        return jsonify(terms_with_audit), 200
    except Exception as e:
        logging.error(f"Error fetching terms: {str(e)}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500



@bp.route('/<int:id>', methods=['GET'])
def get_term(id):
    term = Term.query.get_or_404(id)
    keyword = Keyword.query.filter_by(term_id=term.id).first()
    audit = Audit.query.filter_by(id=term.id).first()

    return jsonify({
        "id": term.id,
        "name": term.name,
        "faqTitle": term.faqTitle,
        "faqQ1": term.faqQ1,
        "faqA1": term.faqA1,
        "faqQ2": term.faqQ2,
        "faqA2": term.faqA2,
        "faqQ3": term.faqQ3,
        "faqA3": term.faqA3,
        "faqQ4": term.faqQ4,
        "faqA4": term.faqA4,
        "faqQ5": term.faqQ5,
        "faqA5": term.faqA5,
        "highKeywords": term.highKeywords,
        "mediumKeywords": term.mediumKeywords,
        "lowKeywords": term.lowKeywords,
        "faqHighKeywords": term.faqHighKeywords,
        "faqMediumKeywords": term.faqMediumKeywords,
        "faqLowKeywords": term.faqLowKeywords,
        "prompt": term.prompt,
        "response": term.response,
        "priority": keyword.priority if keyword else None,
        "audit": {
            "FAQ": audit.FAQ if audit else None,
            "Summary": audit.Summary if audit else None,
            "Technical_Stuff": audit.Technical_Stuff if audit else None,
            "notes": audit.notes if audit else None
        } if audit else None
    })

@bp.route('/process_custom_question', methods=['POST'])
def process_custom_question():
    data = request.json
    custom_question = data.get('customQuestion') + " You are creating an FAQ for the unbiased CSPAN website. Please create an answer to this question in 15-40 words. Please have it in sentence form, be objective and unbiased in your answer, and be purely factual."

    if not custom_question:
        return jsonify({"message": "Custom question is required"}), 400

    response = get_openai_response(custom_question)
    return jsonify({"response": response}), 200

@bp.route('/<int:id>', methods=['PUT'])
def update_term(id):
    term = Term.query.get_or_404(id)
    data = request.json
    logging.info(f"Received data for updating term with ID {id}: {data}")
    try:
        for key, value in data.items():
            if key == 'audit':
                audit_data = value
                audit = Audit.query.filter_by(id=term.id).first()
                if not audit:
                    audit = Audit(id=term.id)
                    db.session.add(audit)
                audit.FAQ = audit_data.get('FAQ', audit.FAQ)
                audit.Summary = audit_data.get('Summary', audit.Summary)
                audit.Technical_Stuff = audit_data.get('Technical_Stuff', audit.Technical_Stuff)
                audit.notes = audit_data.get('notes', audit.notes)
            else:
                if hasattr(term, key):
                    logging.info(f"Setting attribute {key} to {value}")
                    setattr(term, key, value)
        db.session.commit()
        logging.info(f"Term with ID {id} updated successfully")
        return jsonify({"message": "Term updated successfully"})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating term with ID {id}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500




def get_openai_response(prompts):
    api_key = os.getenv('REACT_APP_API_KEY')
    url = 'https://api.openai.com/v1/chat/completions'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }
    payloads = [
        {
            'model': 'gpt-4o',
            'messages': [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            'max_tokens': 650
        } for prompt in prompts
    ]

    responses = []
    for payload in payloads:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            responses.append(response.json()['choices'][0]['message']['content'].strip())
        else:
            logging.error(f'OpenAI request failed: {response.status_code} {response.text}')
            responses.append(f'Request failed with status code: {response.status_code}')

    return responses

def generate_prompt(keyword, term_type, additional_keywords):
    additional_text = f" Try to include these words: {additional_keywords}."
    if term_type == 'countries':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 purely informational words providing an overview and one paragraph history of {keyword}. Use this format: [overview, history, economic importance, political background/importance, key political and notable figures]. Do not include a summary. Do not use bullet points. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'cities':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write a 300 word article which is purely informational providing an overview, history and the global significance of {keyword}. Make sure to talk about its important political, economic and historical factors while remaining unbiased and factual. Do not use bullet points. Do not include a conclusion paragraph. Follow this structure: [overview, history, political, economic, historical, global significance/place in modern world]. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'scientists':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 words providing an overview and the accomplishments of {keyword}. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'first ladies':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 words providing an overview and the accomplishments of {keyword}. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'notable people':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 words providing an overview and the accomplishments of {keyword}. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'military conflicts':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 words providing an overview and history of {keyword}, including key events and major players. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'person':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 words providing an overview and the accomplishments of {keyword} that highlight key issues and accomplishments of their political career. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'political events':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 words providing an overview and history of {keyword}, including its key issues and outcomes. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    elif term_type == 'us laws':
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Write 300 purely informational words providing an overview and history of the {keyword} law, including its key provisions and impact. Do not use bullet points. Do not include a conclusion paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    else:
        return f'You are an unbiased news reporter working for C-SPAN writing a summary of {keyword} for the website. Adhering to AP Style guidelines, write 300 purely informational words providing an overview and history of {keyword}. Do not use bullet points. Do not include a conclusion or summary paragraph. Use journalism grammar and avoid idiomatic language or exaggerations.' + additional_text
    
def generate_faq_prompt(keyword):
    return (f'You are an unbiased impartial C-Span Journalist. Provide a detailed objective, factual, and unbiased FAQ '
            f'about {keyword}. Do 5 FAQs, start with "Frequently Asked Questions about the {keyword}", end the title starting line '
            f'with a "*", separate each question from answer with a ~. Separate each of the 5 entries with a "///". '
            f'The title sentence does not need any separation besides a "*" from the first question. '
            f'Do not number the questions and no "-", just write out each with the separation points "///" and "~" accordingly. '
            f'Should be less than 250 words.')

def ensure_question_format(text):
    text = re.sub(r'\?~', '? *', text)  
    text = re.sub(r'\? ~', '? *', text) 
    text = re.sub(r'(\?)(?!~|\*)', r'\1 *', text) 
    return text

def clean_text(text):
    text = re.sub(r'[\'"]', '', text) 
    text = re.sub(r'\b\d+\.\)', '', text) 
    text = re.sub(r'\* ~', '*', text)
    text = re.sub(r'/// ~', '*', text)
    text = re.sub(r'\* ///', '*', text)
    text = re.sub(r'///', '*', text) 
    text = re.sub(r'~', '*', text) 
    text = ensure_question_format(text)
    text = re.sub(r'\* \*', '*', text) 
    return text

def parse_faq_content(faq):
    faq = clean_text(faq)
    parts = faq.split('*')
    items = [part.strip() for part in parts if part.strip()]
    return items

@bp.route('/new', methods=['POST'])
def create_term():
    data = request.json
    name = data.get('name')
    term_type = data.get('type')
    additional_keywords = data.get('additional_keywords', '')
    priority = data.get('priority')
    custom_prompt = data.get('custom_prompt', '')

    # Check for required fields
    if not name or not term_type or not priority:
        return jsonify({"message": "Name, type, and priority are required"}), 400

    # Check if term already exists
    existing_term = Term.query.filter_by(name=name).first()
    if existing_term:
        return jsonify({"message": "A term with this name already exists"}), 409

    try:
        # Generate prompts
        summary_prompt = custom_prompt if custom_prompt else generate_prompt(name, term_type, additional_keywords)
        faq_prompt = generate_faq_prompt(name)

        # Get responses from OpenAI
        prompts = [summary_prompt, faq_prompt]
        responses = get_openai_response(prompts)

        summary_response = responses[0]
        faq_response = responses[1]
        faq_items = parse_faq_content(faq_response)

        # Generate new ID
        last_term = Term.query.order_by(Term.id.desc()).first()
        new_id = last_term.id + 1 if last_term else 1

        # Logging for debugging
        logging.info(f"FAQ items: {faq_items}")

        # Create new term
        new_term = Term(
            id=new_id,
            name=name,
            prompt=summary_prompt,
            response=summary_response,
            faqTitle=faq_items[0] if len(faq_items) > 0 else '',
            faqQ1=faq_items[1] if len(faq_items) > 1 else '',
            faqA1=faq_items[2] if len(faq_items) > 2 else '',
            faqQ2=faq_items[3] if len(faq_items) > 3 else '',
            faqA2=faq_items[4] if len(faq_items) > 4 else '',
            faqQ3=faq_items[5] if len(faq_items) > 5 else '',
            faqA3=faq_items[6] if len(faq_items) > 6 else '',
            faqQ4=faq_items[7] if len(faq_items) > 7 else '',
            faqA4=faq_items[8] if len(faq_items) > 8 else '',
            faqQ5=faq_items[9] if len(faq_items) > 9 else '',
            faqA5=faq_items[10] if len(faq_items) > 10 else ''
        )

        # Add new term to the session
        db.session.add(new_term)
        db.session.commit()  # Commit to save the new term

        # Retrieve the newly created term to use its ID
        created_term = Term.query.get(new_term.id)
        logging.info(f"Created Term from DB: {created_term}")

        # Add keyword for the new term
        new_keyword = Keyword(keyword=created_term.name, priority=priority, term_id=created_term.id)
        db.session.add(new_keyword)
        db.session.commit()  # Commit to save the new keyword

        return jsonify({"id": new_term.id, "message": "Term and keyword created successfully"}), 201

    except Exception as e:
        db.session.rollback()  # Rollback the session in case of error
        logging.error(f"Error creating new term: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500



def fetch_from_airtable():
    base_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}"
    }
    records = []
    offset = None
    while True:
        params = {}
        if offset:
            params['offset'] = offset
        response = requests.get(base_url, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            records.extend(data['records'])
            offset = data.get('offset')
            if not offset:
                break
        else:
            logging.error(f"Error fetching data from Airtable: {response.status_code} {response.text}")
            response.raise_for_status()
    return records

def convert_to_boolean(value):
    return value.lower() == 'true' if isinstance(value, str) else bool(value)

@bp.route('/<int:id>', methods=['DELETE'])
def delete_term(id):
    try:
        term = Term.query.get_or_404(id)
        db.session.delete(term)
        db.session.commit()
        return jsonify({"message": f"Deleted term with ID: {id}"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting term with ID {id}: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@bp.route('/delete_all', methods=['DELETE'])
def delete_all_terms():
    try:
        num_rows_deleted = db.session.query(Term).delete()
        db.session.commit()
        return jsonify({"message": f"Deleted {num_rows_deleted} terms."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@bp.route('/fetch_from_airtable', methods=['GET'])
def fetch_from_airtable_and_update():
    try:
        records = fetch_from_airtable()

        fetched_ids = [int(record['fields']['id']) for record in records]
        logging.info(f"Fetched IDs from Airtable: {fetched_ids}")

        db_ids = [term.id for term in Term.query.all()]
        logging.info(f"Fetched IDs from Database: {db_ids}")

        ids_to_delete = set(db_ids) - set(fetched_ids)
        logging.info(f"IDs to delete: {ids_to_delete}")

        for term_id in ids_to_delete:
            term = Term.query.get(term_id)
            if term:
                db.session.delete(term)
                logging.info(f"Deleted term with ID: {term_id}")

        db.session.commit()

        for record in records:
            term_id = int(record['fields']['id'])
            term_name = record['fields'].get('name', '')
            logging.info(f"Processing term with ID: {term_id} and name: {term_name}")

            term_data = {
                "id": term_id,
                "name": term_name,
                "faqTitle": record['fields'].get('faqTitle', ''),
                "faqQ1": record['fields'].get('faqQ1', ''),
                "faqA1": record['fields'].get('faqA1', ''),
                "faqQ2": record['fields'].get('faqQ2', ''),
                "faqA2": record['fields'].get('faqA2', ''),
                "faqQ3": record['fields'].get('faqQ3', ''),
                "faqA3": record['fields'].get('faqA3', ''),
                "faqQ4": record['fields'].get('faqQ4', ''),
                "faqA4": record['fields'].get('faqA4', ''),
                "faqQ5": record['fields'].get('faqQ5', ''),
                "faqA5": record['fields'].get('faqA5', ''),
                "highKeywords": record['fields'].get('highKeywords', ''),
                "mediumKeywords": record['fields'].get('mediumKeywords', ''),
                "lowKeywords": record['fields'].get('lowKeywords', ''),
                "faqHighKeywords": record['fields'].get('faqHighKeywords', ''),
                "faqMediumKeywords": record['fields'].get('faqMediumKeywords', ''),
                "faqLowKeywords": record['fields'].get('faqLowKeywords', ''),
                "prompt": record['fields'].get('prompt', ''),
                "response": record['fields'].get('response', '')
            }

            try:
                new_term = Term(**term_data)
                db.session.add(new_term)
                db.session.commit()
                logging.info(f"Created new term with ID: {term_id}")
            except IntegrityError:
                db.session.rollback()
                # Update the existing term
                term = Term.query.filter_by(name=term_name).first()
                if term:
                    for key, value in term_data.items():
                        setattr(term, key, value)
                    db.session.commit()
                    logging.info(f"Updated existing term with name: {term_name}")

            audit_data = {
                "id": term_id,
                "FAQ": convert_to_boolean(record['fields'].get('FAQ', False)),
                "Summary": convert_to_boolean(record['fields'].get('Summary', False)),
                "Technical_Stuff": convert_to_boolean(record['fields'].get('Technical_Stuff', False)),
                "notes": record['fields'].get('notes', '') or ''
            }

            try:
                new_audit = Audit(**audit_data)
                db.session.add(new_audit)
                db.session.commit()
                logging.info(f"Created new audit data for term with ID: {term_id}")
            except IntegrityError:
                db.session.rollback()
                # Update the existing audit data
                audit = Audit.query.get(term_id)
                if audit:
                    for key, value in audit_data.items():
                        setattr(audit, key, value)
                    db.session.commit()
                    logging.info(f"Updated audit data for term with ID: {term_id}")

            logging.info(f"Completed processing term with ID: {term_id}")

            time.sleep(0.1)

        return jsonify({"message": "Database updated successfully from Airtable."}), 200
    except Exception as e:
        logging.error(f"Unhandled exception: {str(e)}")
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


@bp.route('/test_fetch', methods=['GET'])
def test_fetch():
    try:
        records = fetch_from_airtable()
        return jsonify(records), 200
    except Exception as e:
        logging.error(f"Unhandled exception: {str(e)}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
