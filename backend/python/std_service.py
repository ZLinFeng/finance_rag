from init import OpenAIService
from vector_service import VectorService
from ner_service import NerService


class StdService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.vector_service = VectorService()
        self.ner_service = NerService()
        
    def std(self, text: str):
        std_res, distance = self.vector_service.search(text)
        return std_res, distance


std_service = StdService()