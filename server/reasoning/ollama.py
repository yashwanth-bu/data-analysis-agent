from langchain_ollama import ChatOllama
import dotenv, os

dotenv.load_dotenv()

class OllamaClient:

    def __init__(self, model="qwen2.5-coder:7b"):

        print("[DEBUG] Initializing LLM...")

        self.LLM = ChatOllama(
            model=model,
            base_url=os.getenv("BASE_URL"),
            temperature=0.1,
        )

    def get_llm(self, schema=None):

        print("[DEBUG] Initializing Structure LLM...")

        return (
            self.LLM.with_structured_output(schema)
            if schema else self.LLM
        )