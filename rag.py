
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Load the embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")


def chunk_text(text, chunk_size=500, overlap=50):
    """Split document text into overlapping chunks."""
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])

        if chunk:
            chunks.append(chunk)

    return chunks


def create_vector_store(chunks):
    """Convert chunks into embeddings and store them in FAISS."""
    if not chunks:
        raise ValueError("No text chunks were provided.")

    embeddings = model.encode(
        chunks,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    embeddings = embeddings.astype("float32")

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    return index, embeddings


def retrieve_relevant_chunks(question, chunks, index, top_k=3):
    """Retrieve the most relevant document chunks."""
    if not chunks or index is None:
        return []

    question_embedding = model.encode(
        [question],
        convert_to_numpy=True,
        normalize_embeddings=True
    ).astype("float32")

    top_k = min(top_k, len(chunks))

    scores, indices = index.search(question_embedding, top_k)

    results = []

    for score, idx in zip(scores[0], indices[0]):
        if idx >= 0:
            results.append({
                "text": chunks[idx],
                "score": float(score)
            })

    return results
