from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import subprocess
import os
import requests
import threading
import time
from sync_theatres import sync_theatre_data

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['theatre_leeds']
events_collection = db['events']
bookings_collection = db['bookings']

def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc

def daily_sync_task():
    """
    Background task that runs the theatre sync every 24 hours.
    """
    while True:
        print("--- BACKGROUND TASK: Starting Daily Theatre Sync ---")
        try:
            sync_theatre_data()
            print("--- BACKGROUND TASK: Daily Sync Complete ---")
        except Exception as e:
            print(f"--- BACKGROUND TASK ERROR: {e} ---")
        
        # Sleep for 24 hours (86400 seconds)
        time.sleep(86400)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/events', methods=['GET'])
def get_events():
    try:
        category = request.args.get('category')
        query = {}
        if category and category != 'All':
            query['category'] = category
        # Return all events so filters on frontend work correctly
        events = list(events_collection.find(query))
        return jsonify([serialize_doc(event) for event in events])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<event_id>', methods=['GET'])
def get_event(event_id):
    try:
        if not ObjectId.is_valid(event_id):
            return jsonify({"error": "Invalid event ID format"}), 400
        event = events_collection.find_one({"_id": ObjectId(event_id)})
        if event:
            return jsonify(serialize_doc(event))
        return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        from datetime import datetime
        data = request.json
        booking = {
            "eventId": data.get("eventId"),
            "ticketCount": data.get("ticketCount"),
            "totalAmount": data.get("totalAmount"),
            "status": "confirmed",
            "bookingRef": "BK" + str(ObjectId())[:6].upper(),
            "seat": data.get("seat", "General Admission"),
            "purchaseDate": datetime.now().strftime("%d %b %Y, %H:%M")
        }
        result = bookings_collection.insert_one(booking)
        return jsonify({"message": "Booking successful", "bookingId": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    try:
        bookings = list(bookings_collection.find())
        results = []
        for b in bookings:
            event = events_collection.find_one({"_id": ObjectId(b['eventId'])})
            b['_id'] = str(b['_id'])
            if event:
                b['event'] = serialize_doc(event)
            results.append(b)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/sync', methods=['POST'])
def run_sync():
    try:
        # Allow manual sync trigger
        sync_theatre_data()
        return jsonify({"message": "Manual sync completed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<event_id>/seating-plan', methods=['GET'])
def get_seating_plan(event_id):
    try:
        event = events_collection.find_one({"_id": ObjectId(event_id)})
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        client_name = event.get('clientName') or VENUES.get(event['venue'])
        if not client_name:
            return jsonify({"error": f"Venue system not mapped for '{event['venue']}'"}), 400

        external_id = event.get('externalId')
        if not external_id:
             return jsonify({"error": "Event has no external ID for Spektrix"}), 400

        inst_url = f"https://system.spektrix.com/{client_name}/api/v3/events/{external_id}/instances"
        resp = requests.get(inst_url, timeout=15)
        if resp.status_code != 200:
            return jsonify({"error": f"Spektrix instance fetch failed: {resp.status_code}"}), resp.status_code
            
        instances = resp.json()
        if not instances:
            return jsonify({"error": "No live instances found for this show"}), 404
        
        instances_with_plans = [i for i in instances if i.get('planId')]
        if not instances_with_plans:
            return jsonify({"error": "No reserved seating plan found for this event"}), 200

        plan_id = instances_with_plans[0].get('planId')
        plan_url = f"https://system.spektrix.com/{client_name}/api/v3/plans/{plan_id}"
        plan_resp = requests.get(plan_url, timeout=15)
        if plan_resp.status_code != 200:
            return jsonify({"error": f"Spektrix plan fetch failed: {plan_resp.status_code}"}), plan_resp.status_code
            
        plan_data = plan_resp.json()
        return jsonify(plan_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

VENUES = {
    "Leeds Grand Theatre": "leedsheritagetheatres",
    "Opera North": "operanorth",
    "Northern Ballet": "northernballet"
}

if __name__ == '__main__':
    # Start the background sync thread
    # daemon=True ensures the thread dies when the main app stops
    threading.Thread(target=daily_sync_task, daemon=True).start()
    
    app.run(debug=True, port=5000, use_reloader=False) 
    # Note: use_reloader=False prevents the background thread from starting twice in debug mode
