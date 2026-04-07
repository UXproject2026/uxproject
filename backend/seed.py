# Utility script to populate the local MongoDB with sample data.
# This is used to ensure the application has visible content during development
# even if the Spektrix API is unreachable or sync hasn't run.

from pymongo import MongoClient

def seed_database():
    """
    Clears the existing 'events' collection and inserts a fresh set of 
    Figma-inspired theatre performances for testing.
    """
    # --- DATABASE CONNECTION ---
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    events_collection = db['events']

    # Clear existing data to avoid duplicates during development
    events_collection.delete_many({})

    # Sample data mapping closely to the designs and high-fidelity prototypes.
    events = [
        # Opera Category
        {
            "title": "The Sounds of Music",
            "venue": "Grand Theatre",
            "description": "The classic musical story of the Von Trapp family.",
            "date": "Tuesday 18th March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1503095396549-807039045349?q=80&w=500&auto=format&fit=crop",
            "category": "Opera",
            "price": 35.00
        },
        {
            "title": "The Sounds of Star Wars",
            "venue": "Grand Theatre",
            "description": "The epic music of Star Wars performed live.",
            "date": "Wednesday 19th March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1478479474719-dc524419e482?q=80&w=500&auto=format&fit=crop",
            "category": "Opera",
            "price": 40.00
        },
        {
            "title": "Eugene Onegin",
            "venue": "Grand Theatre",
            "description": "Tchaikovsky's masterpiece of unrequited love.",
            "date": "Thursday 20th March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=500&auto=format&fit=crop",
            "category": "Opera",
            "price": 45.00
        },
        # Live Music Category
        {
            "title": "Rhythm Of The 90s",
            "venue": "Leeds First Direct Bank Arena",
            "description": "A high-energy tribute to the best of 90s dance music.",
            "date": "Friday 21st March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=500&auto=format&fit=crop",
            "category": "Live Music",
            "price": 25.00
        },
        {
            "title": "Gorillaz",
            "venue": "Leeds First Direct Bank Arena",
            "description": "The world's most famous virtual band performs live.",
            "date": "Saturday 22nd March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=500&auto=format&fit=crop",
            "category": "Live Music",
            "price": 55.00
        },
        {
            "title": "GOON",
            "venue": "Leeds First Direct Bank Arena",
            "description": "Experimental rock and visual performance art.",
            "date": "Sunday 23rd March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1459749411177-042180ce6742?q=80&w=500&auto=format&fit=crop",
            "category": "Live Music",
            "price": 30.00
        },
        # Ballet Category
        {
            "title": "Three Short Ballets",
            "venue": "Leeds Grand Theatre",
            "description": "An evening of three modern ballet performances.",
            "date": "Monday 24th March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=500&auto=format&fit=crop",
            "category": "Ballet",
            "price": 45.00
        },
        {
            "title": "Cinderella",
            "venue": "Leeds Grand Theatre",
            "description": "The timeless fairy tale brought to life on stage.",
            "date": "Tuesday 25th March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=500&auto=format&fit=crop",
            "category": "Ballet",
            "price": 50.00
        },
        {
            "title": "Gentleman Jack",
            "venue": "Leeds Grand Theatre",
            "description": "A new ballet production based on the true story of Anne Lister.",
            "date": "Wednesday 26th March",
            "time": "18:00",
            "image": "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=500&auto=format&fit=crop",
            "category": "Ballet",
            "price": 55.00
        }
    ]

    events_collection.insert_many(events)
    print("Database seeded successfully with Figma-inspired data!")

if __name__ == "__main__":
    seed_database()
