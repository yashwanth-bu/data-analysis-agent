from core.orchestrator import Orchestrator
import pandas as pd

if __name__ == '__main__':

    runtime = Orchestrator()

    while True:
        prompt = input("\nUser: ")
        if prompt in ['/exit', '/close', '/quit']: break
        if runtime.read_datasets("cleaned.csv"):
            runtime.execute_pipeline(prompt)