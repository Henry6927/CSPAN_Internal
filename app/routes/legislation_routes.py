import logging
from flask import Blueprint, jsonify, request, make_response
from app.models import LegislativeBill, db
from flask_cors import CORS
from dotenv import load_dotenv
import os
import openai
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)
bp = Blueprint('legislation', __name__)

def create_error_response(message, status_code):
    response = make_response(jsonify({'error': message}), status_code)
    response.headers['Content-Type'] = 'application/json'
    return response

@bp.route('/<int:congress_id>/<int:legislative_id>', methods=['GET'])
def get_legislative_bill(congress_id, legislative_id):
    logger.debug(f"Fetching legislative bill with congress_id={congress_id}, legislative_id={legislative_id}")
    try:
        bill = LegislativeBill.query.filter_by(congress_id=congress_id, legislative_id=legislative_id).first()
        if not bill:
            logger.error(f"Legislative bill not found: congress_id={congress_id}, legislative_id={legislative_id}")
            return create_error_response("Legislative bill not found", 404)
    except Exception as e:
        logger.error(f"Error fetching legislative bill: {e}")
        return create_error_response("Internal server error while fetching legislative bill", 500)

    response = jsonify({
        'id': bill.id,
        'legislative_id': bill.legislative_id,
        'summary': bill.summary,
        'bill_name': bill.bill_name,
        'congress_id': bill.congress_id,
        'text': bill.text,
        'link': bill.link,
        'charcount': bill.charcount
    })
    response.headers['Content-Type'] = 'application/json'
    return response

@bp.route('/<int:congress_id>/<int:legislative_id>', methods=['PUT'])
def update_legislative_bill(congress_id, legislative_id):
    logger.debug(f"Updating legislative bill with congress_id={congress_id}, legislative_id={legislative_id}")
    try:
        bill = LegislativeBill.query.filter_by(congress_id=congress_id, legislative_id=legislative_id).first()
        if not bill:
            logger.error(f"Legislative bill not found: congress_id={congress_id}, legislative_id={legislative_id}")
            return create_error_response("Legislative bill not found", 404)
    except Exception as e:
        logger.error(f"Error fetching legislative bill for update: {e}")
        return create_error_response("Internal server error while fetching legislative bill for update", 500)

    data = request.get_json()
    if not data:
        logger.error("Invalid data received: No data")
        return create_error_response("Invalid data", 400)

    try:
        bill.legislative_id = int(data.get('legislative_id', bill.legislative_id))
        bill.summary = data.get('summary', bill.summary)
        bill.bill_name = data.get('bill_name', bill.bill_name)
        bill.congress_id = int(data.get('congress_id', bill.congress_id))
        bill.text = data.get('text', bill.text)
        bill.link = data.get('link', bill.link)
        bill.charcount = len(bill.text)  # Update charcount based on the length of the text
    except (ValueError, TypeError) as e:
        logger.error(f"Data type error during update: {e}")
        return create_error_response("Invalid data types in input data", 400)

    try:
        db.session.commit()
        logger.debug(f"Successfully updated legislative bill with id: {bill.id}")
    except Exception as e:
        logger.error(f"Error updating legislative bill: {e}")
        db.session.rollback()
        return create_error_response("Internal server error while updating legislative bill", 500)

    response = jsonify({
        'id': bill.id,
        'legislative_id': bill.legislative_id,
        'summary': bill.summary,
        'bill_name': bill.bill_name,
        'congress_id': bill.congress_id,
        'text': bill.text,
        'link': bill.link,
        'charcount': bill.charcount
    })
    response.headers['Content-Type'] = 'application/json'
    return response

@bp.route('/bills', methods=['POST'])
def create_legislative_bill():
    logger.debug("Received POST request to create a new legislative bill")
    data = request.get_json()
    logger.debug(f"Data received: {data}")

    if not data:
        logger.error("Invalid data: No data received")
        return create_error_response("Invalid data", 400)

    try:
        legislative_id = int(data.get('legislative_id'))
        congress_id = int(data.get('congress_id'))
        logger.debug(f"legislative_id: {legislative_id}, congress_id: {congress_id}")
    except (ValueError, TypeError) as e:
        logger.error(f"Data type error: {e}")
        return create_error_response("legislative_id and congress_id must be integers", 400)

    summary = data.get('summary', '')
    bill_name = data.get('bill_name', '')
    text = data.get('text', '')
    link = data.get('link', '')
    charcount = len(text)  # Calculate charcount from the length of the text

    # Check if the legislative_id already exists to prevent duplication
    existing_bill = LegislativeBill.query.filter_by(legislative_id=legislative_id).first()
    if existing_bill:
        logger.error(f"Legislative bill with legislative_id {legislative_id} already exists")
        return create_error_response(f"Legislative bill with legislative_id {legislative_id} already exists", 400)

    # Generate bill name if not provided
    if not bill_name:
        text_excerpt = text[:1000]
        prompt = (
            f"Generate a concise and descriptive title for a legislative bill. The bill text excerpt is: \"{text_excerpt}\". "
            "Provide a title that clearly and succinctly represents the main idea of the bill."
        )

        try:
            response = openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50,
                temperature=0.7
            )

            bill_name = response['choices'][0]['message']['content'].strip()
        except Exception as e:
            logger.error(f"Error generating bill name: {e}")
            return create_error_response(f"Error generating bill name: {str(e)}", 500)

    new_bill = LegislativeBill(
        legislative_id=legislative_id,
        summary=summary,
        bill_name=bill_name,
        congress_id=congress_id,
        text=text,
        link=link,
        charcount=charcount
    )
    
    try:
        db.session.add(new_bill)
        db.session.commit()
        logger.debug(f"New legislative bill added to database with id: {new_bill.id}")
    except Exception as e:
        logger.error(f"Database error while adding new legislative bill: {e}")
        db.session.rollback()
        return create_error_response(f"Internal server error while creating new legislative bill: {str(e)}", 500)

    response = jsonify({
        'id': new_bill.id,
        'legislative_id': new_bill.legislative_id,
        'summary': new_bill.summary,
        'bill_name': new_bill.bill_name,
        'congress_id': new_bill.congress_id,
        'text': new_bill.text,
        'link': new_bill.link,
        'charcount': new_bill.charcount
    })
    response.headers['Content-Type'] = 'application/json'
    return response, 201

@bp.route('/bills', methods=['GET'])
def get_all_legislative_bills():
    logger.debug("Fetching all legislative bills")

    sort_by = request.args.get('sort', default='congress_id')
    order = request.args.get('order', default='asc')

    try:
        if sort_by == 'congress_id':
            if order == 'asc':
                bills = LegislativeBill.query.order_by(LegislativeBill.congress_id.asc()).all()
            else:
                bills = LegislativeBill.query.order_by(LegislativeBill.congress_id.desc()).all()
        elif sort_by == 'legislative_id':
            if order == 'asc':
                bills = LegislativeBill.query.order_by(LegislativeBill.legislative_id.asc()).all()
            else:
                bills = LegislativeBill.query.order_by(LegislativeBill.legislative_id.desc()).all()
        else:
            bills = LegislativeBill.query.all()

        response = [
            {
                'bill_name': bill.bill_name,
                'congress_id': bill.congress_id,
                'legislative_id': bill.legislative_id,
                'charcount': bill.charcount  # Include charcount in the response
            }
            for bill in bills
        ]
        
        logger.debug(f"Successfully fetched {len(response)} bills")
        response_json = jsonify(response)
        response_json.headers['Content-Type'] = 'application/json'
        return response_json
    
    except Exception as e:
        logger.error(f"Error fetching legislative bills: {e}")
        return create_error_response("Internal server error while fetching legislative bills", 500)

@bp.route('/bills/clear', methods=['DELETE'])
def clear_all_legislation():
    logger.debug("Clearing all legislative bills")

    try:
        num_deleted = db.session.query(LegislativeBill).delete()
        db.session.commit()
        logger.debug(f"Successfully deleted {num_deleted} bills")
        return jsonify({'message': f'Successfully deleted {num_deleted} bills'}), 200
    except Exception as e:
        logger.error(f"Error clearing legislative bills: {e}")
        db.session.rollback()
        return create_error_response("Internal server error while clearing legislative bills", 500)


@bp.route('/generate-and-save-legislation/<int:congress_id>/<int:legislative_id>', methods=['POST'])
def generate_and_save_legislation(congress_id, legislative_id):
    logger.debug(f"Generating and saving legislation for congress_id={congress_id}, legislative_id={legislative_id}")

    url = f"https://www.congress.gov/{congress_id}/bills/hr{legislative_id}/BILLS-{congress_id}hr{legislative_id}ih.xml"
    logger.debug(f"Fetching data from URL: {url}")

    try:
        response = requests.get(url)
        response.raise_for_status()
        response_text = response.text
        if 'application/xml' in response.headers['Content-Type'] or 'text/xml' in response.headers['Content-Type']:
            soup = BeautifulSoup(response_text, 'lxml')  # Use 'xml' parser
            text = soup.get_text()
        else:
            text = response_text
        text = text[:4000] if len(text) > 4000 else text
    except requests.exceptions.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        return create_error_response(f"Error fetching data from URL: {http_err}", http_err.response.status_code)
    except Exception as e:
        logger.error(f"Error fetching data from URL: {e}")
        return create_error_response("Error fetching data from URL", 500)

    prompt_summary = (
        f"Summarize the following legislative bill text: {text}. Provide an objective and informative description suitable for a public website. Avoid using any political bias and keep the description within 200 words."
    )

    try:
        summary_response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt_summary}
            ],
            max_tokens=1500,
            temperature=0.7
        )

        summary = summary_response['choices'][0]['message']['content'].strip()
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return create_error_response(f"Error generating summary: {str(e)}", 500)

    text_excerpt = text[:3000]
    prompt_title = (
        f"Generate a concise and descriptive title for a legislative bill. The bill text excerpt is: \"{text_excerpt}\". "
        "Provide a title that clearly and succinctly represents the main idea of the bill."
    )

    try:
        title_response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt_title}
            ],
            max_tokens=150,
            temperature=0.7
        )

        bill_name = title_response['choices'][0]['message']['content'].strip()
    except Exception as e:
        logger.error(f"Error generating bill name: {e}")
        return create_error_response(f"Error generating bill name: {str(e)}", 500)

    new_bill = LegislativeBill(
        legislative_id=legislative_id,
        summary=summary,
        bill_name=bill_name,
        congress_id=congress_id,
        text=text,
        link=url,
        charcount=len(text)
    )
    
    try:
        db.session.add(new_bill)
        db.session.commit()
        logger.debug(f"New legislative bill added to database with id: {new_bill.id}")
    except Exception as e:
        logger.error(f"Database error while adding new legislative bill: {e}")
        db.session.rollback()
        return create_error_response(f"Internal server error while creating new legislative bill: {str(e)}", 500)

    response = jsonify({
        'id': new_bill.id,
        'legislative_id': new_bill.legislative_id,
        'summary': new_bill.summary,
        'bill_name': new_bill.bill_name,
        'congress_id': new_bill.congress_id,
        'text': new_bill.text,
        'link': new_bill.link,
        'charcount': new_bill.charcount
    })
    response.headers['Content-Type'] = 'application/json'
    return response, 201
CORS(bp)
load_dotenv()
openai.api_key = os.getenv('REACT_APP_API_KEY')