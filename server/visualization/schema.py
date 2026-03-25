from pydantic import BaseModel

class VisualResponse(BaseModel):
    code: str
    insight: str