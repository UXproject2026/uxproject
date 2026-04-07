"""
Testing/Maintenance Script: Remove Specific Ticket
-------------------------------------------------
This utility script is used for testing or manual database corrections. It removes 
 a single booking record for a specific event.

Interaction with MongoDB:
- Connects to the 'theatre_leeds' database.
- Locates an event titled "Blur the Lines" using regex.
- Finds the first available booking record associated with that event's ID.
- Deletes that specific booking from the 'bookings' collection.
"""

from pymongo import MongoClient
from bson import ObjectId

def remove_specific_ticket():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    
    # 1. Find the event
    event = db['events'].find_one({"title": {"$regex": "Blur the Lines", "$options": "i"}})
    if not event:
        print("Event 'Blur the Lines' not found.")
        return

    # 2. Find the first booking for this event
    booking = db['bookings'].find_one({"eventId": str(event['_id'])})
    if not booking:
        print(f"No bookings found for event: {event['title']}")
        return

    # 3. Delete the booking
    result = db['bookings'].delete_one({"_id": booking['_id']})
    if result.deleted_count > 0:
        print(f"Successfully removed the first ticket for '{event['title']}' (Ref: {booking.get('bookingRef')})")
    else:
        print("Failed to delete the booking.")

if __name__ == "__main__":
    remove_specific_ticket()
