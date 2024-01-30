import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Select from "react-select";
import { FiTrash2 } from "react-icons/fi";
import { useDocumentSelector } from "~/hooks/useDocumentSelector";
import { backendClient } from "~/api/backend";
import useIsMobile from "~/hooks/utils/useIsMobile";

export const TitleAndDropdown = () => {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  const {
    availableDocuments,
    selectedDocuments,
    setSelectedDocuments,
    handleRemoveDocument,
    isDocumentSelectionEnabled,
  } = useDocumentSelector();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoadingConversation(true);
    const selectedDocumentIds = selectedDocuments.map((doc) => doc.id);
    backendClient
      .createConversation(selectedDocumentIds)
      .then((newConversationId) => {
        setIsLoadingConversation(false);
        router.push(`/conversation/${newConversationId}`);
      })
      .catch(() => console.error("Error creating conversation"));
  };

  return (
    <div className="landing-page-gradient-1 relative flex h-max w-screen flex-col items-center font-lora">
      {/* Header section with title */}
      <div className="mt-28 flex flex-col items-center">
        <div className="text-center text-4xl">
          River Capital's <span className="font-bold">Company Oracle</span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="text-center font-nunito">
            Upload your documents to begin.
          </div>
        </div>
      </div>

      {/* Conditional rendering based on whether the device is mobile */}
      {isMobile ? (
        <div className="mt-12 flex h-1/5 w-11/12 rounded border p-4 text-center">
          <div className="text-xl font-bold">
            To start analyzing documents, please switch to a larger screen!
          </div>
        </div>
      ) : (
        <form className="mt-5 flex h-min w-11/12 max-w-[1200px] flex-col items-center justify-center rounded-lg border-2 bg-white sm:h-[400px] md:w-9/12" onSubmit={handleSubmit}>
          <div className="p-4 text-center text-xl font-bold">
            Start your conversation by selecting the documents you want to explore
          </div>

          {/* Document ID selection */}
          <div className="my-4">
          <Select
            options={availableDocuments.map((doc) => ({ value: doc.id, label: doc.id }))}
            onChange={(selectedOption) => {
              if (selectedOption) {
                const selectedDoc = availableDocuments.find(doc => doc.id === selectedOption.value);
                if (selectedDoc) {
                  setSelectedDocuments([selectedDoc]);
                }
              }
            }}
            placeholder="Select Document by ID"
            isDisabled={!isDocumentSelectionEnabled}
          />
          </div>

          {/* List of selected documents */}
          <div className="w-full px-4">
            {selectedDocuments.map((doc, index) => (
              <div key={doc.id} className="flex items-center justify-between border-b p-2">
                <span>{doc.id}</span>
                <button onClick={() => handleRemoveDocument(index)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Start conversation button */}
          <div className="mt-4">
            <button type="submit" className="rounded border bg-blue-500 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300" disabled={!selectedDocuments.length}>
              Start Conversation
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
