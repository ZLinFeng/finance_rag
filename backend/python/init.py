import openai
from tenacity import retry_if_exception_type, retry, stop_after_attempt


class OpenAIService:
    def __init__(self):
        self.client = openai.Client(
            base_url="https://api.gptsapi.net/v1",
            api_key="",
        )

    @retry(
        retry=retry_if_exception_type(
            (ConnectionError, TimeoutError)
        ),  # 只重试这些异常
        stop=stop_after_attempt(5),
    )
    def embed_text(self, text_list: list[str]) -> list:
        response = self.client.embeddings.create(
            model="text-embedding-ada-002", input=text_list
        )
        return [data.embedding for data in response.data]
