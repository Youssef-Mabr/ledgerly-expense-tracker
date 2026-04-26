from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.services.pdf_service import PDFService

router = APIRouter(tags=["pdf"])


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type not in {"application/pdf", "application/octet-stream"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Please upload a PDF file.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        rows = PDFService.extract_transactions_from_pdf(file_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to parse PDF: {exc}",
        ) from exc

    return {"rows": rows}
