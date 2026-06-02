"""
Seed a few demo candidates.
Usage:  python -m server.seed
"""
from .db import SessionLocal, engine, Base
from .models import Candidate

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        if db.query(Candidate).count() == 0:
            demo = [
                ("Alice A. — AfroPop", "https://picsum.photos/seed/alice/300/300", 2025),
                ("Boris B. — HipHop", "https://picsum.photos/seed/boris/300/300", 2025),
                ("Chloe C. — Gospel", "https://picsum.photos/seed/chloe/300/300", 2025),
            ]
            for name, url, year in demo:
                c = Candidate(
                    name=name,
                    photo_url=url,
                    slug=name.lower().replace(" ", "-").replace("—", "-"),
                    year=year,
                )

                db.add(c)
            db.commit()
            print("✅ Candidates seeded successfully.")
        else:
            print("ℹ️ Candidates already exist.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
