# ICP Extractor Service

Python backend that extracts Ideal Customer Profile data from company websites.

## Setup

```bash
cd icp-extractor
python -m venv venv
source venv/bin/activate   # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## Environment

Set `OPENAI_API_KEY` (required for GPT-4 analysis):

```bash
export OPENAI_API_KEY=sk-...
```

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or from project root:

```bash
npm run icp-extractor
```

## API

- `POST /extract-icp` — Body: `{"url": "https://clay.com"}` — Returns structured ICP
- `GET /health` — Health check
