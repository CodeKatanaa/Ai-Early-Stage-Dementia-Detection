# 🧠 AI Tool for Early Stage Dementia Detection

> An AI-powered web application that detects early signs of dementia through cognitive screening tests, scored by an ensemble machine learning model.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5.1-F7931E?logo=scikit-learn&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## ⚠️ Important Disclaimer
> **This tool is NOT a medical diagnosis system.**
> It does not diagnose, treat, or cure dementia or any other disease.
> Results are for **screening and awareness purposes only** and should never replace a professional medical consultation.
> If you or someone you know is experiencing cognitive difficulties, please consult a **qualified medical professional**.

## 📌 Overview
MindGuard screens users for early dementia indicators through a series of cognitive tasks — memory recall, clock drawing, math problems, shape recognition, and story comprehension. Responses are scored by a trained ensemble ML model (Random Forest + others) to produce a risk assessment.

## ✨ Features
- 🧪 6-variant cognitive screening test sets (randomized per session)
- 🤖 Ensemble ML model for dementia risk prediction
- 🎙️ Voice assistant for accessibility
- 📊 Dashboard with results history and visual reports
- 🎮 Brain training games (Chess, Sudoku, Duck game)
- 🔐 Auth system with protected routes
- 📄 PDF report generation

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| ML | scikit-learn, joblib, NumPy, pandas, librosa |
| Frontend | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Database | SQLite |
| State | TanStack Query, React Hook Form, Zod |

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
git clone https://github.com/CodeKatanaa/Ai-Early-Stage-Dementia-Detection.git
cd Ai-Early-Stage-Dementia-Detection
python -m venv venv
venv\Scripts\activate
pip install -r requirement.txt
python App.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5000` — Frontend on `http://localhost:5173`

## 📁 Project Structure
```
├── App.py                  # Flask backend & ML inference API
├── tr1.py                  # Model training script
├── ev1.py                  # Model evaluation script
├── ts1.py                  # Testing script
├── requirement.txt         # Python dependencies
├── models/
│   ├── ensemble_model.pkl  # Trained ensemble model
│   ├── random_forest.pkl   # Random forest model
│   ├── scaler.pkl          # Feature scaler
│   └── config.json         # Model config & thresholds
├── visuals/                # Training plots & metrics
├── csv files/              # Dataset files
├── datapreparation codes/  # Data preprocessing scripts
└── frontend/               # React + TypeScript frontend
    └── src/
        ├── pages/          # Route pages
        ├── components/     # Reusable UI components
        ├── services/       # API layer
        ├── contexts/       # Auth context
        └── hooks/          # Custom hooks
```

## 📊 ML Model Performance
Training visuals available in the `/visuals` folder:
- Model comparison
- Confusion matrices
- ROC curves
- Precision-recall curves
- Feature importance

## 🤝 Contributing
Pull requests are welcome! Please open an issue first for major changes.

## 📄 License
MIT © [CodeKatanaa](https://github.com/CodeKatanaa)
