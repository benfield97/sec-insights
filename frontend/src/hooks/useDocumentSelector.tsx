import { useState, useEffect } from "react";
import { SecDocument } from "~/types/document";
import useLocalStorage from "./utils/useLocalStorage";
import { backendClient } from "~/api/backend";

export const MAX_NUMBER_OF_SELECTED_DOCUMENTS = 10;

export const useDocumentSelector = () => {
  const [availableDocuments, setAvailableDocuments] = useState<SecDocument[]>([]);

  useEffect(() => {
    async function getDocuments() {
      const docs = await backendClient.fetchDocuments();
      setAvailableDocuments(docs);
    }
    getDocuments().catch(() => console.error("could not fetch documents"));
  }, []);

  const [selectedDocuments, setSelectedDocuments] = useLocalStorage<SecDocument[]>("selectedDocuments", []);

  const handleAddDocument = (documentId: string) => {
    setSelectedDocuments((prevDocs = []) => {
      if (prevDocs.find((doc) => doc.id === documentId)) {
        return prevDocs;
      }
      const newDoc = availableDocuments.find((doc) => doc.id === documentId);
      return newDoc ? [newDoc, ...prevDocs] : prevDocs;
    });
  };

  const handleRemoveDocument = (documentIndex: number) => {
    setSelectedDocuments((prevDocs) => prevDocs.filter((_, index) => index !== documentIndex));
  };

  const isDocumentSelectionEnabled = selectedDocuments.length < MAX_NUMBER_OF_SELECTED_DOCUMENTS;
  const isStartConversationButtonEnabled = selectedDocuments.length > 0;

  return {
    availableDocuments,
    selectedDocuments,
    handleAddDocument,
    handleRemoveDocument,
    setSelectedDocuments,
    isDocumentSelectionEnabled,
    isStartConversationButtonEnabled,
  };
};
