import io
import re

import pdfplumber

TWO_DATES_PATTERN = re.compile(r"^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+")
DATE_PATTERN = re.compile(r"^(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s+")
AMOUNT_PATTERN = re.compile(r"(-?\d[\d,]*\.\d{2})")

IGNORED_KEYWORDS = (
    "account summary",
    "summary",
    "subtotal",
    "total",
    "balance brought forward",
    "balance carried forward",
)


class PDFService:
    @staticmethod
    def extract_transactions_from_pdf(file_bytes: bytes) -> list[dict]:
        all_lines: list[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                lines = [line.strip() for line in text.splitlines() if line.strip()]
                all_lines.extend(lines)

        return parse_transaction_lines(all_lines)


def parse_transaction_lines(lines: list[str]) -> list[dict]:
    transactions: list[dict] = []

    for raw_line in lines:
        line = " ".join(raw_line.split())
        lowered = line.lower()

        if _is_ignored_line(lowered):
            continue

        if " cr" in lowered or lowered.endswith("cr"):
            continue

        # Try to match two dates (Post Date + Trans Date)
        two_dates_match = TWO_DATES_PATTERN.match(line)
        if two_dates_match:
            post_date = two_dates_match.group(1)
            trans_date = two_dates_match.group(2)
            description_start = two_dates_match.end()
        else:
            # Fall back to single date
            date_match = DATE_PATTERN.match(line)
            if not date_match:
                continue
            trans_date = date_match.group(1)
            post_date = None
            description_start = date_match.end()

        amount_matches = AMOUNT_PATTERN.findall(line)
        if not amount_matches:
            continue

        amount_str = amount_matches[-1].replace(",", "")
        try:
            amount = float(amount_str)
        except ValueError:
            continue

        if amount <= 0:
            continue

        description_with_amount = line[description_start:].strip()
        description = re.sub(rf"{re.escape(amount_matches[-1])}\s*(MYR|RM)?$", "", description_with_amount, flags=re.IGNORECASE).strip()

        if not description:
            continue

        transactions.append(
            {
                "post_date": post_date,
                "trans_date": trans_date,
                "description": description,
                "amount": amount,
            }
        )

    return transactions


def _is_ignored_line(line: str) -> bool:
    return any(keyword in line for keyword in IGNORED_KEYWORDS)
