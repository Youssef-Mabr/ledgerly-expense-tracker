from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dashboard_routes import router as dashboard_router
from app.api.expense_routes import router as expense_router
from app.api.income_routes import router as income_router
from app.api.pdf_routes import router as pdf_router
from app.api.project_routes import router as project_router
from app.db.session import Base, engine
from app.models import Expense, Income, Project


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Project Expense & Claim Tracker Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project_router)
app.include_router(expense_router)
app.include_router(income_router)
app.include_router(dashboard_router)
app.include_router(pdf_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
