from flask import Blueprint, jsonify, request
from app.models import Term, Audit, db

bp = Blueprint('audits', __name__)

@bp.route('/<int:id>', methods=['PUT'])
def update_audit(id):
    audit = Audit.query.get_or_404(id)
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
    term = Term.query.get(data['id'])
    if term:
        audit = Audit(
            id=term.id,
            FAQ=data.get('FAQ', False),
            Summary=data.get('Summary', False),
            Technical_Stuff=data.get('Technical_Stuff', False),
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
    return jsonify({"message": "Term not found"})
