import os
import json
import requests
from typing import List, Dict, Any

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")

# Schema structure to guide the model.
EXTRACTION_SCHEMA_PROMPT = """
Analyze the contract text page by page and extract the following information. Return ONLY a valid JSON object matching this schema. Do not wrap in markdown ```json blocks, just return raw JSON text.

{
  "metadata": {
    "title": "Document Title",
    "agreement_type": "e.g., Master Services, NDA, SLA, Lease, etc.",
    "effective_date": "YYYY-MM-DD or 'Omitted'",
    "expiration_date": "YYYY-MM-DD, 'Auto-renew', or 'Omitted'",
    "payment_terms": "e.g., Net 30, upon receipt, etc. Omitted if not found.",
    "termination_conditions": "Summary of how the contract can be terminated.",
    "contract_value": 120000.00, // numerical value, 0 if not specified
    "currency": "e.g., USD, EUR, etc. Omitted if not specified",
    "governing_law": "Jurisdiction governing the contract (e.g. Delaware, New York). Omitted if not specified.",
    "parties": [
      {
        "id": "p-1",
        "name": "Full legal name of the party",
        "role": "e.g., Provider, Customer, Landlord, Tenant",
        "jurisdiction": "State/Country of incorporation (if mentioned)"
      }
    ]
  },
  "clauses": [
    {
      "id": "cl-1",
      "title": "e.g., Limitation of Liability, Indemnification, Term",
      "section": "e.g., Section 12.2, Clause 5",
      "text": "Exact text or closely paraphrased key passage from the contract",
      "page": 1, // page number (1-indexed) where this was found
      "category": "e.g., liability, termination, ip, warranty",
      "confidence": 0.95 // value between 0.0 and 1.0
    }
  ],
  "risks": [
    {
      "id": "r-1",
      "title": "Short title of the risk (e.g., Unlimited Liability)",
      "description": "Explanation of why this is a risk",
      "severity": "critical | high | medium | low",
      "category": "legal | commercial | operational | compliance",
      "reasoning": "Why this category/severity was selected based on contract text",
      "recommendation": "Actionable advice to mitigate this risk",
      "page": 1, // page number or "Entire Doc"
      "confidence": 0.90
    }
  ],
  "obligations": [
    {
      "id": "o-1",
      "party": "Name of the party responsible",
      "description": "What they must do",
      "due_date": "YYYY-MM-DD or 'Recurring' or 'Within 30 days of invoice'",
      "status": "pending | recurring | one-time",
      "clause_ref": "e.g. Section 4.2"
    }
  ],
  "summary": {
    "headline": "A one-sentence overall verdict on the risk level",
    "key_points": [
      "Key takeaway 1 (e.g., Net payment is 45 days instead of standard 30)",
      "Key takeaway 2",
      "Key takeaway 3"
    ],
    "overall_risk_score": 65, // Integer between 0 and 100
    "ai_confidence": 92, // Integer between 0 and 100
    "recommendation": "Executive summary recommendation (e.g., Send to legal to insert liability cap)"
  },
  "confidence": {
    "overall": 0.92,
    "extraction": 0.94,
    "risk_detection": 0.90
  }
}
"""

def extract_contract_data(pages_text: List[str], file_name: str) -> Dict[str, Any]:
    from dotenv import load_dotenv
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
    load_dotenv(dotenv_path=dotenv_path, override=True)
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    model = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
    
    if not api_key or api_key == "your_openrouter_api_key_here":
        print("WARNING: OPENROUTER_API_KEY environment variable is not set or has placeholder value. Falling back to mock contract analysis.")
        return {
            "metadata": {
                "title": f"Mock Analysis: {file_name}",
                "agreement_type": "Master Services Agreement (Mocked)",
                "effective_date": "2023-10-15",
                "expiration_date": "2024-10-15",
                "payment_terms": "Net 30 from invoice date",
                "termination_conditions": "Auto-renews for successive 12 month periods unless 90 days written notice.",
                "contract_value": 120000.00,
                "currency": "USD",
                "governing_law": "Delaware",
                "parties": [
                    { "id": "p-1", "name": "Acme Corp (Mock Provider)", "role": "Provider", "jurisdiction": "Delaware" },
                    { "id": "p-2", "name": "Globex Inc. (Mock Customer)", "role": "Customer", "jurisdiction": "California" }
                ]
            },
            "clauses": [
                {
                    "id": "cl-1",
                    "title": "Term and Termination",
                    "section": "5",
                    "text": "This Agreement shall commence on the Effective Date and continue for an initial period of twelve (12) months.",
                    "page": 1,
                    "category": "termination",
                    "confidence": 0.98
                },
                {
                    "id": "cl-2",
                    "title": "Automatic Renewal",
                    "section": "5.3",
                    "text": "This Agreement shall automatically renew for successive twelve (12) month periods unless either party provides written notice of non-renewal at least ninety (90) days prior to the expiration.",
                    "page": 1,
                    "category": "termination",
                    "confidence": 0.99
                },
                {
                    "id": "cl-3",
                    "title": "Limitation of Liability",
                    "section": "12.2",
                    "text": "The total aggregate liability of Client shall not exceed the amounts paid under this Agreement. Provider liability remains uncapped for indirect damages.",
                    "page": 2,
                    "category": "liability",
                    "confidence": 0.94
                }
            ],
            "risks": [
                {
                    "id": "r-1",
                    "title": "Unlimited Liability Clause",
                    "description": "The vendor has not capped liability for indirect damages.",
                    "severity": "critical",
                    "category": "legal",
                    "reasoning": "Section 12.2 lacks standard 'Aggregate Liability' carve-outs. High financial exposure in case of breach.",
                    "recommendation": "Negotiate a cap at 2x annual contract value.",
                    "page": 2,
                    "confidence": 0.94
                },
                {
                    "id": "r-2",
                    "title": "Automatic Renewal",
                    "description": "Contract renews for 12 months unless 90-day notice is given.",
                    "severity": "medium",
                    "category": "operational",
                    "reasoning": "Detected in Section 5.3 'Term and Termination'. Standard risk for unintended continuation.",
                    "recommendation": "Set a calendar reminder or move to explicit renewal.",
                    "page": 1,
                    "confidence": 0.99
                },
                {
                    "id": "r-3",
                    "title": "Missing Governing Law",
                    "description": "The document does not explicitly state the jurisdiction governing this agreement.",
                    "severity": "low",
                    "category": "compliance",
                    "reasoning": "Absence detected in Section 15 General Provisions. May lead to jurisdictional disputes.",
                    "recommendation": "Insert standard governing law clause (e.g., Delaware or New York).",
                    "page": "Entire Doc",
                    "confidence": 0.88
                }
            ],
            "obligations": [
                {
                    "id": "o-1",
                    "party": "Customer",
                    "description": "Pay invoices within 30 days of issuance.",
                    "due_date": "Recurring",
                    "status": "recurring",
                    "clause_ref": "3.1"
                },
                {
                    "id": "o-2",
                    "party": "Provider",
                    "description": "Maintain 99.9% uptime SLA.",
                    "due_date": "Recurring",
                    "status": "recurring",
                    "clause_ref": "4.2"
                },
                {
                    "id": "o-3",
                    "party": "Customer",
                    "description": "Provide written notice 90 days prior to non-renewal.",
                    "due_date": "2024-07-15",
                    "status": "one-time",
                    "clause_ref": "5.3"
                }
            ],
            "summary": {
                "headline": "Medium overall risk. Legal review recommended before signature (MOCK DATA).",
                "key_points": [
                    "Uncapped indirect liability for Provider — critical exposure.",
                    "Automatic 12-month renewal with 90-day notice — operational risk.",
                    "Governing law omitted — jurisdictional ambiguity."
                ],
                "overall_risk_score": 65,
                "ai_confidence": 92,
                "recommendation": "Route to Legal for liability cap negotiation before executing. Please set OPENROUTER_API_KEY env variable for real AI analysis."
            },
            "confidence": {
                "overall": 0.92,
                "extraction": 0.95,
                "risk_detection": 0.89
            }
        }

    # Combine pages with clear page markers so the LLM knows the page numbers
    max_analysis_chars = int(os.getenv("MAX_ANALYSIS_CHARS", "200000"))
    full_text_with_markers = ""
    for idx, page in enumerate(pages_text):
        page_marker = f"\n--- PAGE {idx + 1} ---\n"
        remaining = max_analysis_chars - len(full_text_with_markers) - len(page_marker)
        if remaining <= 0:
            break
        full_text_with_markers += f"{page_marker}{page[:remaining]}\n"

    system_prompt = "You are an advanced AI specializing in contract analysis, risk assessment, and legal extraction."
    user_prompt = f"""
Analyze the contract: "{file_name}"
Contract Text:
{full_text_with_markers}

{EXTRACTION_SCHEMA_PROMPT}
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Contract Insight Hub"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"}
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=float(os.getenv("OPENROUTER_TIMEOUT_SECONDS", "90")),
    )

    # If the model does not support json_object, retry without response_format
    if response.status_code == 400 and ("json_object" in response.text or "response_format" in response.text):
        print(f"Model {model} does not support json_object response format. Retrying without it...")
        payload.pop("response_format", None)
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=float(os.getenv("OPENROUTER_TIMEOUT_SECONDS", "90")),
        )

    if response.status_code != 200:
        raise Exception(f"OpenRouter API request failed: {response.text}")

    response_json = response.json()
    try:
        content = response_json["choices"][0]["message"]["content"]
        # In case the model wrapped it in markdown code blocks:
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```json"):
                content = "\n".join(lines[1:-1])
            elif lines[0].startswith("```"):
                content = "\n".join(lines[1:-1])
        data = json.loads(content)
        return data
    except (KeyError, json.JSONDecodeError) as e:
        raise Exception(f"Failed to parse LLM response as JSON: {e}. Raw response: {content}")
