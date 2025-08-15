import json
import openai


class NerService:
    def __init__(self):
        self.client = openai.Client(
            base_url="https://api.siliconflow.cn/v1",
            api_key="",
        )
        self.template = """There is a *sentence* about finance, please help me to extract financial named entity from this *sentence*. And your output is a json array and include the entity type, entity value which is from the sentence and confidence which is the probability. Your output must follow the *output format* strictly.
*sentence*: %s
output format: [{"entity_type": "xxxxxx", "entity_value": "xxxxxx", "confidence": 0.99}, .....]"""

    def extract_entities(self, text: str,) -> list:
        # Placeholder for entity extraction logic
        response = self.client.chat.completions.create(
            model="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
            temperature=0.2,
            messages=[
                {
                    "role": "user",
                    "content": self.template % text
                }
            ]
        )
        if response.choices:
            res_text = response.choices[0].message.content
            start = res_text.find("[")
            end = res_text.rfind("]")
            if start != -1 and end != -1:
                json_str = res_text[start:end + 1]
                json_str = json_str.strip("\n ")
                try:
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    pass
        return []

ner_service = NerService()


if __name__ == "__main__":
    ner_service = NerService()
    print(ner_service.extract_entities("The Federal Reserve's monetary policy decisions, particularly regarding interest rate adjustments, have a profound impact on global financial markets and currency valuations."))