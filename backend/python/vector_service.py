import csv
import faiss
import numpy as np
import os
import pickle
from typing import List, Dict
from init import OpenAIService

class VectorService:
    def __init__(self):
        self.index_file = "./db/finance_index.faiss"
        self.metadata_file = "./db/finance_metadata.pkl"
        self.embedding_dim = 1536  # OpenAI embeddings dimension
        
        # 确保db目录存在
        os.makedirs(os.path.dirname(self.index_file), exist_ok=True)
        
        self.openai_service = OpenAIService()
        self.index = None
        self.metadata = []  # 存储文本和其他元数据
        
        self.load_or_create_index()
        print("FAISS Vector service initialized.")

    def load_or_create_index(self):
        """加载现有索引或创建新索引"""
        if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
            self.load_index()
        else:
            self.create_index()
            self.init_db()

    def create_index(self):
        """创建新的FAISS索引"""
        # 使用L2距离的IndexFlatL2（也可以考虑使用IVFFlat等更高级的索引）
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        print(f"Created new FAISS index with dimension {self.embedding_dim}")

    def load_index(self):
        """加载已有的FAISS索引"""
        self.index = faiss.read_index(self.index_file)
        
        # 加载元数据
        with open(self.metadata_file, 'rb') as f:
            self.metadata = pickle.load(f)
        
        print(f"Loaded FAISS index with {self.index.ntotal} vectors")

    def save_index(self):
        """保存FAISS索引和元数据"""
        faiss.write_index(self.index, self.index_file)
        
        # 保存元数据
        with open(self.metadata_file, 'wb') as f:
            pickle.dump(self.metadata, f)
        
        print(f"Saved FAISS index with {self.index.ntotal} vectors")

    def init_db(self):
        """初始化数据库，从CSV加载数据"""
        sentences = []
        with open("./finance.csv") as f:
            reader = csv.reader(f)
            for row in reader:
                if row:  # 确保行不为空
                    sentences.append(row[0])  # 取第一列

        # 分批处理，避免内存问题
        batch_size = 500
        for i in range(0, len(sentences), batch_size):
            chunk = sentences[i:i + batch_size]
            embeddings = self.openai_service.embed_text(chunk)
            
            # 将嵌入转换为numpy数组并确保是float32类型
            embeddings_np = np.array(embeddings).astype('float32')
            
            # 添加到索引
            self.index.add(embeddings_np)
            
            # 保存元数据
            self.metadata.extend([{"text": text, "id": len(self.metadata) + j} 
                                 for j, text in enumerate(chunk)])
            
            print(f"Processed {min(i + batch_size, len(sentences))}/{len(sentences)} sentences")

        # 保存索引
        self.save_index()

    def search(self, query_text: str, k: int = 1):
        """
        搜索与查询最相似的向量
        
        Args:
            query_text: 查询文本
            k: 返回结果数量
            
        Returns:
            包含相似文本和距离的字典列表
        """
        # 生成查询嵌入
        query_embedding = self.openai_service.embed_text([query_text])[0]
        query_vector = np.array([query_embedding]).astype('float32')
        
        # 搜索
        distances, indices = self.index.search(query_vector, k)
        
        index = indices[0][0]
        distance = distances[0][0]
        if index >= 0 and distance >= 0.1:
            return self.metadata[index]["text"], distance

        return None, 0.0

    def insert_data(self, texts: List[str]):
        """
        添加新数据到索引
        
        Args:
            texts: 要添加的文本列表
        """
        embeddings = self.openai_service.embed_text(texts)
        embeddings_np = np.array(embeddings).astype('float32')
        
        # 添加到索引
        self.index.add(embeddings_np)
        
        # 保存元数据
        start_id = len(self.metadata)
        self.metadata.extend([{"text": text, "id": start_id + j} 
                             for j, text in enumerate(texts)])
        
        # 保存更新后的索引
        self.save_index()