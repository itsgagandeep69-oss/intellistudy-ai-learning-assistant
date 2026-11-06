
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm import generate_answer
from verification import verify_answer

app = FastAPI(title="IntelliStudy API")

# Allow your VS Code Live Server frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    context: str = ""


@app.get("/")
def home():
    return {
        "message": "IntelliStudy API is running!"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    try:
        answer = generate_answer(
            question,
            context=request.context
        )

        verification = verify_answer(
            question,
            answer,
            context=request.context
        )

        return {
            "question": question,
            "answer": answer,
            "verification": verification
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        ) from exc
