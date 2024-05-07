from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:32167@localhost:5455/postgres'
db = SQLAlchemy(app)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now())
    
    def __repr__(self):
        return f"Event: {self.description}"
    
    def __init__(self, description):
        self.description = description
        
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Event': Event}

def format_event(event):
    return {
        "description": event.description,
        "id": event.id,
        "created_at": event.created_at,
    }

@app.route('/')
def hello():
    return "Привет"

# create an event
@app.route('/events', methods=['POST'])
def create_event():
    description = request.json.get('description')
    event = Event(description)
    db.session.add(event)
    db.session.commit()
    return format_event(event)

# get all events
@app.route('/events', methods=['GET'])
def get_events():
    events = Event.query.order_by(Event.id.asc()).all()
    formatted_events = [format_event(event) for event in events]
    return jsonify(formatted_events)

# get single event
@app.route('/events/<id>', methods=['GET'])
def get_by_id(id):
    event = Event.query.filter_by(id=id).one()
    return {"event": format_event(event)}

# delete an event
@app.route('/events/<id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.filter_by(id=id).one()
    db.session.delete(event)
    db.session.commit()
    return 'Event id - {id} , deleted'.format(id=id)

# edit an event
@app.route('/events/<id>', methods=['PUT'])
def edit_event(id):
    event = Event.query.filter_by(id=id).first()
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    description = request.json.get('description')
    if not description:
        return jsonify({"error": "Missing description"}), 400
    
    event.description = description
    event.created_at = datetime.now()
    db.session.commit()
    
    return jsonify({"event": format_event(event)})
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)