// Import the base URL of the backend API from the config file
import { backendUrl } from "~/config";
// Import types for Message, BackendDocument, and SecDocument
import type { Message } from "~/types/conversation";
import type { BackendDocument } from "~/types/backend/document";
import { SecDocument } from "~/types/document";
// Import a utility function for converting backend document format to frontend format
import { fromBackendDocumentToFrontend } from "./utils/documents";

// Interfaces defining the structure of payloads used in the API
interface CreateConversationPayload {
  id: string;
}

interface GetConversationPayload {
  id: string;
  messages: Message[];
  documents: BackendDocument[];
}

interface GetConversationReturnType {
  messages: Message[];
  documents: SecDocument[];
}

// BackendClient class to interact with the backend API
class BackendClient {
  // Private method for performing GET requests
  private async get(endpoint: string) {
    const url = backendUrl + endpoint;
    const res = await fetch(url);

    // Throw an error if the response is not OK (200-299 status code)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }

  // Private method for performing POST requests
  private async post(endpoint: string, body?: any) {
    const url = backendUrl + endpoint;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Throw an error if the response is not OK
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }

  // Adjust the ingestPdf function to match the updated backend
  public async ingestPdf(url: string, name: string): Promise<string> {
    const endpoint = '/api/ingest-pdf';
    const payload = {
      url: url,
      name: name
    };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return 'File uploaded successfully';
    } else {
      const errorResponse = await res.json();
      throw new Error(`Upload failed with status: ${res.status} and message: ${errorResponse.detail}`);
    }
  }

  // Public method to create a new conversation
  public async createConversation(documentIds: string[]): Promise<string> {
    const endpoint = "api/conversation/";
    const payload = { document_ids: documentIds };
    const res = await this.post(endpoint, payload);
    const data = (await res.json()) as CreateConversationPayload;

    return data.id;
  }

  // Public method to fetch a specific conversation by ID
  public async fetchConversation(
    id: string
  ): Promise<GetConversationReturnType> {
    const endpoint = `api/conversation/${id}`;
    const res = await this.get(endpoint);
    const data = (await res.json()) as GetConversationPayload;

    return {
      messages: data.messages,
      documents: fromBackendDocumentToFrontend(data.documents),
    };
  }

  // Public method to fetch documents
  public async fetchDocuments(): Promise<SecDocument[]> {
    const endpoint = `api/document/`;
    const res = await this.get(endpoint);
    const data = (await res.json()) as BackendDocument[];
    const docs = fromBackendDocumentToFrontend(data);
    return docs;
  }
}

// Export an instance of BackendClient for use throughout the application
export const backendClient = new BackendClient();
