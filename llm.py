
import ollama


def generate_answer(question, context=""):
    prompt = f"""
You are a helpful and knowledgeable educational AI assistant.

Your job is to answer students' questions clearly, accurately, and directly.

IMPORTANT RULES:
1. Answer general knowledge questions using your own knowledge.
2. Use the supplied document context when it is relevant.
3. If the document context is unrelated, ignore it.
4. Do not invent facts or pretend information is in the document
   when it is not.
5. If the question is about the uploaded document, prioritize it.
6. If uncertain, clearly acknowledge the uncertainty.
7. Keep your answer easy for students to understand.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

Provide a direct and helpful answer.
"""

    try:
        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]

    except Exception as error:
        raise RuntimeError(
            "Could not generate an answer. "
            "Check whether Ollama is running and "
            f"the llama3.2:3b model is installed. Details: {error}"
        ) from error
