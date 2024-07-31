from . import db

class Term(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    faqTitle = db.Column(db.Text, nullable=True)
    faqQ1 = db.Column(db.Text, nullable=True)
    faqA1 = db.Column(db.Text, nullable=True)
    faqQ2 = db.Column(db.Text, nullable=True)
    faqA2 = db.Column(db.Text, nullable=True)
    faqQ3 = db.Column(db.Text, nullable=True)
    faqA3 = db.Column(db.Text, nullable=True)
    faqQ4 = db.Column(db.Text, nullable=True)
    faqA4 = db.Column(db.Text, nullable=True)
    faqQ5 = db.Column(db.Text, nullable=True)
    faqA5 = db.Column(db.Text, nullable=True)
    highKeywords = db.Column(db.Text, nullable=True)
    mediumKeywords = db.Column(db.Text, nullable=True)
    lowKeywords = db.Column(db.Text, nullable=True)
    faqHighKeywords = db.Column(db.Text, nullable=True)
    faqMediumKeywords = db.Column(db.Text, nullable=True)
    faqLowKeywords = db.Column(db.Text, nullable=True)
    prompt = db.Column(db.Text, nullable=True)
    response = db.Column(db.Text, nullable=True)
    keywords = db.relationship('Keyword', backref='term', cascade='all, delete-orphan')
    audit = db.relationship('Audit', uselist=False, backref='term', cascade='all, delete-orphan')
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Term {self.name}>'


class Audit(db.Model):
    id = db.Column(db.Integer, db.ForeignKey('term.id'), primary_key=True)
    FAQ = db.Column(db.Boolean, default=False)
    Summary = db.Column(db.Boolean, default=False)
    Technical_Stuff = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<Audit {self.id}>'

class Keyword(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    keyword = db.Column(db.String(255), nullable=False, unique=True)
    priority = db.Column(db.String(50), nullable=False)
    term_id = db.Column(db.Integer, db.ForeignKey('term.id'), nullable=False) 

    def __repr__(self):
        return f'<Keyword {self.keyword}>'

class LegislativeBill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    legislative_id = db.Column(db.String(255), nullable=False, unique=True)
    summary = db.Column(db.Text, nullable=True)
    bill_name = db.Column(db.String(255), nullable=True)
    congress_id = db.Column(db.Integer, nullable=False)
    text = db.Column(db.Text, nullable=True) 
    link = db.Column(db.Text, nullable=True)
    charcount = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f'<LegislativeBill {self.legislative_id}>'