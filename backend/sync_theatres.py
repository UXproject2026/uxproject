import requests
from pymongo import MongoClient
from datetime import datetime
import json
import time
import os

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['theatre_leeds']
events_collection = db['events']

VENUES_CONFIG = {
    "leedsheritagetheatres": {
        "default_name": "Leeds Grand Theatre",
        "use_attribute_venue": True # Handles City Varieties and Hyde Park Picture House
    },
    "operanorth": {
        "default_name": "Opera North",
        "use_attribute_venue": False
    },
    "northernballet": {
        "default_name": "Northern Ballet",
        "use_attribute_venue": False
    }
}

# Load the Knowledge Base of researched descriptions
KB_PATH = os.path.join(os.path.dirname(__file__), 'descriptions_kb.json')
KNOWLEDGE_BASE = {}
if os.path.exists(KB_PATH):
    with open(KB_PATH, 'r') as f:
        KNOWLEDGE_BASE = json.load(f)

def build_smart_description(ev, venue_name, category):
    title = ev.get('name')
    if title in KNOWLEDGE_BASE:
        return KNOWLEDGE_BASE[title]
    
    director = ev.get('attribute_Director')
    stars = [ev.get(f'attribute_FeaturingStars{i}') for i in range(1, 4)]
    stars = [s for s in stars if s]
    
    parts = []
    if stars:
        parts.append(f"Starring {', '.join(stars)}")
    if director:
        parts.append(f"directed by {director}")
    
    attr_desc = ""
    if parts:
        attr_desc = f"A spectacular {category} production at {venue_name}, {', '.join(parts)}."
    
    if not attr_desc:
        fallbacks = [
            f"Experience the magic of {title} live at the {venue_name}. A must-see {category} event in the heart of Leeds.",
            f"Join us at {venue_name} for a spectacular performance of {title}. This {category} production promises an unforgettable evening.",
            f"The {venue_name} is proud to present {title}. Discover the best of {category} this season."
        ]
        attr_desc = fallbacks[len(title) % len(fallbacks)]
        
    return attr_desc

def map_category(ev):
    text_to_search = [
        ev.get('name', ''),
        ev.get('description', ''),
        ev.get('attribute_Genre', ''),
        ev.get('attribute_Genre1', ''),
        ev.get('attribute_Genre2', ''),
        ev.get('attribute_TheatreWebsiteGenre', ''),
        ev.get('attribute_Artform', ''),
        ev.get('attribute_Event_Type', '')
    ]
    blob = " ".join([str(f) for f in text_to_search]).lower()

    if any(kw in blob for kw in ['ballet', 'dance', 'choreograph', 'swan lake', 'nutcracker', 'cinderella', 'rambert']):
        return 'Ballet'
    if any(kw in blob for kw in ['music', 'gig', 'concert', 'jazz', 'orchestra', 'symphony', 'band', '80s', 'classical', 'recital', 'sing', 'choir', 'tribute']):
        return 'Live Music'
    if any(kw in blob for kw in ['opera', 'musical', 'verdi', 'puccini', 'mozart', 'wagner', 'libretto', 'soprano', 'tenor']):
        return 'Opera'

    categories = ['Opera', 'Live Music', 'Ballet']
    return categories[len(ev.get('name', '')) % 3]

def sync_theatre_data():
    print("Finalizing sync for 4 active Leeds venues...")
    synced_count = 0
    
    for client_id, config in VENUES_CONFIG.items():
        url = f"https://system.spektrix.com/{client_id}/api/v3/events"
        try:
            print(f"Fetching from {client_id}...")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, timeout=20, headers=headers)
            
            if response.status_code == 200:
                events = response.json()
                print(f"Found {len(events)} events for {client_id}")
                
                for ev in events:
                    venue_name = config['default_name']
                    if config['use_attribute_venue']:
                        attr_venue = ev.get('attribute_Venue')
                        if attr_venue:
                            venue_name = attr_venue

                    raw_date = ev.get('firstInstanceDateTime')
                    display_date, display_time = "Date TBC", "18:00"
                    if raw_date:
                        try:
                            dt = datetime.strptime(raw_date.split('.')[0], "%Y-%m-%dT%H:%M:%S")
                            display_date, display_time = dt.strftime("%A %d %B")
                            display_time = dt.strftime("%H:%M")
                        except: pass

                    category = map_category(ev)
                    api_desc = ev.get('description') or ev.get('htmlDescription')
                    if api_desc and ('<div id>' in api_desc or len(api_desc) < 20):
                        api_desc = None
                    
                    final_desc = api_desc or build_smart_description(ev, venue_name, category)

                    mapped_event = {
                        "title": ev.get('name'),
                        "venue": venue_name,
                        "description": final_desc,
                        "date": display_date,
                        "time": display_time,
                        "image": ev.get('imageUrl') or "https://images.unsplash.com/photo-1514525253344-9914f2e7dd36?q=80&w=500&auto=format&fit=crop",
                        "hasRealImage": bool(ev.get('imageUrl')),
                        "category": category,
                        "price": 25.00,
                        "externalId": ev.get('id'),
                        "clientName": client_id
                    }
                    
                    events_collection.update_one(
                        {"title": mapped_event['title'], "venue": mapped_event['venue']},
                        {"$set": mapped_event},
                        upsert=True
                    )
                    synced_count += 1
            else:
                print(f"Failed to fetch from {client_id}: {response.status_code}")
        except Exception as e:
            print(f"Error syncing {client_id}: {e}")
        time.sleep(1)

    print(f"Sync complete. Total processed: {synced_count}")

if __name__ == "__main__":
    sync_theatre_data()
