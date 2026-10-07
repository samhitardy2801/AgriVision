from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import json
import numpy as np

from PIL import Image
import io


# --------------------------------------------------
# Create FastAPI app
# --------------------------------------------------

app = FastAPI(title="AgriVision API")


# --------------------------------------------------
# Enable CORS for React frontend
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Load trained CNN model
# --------------------------------------------------

model = tf.keras.models.load_model("agrivision_cnn.keras")


# --------------------------------------------------
# Load class names
# --------------------------------------------------

with open("class_names.json", "r") as f:
    class_names = json.load(f)


# --------------------------------------------------
# Home / API status
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "AgriVision API is running!",
        "model_loaded": True,
        "number_of_classes": len(class_names)
    }


# --------------------------------------------------
# Disease prediction
# --------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read uploaded image
    image_data = await file.read()

    # Open image
    image = Image.open(io.BytesIO(image_data)).convert("RGB")

    # Resize to model input size
    image = image.resize((224, 224))

    # Convert image to NumPy array
    image_array = np.array(image)

    # Normalize pixel values
    image_array = image_array / 255.0

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # Make prediction
    predictions = model.predict(image_array, verbose=0)

    # Get predicted class
    predicted_index = np.argmax(predictions[0])
    predicted_class = class_names[predicted_index]

    # Get confidence
    confidence = float(predictions[0][predicted_index]) * 100

    # Return result
    return {
        "disease": predicted_class,
        "confidence": round(confidence, 2)
    }