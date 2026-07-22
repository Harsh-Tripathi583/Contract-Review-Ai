# Contract Insight Hub

## Project Overview
Contract Insight Hub is a modern full-stack web application designed for intelligent contract analysis. It allows users to upload contracts (PDF, DOCX, TXT), extracts text from them, and uses an LLM (Large Language Model) via OpenRouter to automatically parse metadata, extract key clauses, identify risks, and list obligations.

## Features
- **Contract Upload:** Drag-and-drop interface for uploading `.pdf`, `.docx`, and `.txt` files.
- **AI-Powered Extraction:** Automatically extracts contract metadata, clauses, risks, and obligations using an LLM.
- **Risk Analysis:** Highlights critical, high, medium, and low risks with actionable recommendations.
- **Interactive Dashboard:** View the parsed contract data organized into an intuitive user interface.
- **Local Database:** Uses SQLite to store uploaded contracts and analysis results for later review.

## Tech Stack
### Frontend
- **React 19** with **TypeScript**
- **Vite** for rapid development and building
- **TanStack Router** for type-safe routing
- **TanStack Query** for server state management and data fetching
- **Tailwind CSS** & **Radix UI** for styling and accessible components

### Backend
- **Python** with **FastAPI**
- **SQLAlchemy** (ORM) & **SQLite** (Database)
- **PyMuPDF** & **python-docx** for document parsing
- **OpenRouter API** for AI integration

## Folder Structure
```text
contract-insight-hub-main/
├── backend/                  # FastAPI backend application
│   ├── main.py               # Main API routes
│   ├── ai_service.py         # OpenRouter LLM integration
│   ├── parser.py             # PDF and DOCX extraction logic
│   ├── models.py             # SQLAlchemy database models
│   ├── schemas.py            # Pydantic validation schemas
│   ├── database.py           # SQLite connection setup
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Example environment variables
├── src/                      # React frontend application
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks (e.g., React Query)
│   ├── lib/                  # Utilities and API client
│   ├── routes/               # TanStack Router page routes
│   ├── router.tsx            # Router configuration
│   ├── main.tsx              # Application entry point
│   └── styles.css            # Global CSS and Tailwind directives
├── package.json              # Frontend dependencies and scripts
└── vite.config.ts            # Vite configuration
```

## Prerequisites
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)
- **Python** (3.9 or higher)

## Environment Variable Setup
**API keys are intentionally excluded from this repository.** Before running the project, you must set up your environment variables based on the provided `.env.example` files.



1. **Backend:**
   Copy `backend/.env.example` to `backend/.env` and add your OpenRouter API key.
   ```bash
   cd backend
   cp .env.example .env
   ```
   *Note: If `OPENROUTER_API_KEY` is omitted, the backend will gracefully fall back to mock data analysis for testing purposes.*

## Frontend Installation & Running
1. Install dependencies from the project root:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:8080`.

## Backend Installation & Running
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   - **Windows:**
     ```bash
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will run on `http://127.0.0.1:8000`. You can view the API documentation at `http://127.0.0.1:8000/docs`.

## Build Instructions
To build the frontend for production, run the following command from the project root:
```bash
npm run build
```

## Troubleshooting
- **Backend Port Conflicts:** If port 8000 is in use, start the backend on a different port using `uvicorn main:app --port 8001`.
- **Frontend Port Conflicts:** Vite will automatically try another port (e.g., 8081) if 8080 is in use. Check the terminal output for the correct local URL.
- **Missing API Key:** If the AI analysis is failing or returning mock data unexpectedly, ensure your `backend/.env` contains a valid `OPENROUTER_API_KEY`.
