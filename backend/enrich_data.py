"""
Data Enrichment Script: Event Descriptions (Batch 1)
---------------------------------------------------
This script is used to enrich the 'events' collection with detailed, high-quality 
descriptions for a specific set of live events.

Interaction with MongoDB:
- Connects to the 'theatre_leeds' database.
- Uses case-insensitive regex matching on the 'title' field to identify target events.
- Performs 'update_many' operations to set the 'description' field for matching documents.
"""

from pymongo import MongoClient
import os

def enrich_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    events_collection = db['events']

    # Use absolute paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    kb_path = os.path.join(script_dir, 'descriptions_kb.json')
    img_kb_path = os.path.join(script_dir, 'images_kb.json')
    
    descriptions = {}
    if os.path.exists(kb_path):
        with open(kb_path, 'r') as f:
            descriptions = json.load(f)
        
    images = {}
    if os.path.exists(img_kb_path):
        with open(img_kb_path, 'r') as f:
            images = json.load(f)

    # Combine titles from both KBs
    all_titles = set(list(descriptions.keys()) + list(images.keys()))

    for title in all_titles:
        update_fields = {}
        if title in descriptions:
            update_fields["description"] = descriptions[title]
        if title in images:
            update_fields["image"] = images[title]
            update_fields["hasRealImage"] = True

        if update_fields:
            result = events_collection.update_many(
                {"title": {"$regex": f"^{title}$", "$options": "i"}},
                {"$set": update_fields}
            )
            print(f"Enriched '{title}': {result.modified_count} records updated.")

    # Also apply category-based fallback images for anyone still using the generic theatre logo
    fallbacks = {
        'Opera': "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop",
        'Ballet': "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
        'Live Music': "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop"
    }
    
    for cat, img_url in fallbacks.items():
        result = events_collection.update_many(
            {"category": cat, "hasRealImage": False},
            {"$set": {"image": img_url}}
        )
        print(f"Updated {result.modified_count} {cat} events with high-quality fallback images.")

if __name__ == "__main__":
    import json
    enrich_data()
