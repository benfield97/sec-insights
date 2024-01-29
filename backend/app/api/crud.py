from typing import Optional, cast, Sequence, List
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.db import Conversation, Message, Document, ConversationDocument
from app import schema
from sqlalchemy import select, delete
from sqlalchemy.dialects.postgresql import insert

# Function to fetch a conversation along with its messages and related documents.
async def fetch_conversation_with_messages(
    db: AsyncSession, conversation_id: str
) -> Optional[schema.Conversation]:
    """
    Fetch a conversation with its messages + messagesubprocesses
    return None if the conversation with the given id does not exist
    """
    # Eagerly load required relationships (messages and documents) for the conversation
    stmt = (
        select(Conversation)
        .options(joinedload(Conversation.messages).subqueryload(Message.sub_processes))
        .options(
            joinedload(Conversation.conversation_documents).subqueryload(
                ConversationDocument.document
            )
        )
        .where(Conversation.id == conversation_id)
    )

    result = await db.execute(stmt)  # Execute the query
    conversation = result.scalars().first()  # Retrieve the first result (the conversation)
    if conversation is not None:
        # Construct a dictionary with conversation data and documents
        convo_dict = {
            **conversation.__dict__,
            "documents": [
                convo_doc.document for convo_doc in conversation.conversation_documents
            ],
        }
        return schema.Conversation(**convo_dict)  # Convert the dict to a Conversation object
    return None  # Return None if the conversation doesn't exist

# Function to create a new conversation in the database.
async def create_conversation(
    db: AsyncSession, convo_payload: schema.ConversationCreate
) -> schema.Conversation:
    conversation = Conversation()  # Instantiate a new Conversation object
    # Create ConversationDocument objects for each document in the conversation
    convo_doc_db_objects = [
        ConversationDocument(document_id=doc_id, conversation=conversation)
        for doc_id in convo_payload.document_ids
    ]
    db.add(conversation)  # Add the new conversation to the session
    db.add_all(convo_doc_db_objects)  # Add all related documents to the session
    await db.commit()  # Commit the transaction
    await db.refresh(conversation)  # Refresh to get the new conversation ID
    return await fetch_conversation_with_messages(db, conversation.id)  # Return the created conversation

# Function to delete a conversation from the database.
async def delete_conversation(db: AsyncSession, conversation_id: str) -> bool:
    stmt = delete(Conversation).where(Conversation.id == conversation_id)  # Prepare delete statement
    result = await db.execute(stmt)  # Execute the delete operation
    await db.commit()  # Commit the transaction
    return result.rowcount > 0  # Return True if any rows were deleted, otherwise False

# Function to fetch a message and its sub-processes from the database.
async def fetch_message_with_sub_processes(
    db: AsyncSession, message_id: str
) -> Optional[schema.Message]:
    # Prepare a select statement to fetch the message and its sub-processes
    stmt = (
        select(Message)
        .options(joinedload(Message.sub_processes))
        .where(Message.id == message_id)
    )
    result = await db.execute(stmt)  # Execute the query
    message = result.scalars().first()  # Get the first result (the message)
    if message is not None:
        return schema.Message.from_orm(message)  # Convert the ORM object to a Message schema object
    return None  # Return None if the message doesn't exist

# Function to fetch documents based on various criteria.
async def fetch_documents(
    db: AsyncSession,
    id: Optional[str] = None,
    ids: Optional[List[str]] = None,
    url: Optional[str] = None,
    limit: Optional[int] = None,
) -> Optional[Sequence[schema.Document]]:
    """
    Fetch a document by its url or id
    """
    stmt = select(Document)  # Start with a basic select statement for documents
    # Add conditions to the statement based on provided arguments
    if id is not None:
        stmt = stmt.where(Document.id == id)
        limit = 1  # Set limit to 1 if a specific ID is provided
    elif ids is not None:
        stmt = stmt.where(Document.id.in_(ids))  # Fetch documents with IDs in the provided list
    if url is not None:
        stmt = stmt.where(Document.url == url)  # Fetch documents with the provided URL
    if limit is not None:
        stmt = stmt.limit(limit)  # Limit the number of results if a limit is provided
    result = await db.execute(stmt) 