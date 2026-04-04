from pymongo import MongoClient
from bson import ObjectId

def clean_bookings():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    bookings_collection = db['bookings']
    events_collection = db['events']

    bookings = list(bookings_collection.find())
    deleted_count = 0

    for booking in bookings:
        event_id = booking.get('eventId')
        if not event_id:
            bookings_collection.delete_one({"_id": booking['_id']})
            deleted_count += 1
            continue

        # Check if event exists
        try:
            event = events_collection.find_one({"_id": ObjectId(event_id)})
            if not event:
                bookings_collection.delete_one({"_id": booking['_id']})
                deleted_count += 1
        except:
            # If ID is invalid format
            bookings_collection.delete_one({"_id": booking['_id']})
            deleted_count += 1

    print(f"Cleaned up {deleted_count} orphaned bookings.")

if __name__ == "__main__":
    clean_bookings()
