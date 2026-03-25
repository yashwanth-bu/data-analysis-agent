# Data-Analysis-Agent

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Status](https://img.shields.io/badge/Status-Active-green)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)

<!-- ![License](https://img.shields.io/badge/License-MIT-lightgrey)
![Local](https://img.shields.io/badge/Run-Local-yellow) -->

---

## What it does

* Understands your dataset and suggests feature engineering tips.
* Finds patterns, correlations, anomalies, and important insights.
* Generates professional-looking charts and interactive graphs.
* Stores insights so you can ask questions or create more charts later.

---

## How to use

1. **Install dependencies**

```bash
git clone https://github.com/yashwanth-bu/data-analysis-agent.git
cd server
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

2. **Start the server**

```bash
python boot.py
```

It runs at `http://localhost:8000`.

3. **Upload a CSV dataset**

Send a CSV file to:

```
POST /api/upload-dataset
Form-Data:
- file: your_dataset.csv
```

You’ll get a confirmation with the dataset shape.

4. **Ask for charts**

Send a prompt to:

```
POST /api/visualize
JSON Body:
{
  "prompt": "Show price trends by number of floors"
}
```

Response includes:

* **insight** – textual summary of the chart
* **image_base64** – chart image encoded in Base64

---