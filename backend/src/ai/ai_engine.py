import json
import random
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Amazon Resell AI Vision Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_video(
    video: UploadFile = File(...),
    orderId: str = Form(...),
    brand: str = Form(...),
    model: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    simulateMismatch: str = Form("false"),
    functionalChecks: str = Form("{}")
):
    # Simulation of OpenCV-based visual matching
    product_match_score = 96
    detected_brand = brand
    detected_model = model
    detected_category = category
    detected_color = color

    # If mismatch simulation is triggered, return conflicting attributes
    if simulateMismatch == "true":
        product_match_score = 12
        detected_brand = "Apple"
        detected_model = "iPhone 14"
        detected_category = "Electronics"
        detected_color = "Blue"

    # Cosmetic inspections simulation
    reports = [
        {"category": "Excellent", "score": 88, "issues": ["Minor light scratches on frame", "No glass cracks", "Ports clean"]},
        {"category": "Like New", "score": 96, "issues": ["Pristine display condition", "Zero visible scratches", "Ports clean"]},
        {"category": "Good", "score": 82, "issues": ["Moderate scuffs on corners", "Back panel wear", "No structural cracks"]}
    ]
    report = random.choice(reports)

    # Parse functional checks to adjust condition
    func_score = 100
    try:
        checks = json.loads(functionalChecks)
        if checks and len(checks) > 0:
            passed = len([k for k, v in checks.items() if v is True])
            func_score = int((passed / len(checks)) * 100)
    except Exception:
        pass

    if func_score < 100 and category != "Furniture":
        report = {
            "category": "Fair",
            "score": int(func_score * 0.8),
            "issues": ["Failed component checks", "Moderate physical scuffs", "Light casing wear"]
        }

    return {
        "productMatchScore": product_match_score,
        "expectedAttributes": {
            "brand": brand,
            "model": model,
            "category": category,
            "color": color
        },
        "detectedAttributes": {
            "brand": detected_brand,
            "model": detected_model,
            "category": detected_category,
            "color": detected_color
        },
        "conditionCategory": report["category"],
        "conditionScore": report["score"],
        "detectedIssues": report["issues"]
    }

if __name__ == "__main__":
    import uvicorn
    print("[AI Engine] Launching FastAPI Visual Engine on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
