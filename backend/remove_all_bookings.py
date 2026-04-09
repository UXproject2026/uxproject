"""
Database Maintenance Script: Remove All Bookings
----------------------------------------------
This script clears all records from the 'bookings' collection in the 'theatre_leeds' database.
It is used to reset the 'My Tickets' section by removing all existing ticket purchases.

Interaction with MongoDB:
- Connects to the local MongoDB instance on port 27017.
- Selects the 'theatre_leeds' database.
- Drops/clears the 'bookings' collection.
"""

from pymongo import MongoClient

def remove_all_bookings():
    # Establish connection to the local MongoDB instance
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    bookings_collection = db['bookings']

    # Delete all documents in the 'bookings' collection
    result = bookings_collection.delete_many({})
    
    print(f"Successfully removed {result.deleted_count} bookings from the database.")

if __name__ == "__main__":
    remove_all_bookings()
