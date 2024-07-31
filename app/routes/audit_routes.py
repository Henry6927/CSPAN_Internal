from flask import Blueprint, jsonify, request
from app.models import Term, Audit, db

bp = Blueprint('audits', __name__)

@bp.route('/<int:id>', methods=['PUT'])
def update_audit(id):
    audit = Audit.query.get(id)
    if not audit:
        # If the audit does not exist, create it with the provided data
        return create_audit_with_id(id)
    data = request.json
    audit.FAQ = data['auditData'].get('FAQ', audit.FAQ)
    audit.Summary = data['auditData'].get('Summary', audit.Summary)
    audit.Technical_Stuff = data['auditData'].get('Technical_Stuff', audit.Technical_Stuff)
    audit.notes = data.get('notes', audit.notes)
    db.session.commit()
    return jsonify({"message": "Audit updated successfully", "audit": {
        "id": audit.id,
        "FAQ": audit.FAQ,
        "Summary": audit.Summary,
        "Technical_Stuff": audit.Technical_Stuff,
        "notes": audit.notes
    }})

@bp.route('/<int:id>', methods=['GET'])
def get_audit(id):
    audit = Audit.query.get_or_404(id)
    return jsonify({
        "id": audit.id,
        "auditData": {
            "FAQ": audit.FAQ,
            "Summary": audit.Summary,
            "Technical_Stuff": audit.Technical_Stuff
        },
        "notes": audit.notes
    })

@bp.route('/', methods=['POST'])
def create_audit():
    data = request.json
    return create_audit_with_id(data['id'], data)

def create_audit_with_id(id, data=None):
    term = Term.query.get(id)
    if term:
        if not data:
            data = request.json
        audit = Audit(
            id=term.id,
            FAQ=data['auditData'].get('FAQ', False),
            Summary=data['auditData'].get('Summary', False),
            Technical_Stuff=data['auditData'].get('Technical_Stuff', False),
            notes=data.get('notes', '')
        )
        db.session.add(audit)
        db.session.commit()
        return jsonify({"message": "Audit created successfully", "audit": {
            "id": audit.id,
            "FAQ": audit.FAQ,
            "Summary": audit.Summary,
            "Technical_Stuff": audit.Technical_Stuff,
            "notes": audit.notes
        }}), 201
    return jsonify({"message": "Term not found"}), 404
