# Hotel Management System Backend

This is the Python FastAPI backend for the HMS application.

## Prerequisites

- Python 3.10+
- pip

## Setup

1. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the interactive development server:

```bash
python run.py
```

The server will start at `http://127.0.0.1:8000`.
API Documentation is available at `http://127.0.0.1:8000/docs`.

## Integration with Frontend

The frontend (Next.js) will make requests to `http://localhost:8000` (or configured API URL).
Ensure the frontend is configured with the correct `NEXT_PUBLIC_API_URL`.
