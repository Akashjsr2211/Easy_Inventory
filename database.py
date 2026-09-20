from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

db_url = "postgresql://postgres:akash123@localhost:5432/Product"
engine = create_engine(db_url)
session = sessionmaker(autoflush= False, autocommit=False, bind=engine)