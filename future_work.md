# Assumptions, Limitations & Future Enhancements

## Assumptions
- **Language:** The current AI extraction prompt assumes the contract is primarily in English.
- **Size:** The system assumes the entire contract text can fit within the context window of the selected LLM (`MAX_ANALYSIS_CHARS` is currently set to 200,000 characters).
- **Format:** The application assumes uploaded documents are text-searchable. It does not perform Optical Character Recognition (OCR) on flattened, image-only PDFs.

## Limitations & Known Issues
- **Free Model Constraints:** The default `tencent/hy3:free` model may struggle with complex legal reasoning or occasionally hallucinate clauses due to its limited parameter count compared to premium models like GPT-4 or Claude 3.5 Sonnet.
- **Synchronous Uploads:** The current `/api/contracts/upload` endpoint processes the AI analysis synchronously. This blocks the HTTP request and risks timing out for very large contracts or if the OpenRouter API is slow.
- **Local SQLite:** While great for development, SQLite is not suitable for high-concurrency production environments.
- **Lack of Authentication:** Currently, the system has no user authentication or authorization. Any user with access to the UI can view all uploaded contracts.

## Security Considerations
- **Data Privacy:** Contracts often contain highly sensitive legal information. Sending this text to a third-party LLM via OpenRouter must be evaluated against corporate data privacy policies.
- **File Upload Vulnerabilities:** While extensions are checked, deeper content validation and malware scanning on uploaded files are not currently implemented.

## Future Enhancements
If additional development time were available, the following practical improvements should be prioritized:

- **Asynchronous Processing Pipeline:** Move the LLM extraction to a background worker (e.g., Celery or RQ) and implement WebSockets or polling on the frontend to prevent HTTP timeouts.
- **OCR for Scanned PDFs:** Integrate Tesseract or AWS Textract to support analyzing image-based, scanned contracts.
- **Multi-Language Contracts:** Update the LLM prompt to automatically detect and translate non-English contracts, providing a localized summary.
- **Better AI Model Fallback:** Implement a dynamic fallback chain. If OpenRouter fails or the model returns malformed JSON, automatically retry with a different provider or model before failing.
- **Database Persistence & Migrations:** Migrate from SQLite to PostgreSQL and implement Alembic for database migrations.
- **User Authentication:** Integrate OAuth2 (e.g., Auth0 or NextAuth) to restrict access and allow users to maintain private contract repositories.
- **Contract Comparison:** Introduce a feature to upload a modified version of a contract and have the AI highlight changes and new risks (redlining).
- **Clause Highlighting:** Enhance the UI to link directly from an extracted risk or obligation to the exact highlighted text in the original PDF using a PDF viewer component.
- **Human Review Workflow:** Add capabilities for legal teams to override AI verdicts, leave comments on specific clauses, and mark risks as "Accepted" or "Mitigated".
- **Export Reports:** Allow users to export the executive summary and risk profile to PDF or Excel for external sharing.
- **Audit Logging Improvements:** Expand the current rudimentary audit logging to track every user interaction, field edit, and status change for compliance purposes.
- **Performance Optimizations:** Implement Redis for caching frequently accessed contracts and optimizing React Query stale times to reduce backend load.
