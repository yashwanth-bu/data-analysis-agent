from engine.executor import SandboxExecutor
from engine.retriever import VectorStore
from reasoning.ollama import OllamaClient
from visualization.plotter import Visualizer

import pandas as pd
import io

class Orchestrator:

    def __init__(self):
        self.df = None
        self.ALLOW_EXETENTIONS = (".csv", ".xlsx", ".xls", ".json", ".parquet")

        self.llm = OllamaClient()
        self.sandbox = SandboxExecutor()
        self.vecotdb = VectorStore()
        self.visualizer = Visualizer(
            self.llm,
            self.sandbox,
            self.vecotdb
        )


    def verify_dataset(self, filename):
        if filename.lower().endswith(self.ALLOW_EXETENTIONS):
            return True
        return False
    
    def read_datasets(self, content):
        try:
            # self.df = pd.read_csv(
            #     io.BytesIO(content), encoding="utf-8", encoding_errors="replace"
            # )
            self.df = pd.read_csv(content)
            return True
        except Exception:
            return False
        
    def execute_pipeline(self, prompt):
        self.visualizer.set_dataset(self.df)
        return self.visualizer.run(prompt)
    