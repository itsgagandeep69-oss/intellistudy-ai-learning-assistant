
import json
import ollama


def verify_answer(question, answer, context=""):
    prompt = f"""
You are an answer verification system for an AI learning assistant.

Check whether the answer is supported by the provided context.

Question:
{question}

Context:
{context}

Answer:
{answer}

Return ONLY valid JSON in this exact format:
{{
  "claims": [
    {{
      "claim": "A claim from the answer",
      "status": "Supported",
      "explanation": "Why the claim has this status"
    }}
  ]
}}

Use only these status values:
- Supported
- Contradicted
- Insufficient Evidence

If the context does not contain enough information, use
"Insufficient Evidence". Do not invent supporting facts.
"""

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        format="json"
    )

    result = response["message"]["content"]

    try:
        return json.loads(result)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "The verification model returned invalid JSON."
        ) from exc
