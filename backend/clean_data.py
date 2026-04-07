"""
Database Maintenance Script: Clean Mock Data
-------------------------------------------
This script is used for database cleanup, specifically to remove mock or test event data
from the production-ready 'events' collection.

Interaction with MongoDB:
- Connects to the 'theatre_leeds' database.
- Deletes events from the 'events' collection that match a predefined list of mock titles.
- Removes any event documents that lack an 'externalId' field, ensuring only live 
  integrated events remain.
"""

from pymongo import MongoClient

def clean_mock_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    events_collection = db['events']

    # List of original mock titles from both Theatre Leeds and previous updates
    titles_to_remove = [
        "Agatha Christie's The Mousetrap", 
        "Afternoon Jazz with Sarah Jane", 
        "The Leeds Grand Opera", 
        "Swan Lake", 
        "The Sounds f Music", 
        "The Sounds of Star Wars", 
        "Eugene Onegin", 
        "Rhythm Of The 90s", 
        "Gorillaz", 
        "GOON", 
        "Three Short Ballets", 
        "Cinderella", 
        "Gentleman Jack"
    ]

    result = events_collection.delete_many({"title": {"$in": titles_to_remove}})
    print(f"Cleaned up {result.deleted_count} mock events.")
    
    # Also remove any that don't have an externalId (those are likely the mock ones)
    result_ext = events_collection.delete_many({"externalId": {"$exists": False}})
    print(f"Removed {result_ext.deleted_count} additional events without live external IDs.")

if __name__ == "__main__":
    clean_mock_data()
