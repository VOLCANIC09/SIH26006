from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.database.crud import seed_database
from backend.app.api.router import api_router

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

# Seed the database from CSV files
db = SessionLocal()
try:
    seed_database(db)
except Exception as e:
    print(f"Error seeding database: {e}")
finally:
    db.close()

app = FastAPI(
    title="FreightIQ API",
    description="Quantitative Bulk Cargo Decision-Support System",
    version="1.0.0"
)

# Configure CORS so the React frontend can fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API router under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "FreightIQ API",
        "documentation": "/docs"
    }
