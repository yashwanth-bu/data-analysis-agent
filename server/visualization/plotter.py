from visualization.schema import VisualResponse
from engine.prompter import PromptManager
from pathlib import Path
import numpy as np

class Visualizer:
    def __init__(self, llm, sandbox, vectordb):
        self.llm = llm
        self.sandbox = sandbox
        self.vectordb = vectordb
        self.prompter = PromptManager(
            Path(__file__).parent / "instructions.yml"
        )
        self.df = None

    def set_dataset(self, df):
        self.df = df

    def profile_data(self, df):
        return {
            "shape": df.shape,
            "columns": list(df.columns),
            "profile_dtypes": df.dtypes.astype(str).to_dict(),
            "numeric_columns": df.select_dtypes(include=np.number).columns.tolist(),
            "categorical_columns": df.select_dtypes(include=["object", "category"]).columns.tolist(),
            "sample_rows": df.head(3).to_dict(orient="list")
        }

    def run(self, prompt, max_steps=3):
       
       print("[DEBUG] Running visualizer...")

       print("[DEBUG] Profiling data...")
       profile = self.profile_data(self.df)

       context = self.vectordb.retrieve_context(prompt)

       model = self.llm.get_llm(VisualResponse)

       print("[DEBUG] Building prompt for LLM...")

       message = self.prompter.prompt['BUILD_MESSAGE'].format(
            prompt=prompt,
            profile=profile,
            context=context
        )

       for step in range(max_steps):
            
            print(f"\n[ATTEMPT {step+1}] Calling LLM...")

            response = model.invoke(
                self.prompter.get_messages(message, 'SYSTEM_MESSAGE')
            )

            print("[DEBUG] LLM output parsed successfully.")

            result = self.sandbox.execute(response.code, self.df)

            if result.get("error"):

                print("[DEBUG] Code execution error detected. Updating prompt...")

                message += f"\nERROR FIX:\n{result['error']}\Error code.\n{response.code}\nFix This Code"
                continue

            print("[DEBUG] Visualization executed successfully.")

            return {
                "insight": response.insight,
                "image_base64": result["image_base64"]
            }
       
       print("[DEBUG] Failed to generate visualization after max steps.")

       return {"error": "Failed to generate visualization"}