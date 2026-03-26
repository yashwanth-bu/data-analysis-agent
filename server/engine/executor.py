import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go

from engine.serializer import Encoder

# 🔥 Disable show (VERY IMPORTANT)
plt.show = lambda *args, **kwargs: None

class SandboxExecutor:

    def __init__(self):
        self.FORBIDDEN = [
            "import", "os", "sys", "subprocess",
            "open", "eval", "exec", "compile"
        ]
        self.encoder = Encoder()

    def execute(self, code, df):

        print("[DEBUG] Executing code...")

        if any(word in code for word in self.FORBIDDEN):
            print("[DEBUG] Forbidden keyword detected!")
            return {"error": "Forbidden keyword detected", "result": None}

        local_var = {
            "df": df, "pd": pd, "np": np, "plt": plt,
            "sns": sns, "px": px, "go": go,
            "result": None
        }

        try:
            print("[DEBUG] Generated Code:\n", code)

            exec(code, {}, local_var)

            print("[DEBUG] Code executed successfully.")

            fig = local_var.get("result")

            # 🔥 CRITICAL FIX
            if fig is None:
                print("[DEBUG] No result returned → using plt.gcf() fallback")
                fig = plt.gcf()

            img_base64 = self.encoder.encode(fig)

            return {"result": fig, "image_base64": img_base64}

        except Exception as e:
            print("[DEBUG] Execution error:", e)
            return {"error": str(e), "result": None, "image_base64": None}