from pymongo import MongoClient

def enrich_batch_2():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['theatre_leeds']
    events_collection = db['events']

    enrichments = [
        {
            "title": "Al Murray All You Need is Guv",
            "desc": "The 'Pub Landlord' returns with a brand-new stand-up show for 2026. In a world he describes as a 'mess,' Al Murray offers his signature 'Common Sense' hot-takes as a 'truth tonic' for the masses. The show features his classic persona—pint in hand—offering a 'barrel of laughs' and a 'flower in his heart.' For those seeking the full experience, 'Splash Zone' tickets are available (ponchos included)."
        },
        {
            "title": "Alan Carr: Have I Said Too Much?",
            "desc": "Alan Carr is back on tour with his 'lips unsealed.' Known for his big mouth and talent for oversharing, Alan dishes on the drama of his life, including stories about dipping back into the dating pool, navigating showbiz green rooms, and tales from the Traitors turret. It is a night of high-energy comedy from a certified national treasure."
        },
        {
            "title": "Alasdair Beckett-King: King of Crumbs",
            "desc": "Multi-award-winning comedian and internet sensation Alasdair Beckett-King brings his 'crumbliest' show yet. King of Crumbs is a 'rallying cry for uplifting nonsense,' blending his signature whimsical stand-up with animation and film. He explores topics ranging from the 'flotsam of millennial childhood' to why Pop Tarts were rubbish, all delivered with his unique, slightly surrealist flair."
        },
        {
            "title": "Alfie Moore: Acopalypse Now",
            "desc": "The copper-turned-comedian and star of BBC Radio 4’s It’s a Fair Cop presents a show centered on the 'Four Horsemen' of the modern age: Rising Crime, Global Warming, AI, and Culture Wars. Alfie provides a comedic antidote to the breakdown of law and order, sharing stories from his policing career to show how pragmatism and laughter can defuse even the most menacing showdowns."
        },
        {
            "title": "An Evening of Burlesque",
            "desc": "The UK’s longest-running burlesque show, this is a variety extravaganza that blends stylish cabaret, comedy, music, and circus. The production features world-class entertainers, 'champagne showgirls,' and specialty artists in a night of glitz and glamour. Expect fun, feathers, and fabulous costumes in a show that redefines traditional variety for the 21st century."
        },
        {
            "title": "An Evening With Gregor Fisher",
            "desc": "The Scottish stage and screen legend (famous for Rab C. Nesbitt, Love Actually, and The Baldy Man) shares stories and anecdotes from his decades-long career. Joined by his friend and colleague Nigel West, the show is an intimate 'in conversation' event filled with reflections on the highs, lows, and 'probably best forgotten' moments of his life in show business."
        },
        {
            "title": "An Evening with Harry Redknapp",
            "desc": "One of football’s most iconic personalities and the 2018 I’m a Celebrity winner shares stories from his legendary career. Harry regales the audience with anecdotes from the 'beautiful game' and behind-the-scenes tales from his time in the jungle. The show typically concludes with an audience Q&A, offering a live and unfiltered look at his life in sports and TV."
        }
    ]

    for item in enrichments:
        result = events_collection.update_many(
            {"title": {"$regex": item['title'].replace('?', '\\?'), "$options": "i"}},
            {"$set": {"description": item['desc']}}
        )
        print(f"Enriched '{item['title']}': {result.modified_count} records updated.")

if __name__ == "__main__":
    enrich_batch_2()
