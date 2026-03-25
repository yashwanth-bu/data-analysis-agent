import yaml
from langchain.messages import HumanMessage, SystemMessage

class PromptManager:
    def __init__(self, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            self.prompt = yaml.safe_load(f)

    def get_messages(self, query, prompt_type):
        return [
            SystemMessage(content=self.prompt[prompt_type].strip()),
            HumanMessage(content=query.strip())
        ]