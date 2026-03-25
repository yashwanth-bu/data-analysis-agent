from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from pathlib import Path

import os, dotenv
dotenv.load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class VectorStore:

    def __init__(self, persist_dir = None):

        print("[DEBUG] Initializing embeddings and vector store...")

        self.embedding = HuggingFaceEndpointEmbeddings(
            huggingfacehub_api_token=os.getenv("HF_TOKEN"),
            model="sentence-transformers/all-MiniLM-L6-v2"
        )

        self.store = Chroma(
            persist_directory=persist_dir or BASE_DIR / "chroma_db",
            embedding_function=self.embedding,
            collection_name="chunks"
        )

    def retrieve_context(self, query, k=5):

        print("[DEBUG] Retrieving context from vector store...")

        docs = self.store.similarity_search(query, k=k)
        return "\n\n".join([d.page_content for d in docs])