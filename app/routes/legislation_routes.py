from flask import Blueprint, jsonify, request, abort
from app.models import LegislativeBill, db

bp = Blueprint('legislation', __name__)

@bp.route('/<int:congress_id>/<int:legislative_id>', methods=['GET'])
def get_legislative_bill(congress_id, legislative_id):
    bill = LegislativeBill.query.filter_by(congress_id=congress_id, legislative_id=legislative_id).first()
    if not bill:
        abort(404, description="Legislative bill not found")
    return jsonify({
        'id': bill.id,
        'legislative_id': bill.legislative_id,
        'summary': bill.summary,
        'bill_name': bill.bill_name,
        'congress_id': bill.congress_id,
        'text': bill.text, 
        'link': bill.link
    })

@bp.route('/<int:congress_id>/<int:legislative_id>', methods=['PUT'])
def update_legislative_bill(congress_id, legislative_id):
    bill = LegislativeBill.query.filter_by(congress_id=congress_id, legislative_id=legislative_id).first()
    if not bill:
        abort(404, description="Legislative bill not found")

    data = request.get_json()
    if not data:
        abort(400, description="Invalid data")

    bill.legislative_id = data.get('legislative_id', bill.legislative_id)
    bill.summary = data.get('summary', bill.summary)
    bill.bill_name = data.get('bill_name', bill.bill_name)
    bill.congress_id = data.get('congress_id', bill.congress_id)
    bill.text = data.get('text', bill.text)
    bill.link = data.get('link', bill.link)

    db.session.commit()

    return jsonify({
        'id': bill.id,
        'legislative_id': bill.legislative_id,
        'summary': bill.summary,
        'bill_name': bill.bill_name,
        'congress_id': bill.congress_id,
        'text': bill.text, 
        'link': bill.link
    })
