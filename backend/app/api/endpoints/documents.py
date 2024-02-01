from typing import List, Optional
import logging
from fastapi import Depends, APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.deps import get_db
from app.api import crud
from app import schema

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def get_documents(
    document_ids: Optional[List[UUID]] = Query(None),
    db: AsyncSession = Depends(get_db),
) -> List[schema.Document]:
    """
    Get all documents or documents by their ids
    """
    if document_ids is None:
        # If no ids provided, fetch all documents
        docs = await crud.fetch_documents(db)
    else:
        # If ids are provided, fetch documents by ids
        docs = await crud.fetch_documents(db, ids=document_ids)

    if len(docs) == 0:
        raise HTTPException(status_code=404, detail="Document(s) not found")

    return docs


@router.get("/{document_id}")
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> schema.Document:
    """
    Get all documents
    """
    docs = await crud.fetch_documents(db, id=document_id)
    if len(docs) == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return docs[0]

# Update the endpoint to use the Pydantic model
@router.post("/ingest-pdf", response_model=schema.Document)
async def ingest_pdf(
    document_ingestion: schema.DocumentIngestion, 
    db: AsyncSession = Depends(get_db)
) -> schema.Document:
    """
    Ingest a PDF document by URL and name.
    """
    if not document_ingestion.url.startswith('http'):
        raise HTTPException(status_code=400, detail="URL must be an HTTP-based URL")

    metadata_map = {"name": document_ingestion.name}
    doc = schema.Document(url=document_ingestion.url, metadata_map=metadata_map)

    try:
        upserted_document = await crud.upsert_document_by_url(db, doc)
        return upserted_document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


