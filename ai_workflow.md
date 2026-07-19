# AI Workflow & Design Decisions

## End-to-End AI Workflow
1. **Contract Upload:** The process begins when the user uploads a `.pdf`, `.docx`, or `.txt` contract file on the frontend. The file is sent via an HTTP POST request to the `/api/contracts/upload` endpoint.
2. **Text Extraction:** Upon receiving the file, the backend saves it temporarily and uses `PyMuPDF` (for PDFs) or `python-docx` (for DOCX files) to extract the raw text, chunking it into logical pages.
3. **Prompt Generation:** The `ai_service.py` module compiles the extracted pages into a single payload, injecting page markers. It prepends a highly detailed system instruction (`EXTRACTION_SCHEMA_PROMPT`) containing a required JSON schema for the output.
4. **LLM Invocation:** A synchronous API request is made to OpenRouter. By default, the `tencent/hy3:free` model is used. If no API key is provided, the system gracefully falls back to a predefined mock analysis to ensure uninterrupted development.
5. **Response Parsing:** Since free models may not strictly adhere to JSON structures, the backend (`parse_model_json`) implements a robust regex-based extraction mechanism to pull JSON objects from markdown fences or surrounding prose.
6. **Result Delivery:** The parsed JSON data is mapped into SQLAlchemy models (Metadata, Clauses, Risks, Obligations, Executive Summary) and saved to the SQLite database. A success response is returned to the frontend.

## Design Decisions

- **Why FastAPI:** Chosen for its extremely high performance, async capabilities, and automatic OpenAPI schema generation. It pairs seamlessly with Pydantic for robust request validation and response serialization.
- **Why React & Vite:** React remains the industry standard for component-driven UIs. Vite provides unparalleled developer experience with instantaneous Hot Module Replacement (HMR) and rapid build times compared to Webpack or Create React App.
- **Why TanStack Router:** Unlike traditional routers, TanStack Router offers 100% type safety and file-based route generation. This eliminates broken links and ensures search parameters and loader dependencies are strictly typed.
- **Why React Query:** Managing complex server state on the frontend (like fetching the parsed contract and polling status) is handled effortlessly by React Query. It abstracts away caching, background refetching, and retry logic.
- **Why OpenRouter:** Serves as a unified API layer for LLMs. It allows seamless switching between models (e.g., from Claude to a free Tencent model) without changing the underlying API integration logic.
- **Why the selected free model:** `tencent/hy3:free` was selected for cost-efficiency during development. The backend is designed with robust parsing fallbacks because free models can sometimes fail to use explicit "JSON Mode" properly.
- **Error Handling Strategy:** The backend uses standard HTTP exceptions for file validation or AI analysis failures. The frontend utilizes React Hook Form's built-in error states combined with a global toast notification system to inform users when uploads fail.
- **JSON Parsing Strategy:** The backend does not blindly trust the LLM output. It uses regex ````json...```` extraction to tolerate models that wrap their responses in conversational prose.
- **Performance Considerations:** Uploads are streamed and saved in chunks to prevent server memory exhaustion.
- **Scalability Considerations:** Using SQLite is a deliberate choice for simplicity during early development. The use of SQLAlchemy ORM means migrating to a robust PostgreSQL database later will require virtually no changes to the application logic.
