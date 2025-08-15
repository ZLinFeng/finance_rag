from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router


def create_app() -> FastAPI:
    app = FastAPI()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    
    app.include_router(router)
    
    return app
    
    


def main():
    import uvicorn

    uvicorn.run(
        "main:create_app", host="0.0.0.0", port=8001, reload=True
    )


if __name__ == "__main__":
    main()
