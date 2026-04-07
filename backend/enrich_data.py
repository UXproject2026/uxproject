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

def enrich_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    events_collection = db['events']

    enrichments = [
        {
            "title": "100 Years Celebration of Laurel & Hardy",
            "desc": "Presented by Neil Brand, the foremost exponent of silent film and improvised piano, this centenary tour celebrates the 1926 signing of Stan Laurel and Oliver Hardy to Hal Roach Studios. The show features brand-new restorations of their silent films and lesser-known comedies, brought to life with Brand’s signature live piano improvisations. The evening includes unique insights into the birth of the cinema industry, a lively Q&A session, and a post-show 'Meet and Greet'."
        },
        {
            "title": "10cc's Graham Gouldman & Heart Full of Songs",
            "desc": "This semi-acoustic tour features 10cc co-founder Graham Gouldman performing hits from his illustrious songwriting career. The setlist includes 10cc classics like 'I’m Not In Love' and 'Dreadlock Holiday,' alongside hits he wrote for other artists, such as 'Bus Stop' (The Hollies), 'For Your Love' (The Yardbirds), and 'No Milk Today' (Herman’s Hermits). Gouldman is joined by a four-piece band to present these perfectly-crafted songs in their simplest, most intimate form."
        },
        {
            "title": "A Country Night in Nashville",
            "desc": "Direct from the Royal Albert Hall, this production recreates the energy of a buzzing downtown Nashville honky-tonk. It takes audiences on a musical journey through the history of country music, featuring hits from legends like Johnny Cash, Dolly Parton, and Willie Nelson, as well as modern stars like Kacey Musgraves and The Chicks. Performed by Dominic Halpin and The Hurricanes, the show includes favorites like '9 to 5,' 'Ring of Fire,' and 'The Gambler'."
        },
        {
            "title": "A Night to Remember: Motown Show",
            "desc": "This high-energy stage production authentically recreates the sound of 1960s Detroit. Starring The Voice UK finalist Bizzi Dixon and backed by the 'Motown Divas' and a live show band, the performance features 38 hits from the Motown and Soul era. With dazzling costumes and choreography, the show is designed to be an immersive experience that often has audiences dancing in the aisles to the music of Marvin Gaye, The Temptations, and more."
        },
        {
            "title": "A Particularly Nasty Case: A Murderously Funny Evening With Adam Kay",
            "desc": "BAFTA-winning writer and comedian Adam Kay (author of 'This Is Going to Hurt') returns with a 'murderously funny' evening to launch his debut medical thriller novel, 'A Particularly Nasty Case'. The show features hilarious and horrifying anecdotes from his time on the wards, exclusive readings from the new book, and a unique insight into the British healthcare system. Each event includes an audience Q&A session."
        },
        {
            "title": "Alan Bleasdale's Boys From The Blackstuff",
            "desc": "Adapted for the stage by James Graham (Dear England, Sherwood), this powerful new production brings Alan Bleasdale’s BAFTA-winning 1980s TV series to life. Set in Liverpool during the unemployment crisis of the Thatcher era, it follows five men—Chrissie, Loggo, George, Dixie, and Yosser—as they struggle to provide for their families. Directed by Kate Wasserberg, the play is a 'blistering and timely' drama packed with heart, humor, and the famous 'Gizza job' catchphrase."
        }
    ]

    for item in enrichments:
        result = events_collection.update_many(
            {"title": {"$regex": item['title'], "$options": "i"}},
            {"$set": {"description": item['desc']}}
        )
        print(f"Enriched '{item['title']}': {result.modified_count} records updated.")

if __name__ == "__main__":
    enrich_data()
