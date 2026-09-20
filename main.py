from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from model import product
import database_model
from database import session, engine
from sqlalchemy.orm import Session

app  = FastAPI()

database_model.base.metadata.create_all(bind = engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"]
)




@app.get("/")
def greet():
    db = session()
    
    return "Hello from fastapi"

@app.get("/id")
def greet():
    return 69

prod = [
    product(id=1, name= "Iphone 17",description= "Powerful", price= 999, quantity= 6),
    product(id=22, name="Iphone 17",description= "Powerful", price= 999, quantity= 6),
    product(id=30, name= "Iphone 17",description="Powerful", price= 999, quantity= 6),
]

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

def initdb():
    db = session()
    count = db.query(database_model.product).count()
    if count == 0:

        for p in prod:
            db.add(database_model.product(**p.model_dump()))
        db.commit()

initdb()

@app.get("/products")
def saman(db:Session = Depends(get_db)):
    db_product =db.query(database_model.product).all()
    return db_product

@app.get("/product/{id}")
def get_product_by_id(id:int, db:Session = Depends(get_db)):
    db_product = db.query(database_model.product).filter(database_model.product.id == id).first()
    if db_product:
        return db_product
    return "produnt not found.."

@app.post("/products")
def add_item(p:product,db:Session = Depends(get_db)):
    db_product = db.add(database_model.product(**p.model_dump()))
    db.commit()
    return "Product added sucessfuly.."

@app.delete("/products/{id}")
def delete_item(id:int,db:Session = Depends(get_db)):
    db_product = db.query(database_model.product).filter(database_model.product.id == id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
        return "Product deleted Successfully.."
    else:
        return "Product not found.."

@app.put("/products/{id}")
def update_item(id:int,product:product,db:Session = Depends(get_db)):
    db_product = db.query(database_model.product).filter(database_model.product.id == id).first()
    if db_product:
        db_product.name  = product.name
        db_product.description  = product.description
        db_product.price  = product.price
        db_product.quantity  = product.quantity
        db.commit()
    else:
        return "Product not found.."    

