from langchain_ollama import ChatOllama

class OllamaClient:

    def __init__(self, model="qwen2.5-coder:7b"):

        print("[DEBUG] Initializing LLM...")

        self.LLM = ChatOllama(
            model=model,
            base_url="http://127.0.0.1:11434",
            temperature=0.1,
        )

    def get_llm(self, schema=None):

        print("[DEBUG] Initializing Structure LLM...")

        return (
            self.LLM.with_structured_output(schema)
            if schema else self.LLM
        )