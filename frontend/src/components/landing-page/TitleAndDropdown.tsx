import React, { useState } from "react";
import { useRouter } from "next/router";
import Select, { SingleValue } from "react-select";
import { FiTrash2 } from "react-icons/fi";
import { useDocumentSelector } from "~/hooks/useDocumentSelector";
import { backendClient } from "~/api/backend";
import useIsMobile from "~/hooks/utils/useIsMobile";
import UploadComponent from '~/components/landing-page/UploadComponent';

// Define the option type for your documents
interface DocumentOption {
  value: string;
  label: string;
}

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

  const options = {
    apiKey: process.env.NEXT_PUBLIC_BYTESCALE_API_KEY || 'free',
    maxFileCount: 1,
    editor: { images: { crop: false } },
    mimeTypes: ['application/pdf'],
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedDocuments.length > 0) {
      setIsLoadingConversation(true);
      const selectedDocumentIds = selectedDocuments.map((doc) => doc.id);
      backendClient
        .createConversation(selectedDocumentIds)
        .then((newConversationId) => {
          setIsLoadingConversation(false);
          router.push(`/conversation/${newConversationId}`);
        })
        .catch(() => {
          setIsLoadingConversation(false);
          console.error("Error creating conversation");
        });
    }
  };

  const handleDocumentSelection = (selectedOption: SingleValue<DocumentOption>) => {
    if (selectedOption) {
      const selectedDoc = availableDocuments.find(doc => doc.id === selectedOption.value);
      if (selectedDoc) {
        setSelectedDocuments([selectedDoc]);
      }
    } else {
      setSelectedDocuments([]);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-200 to-blue-100 p-8">
      {/* Header section with title */}
      <div className="mt-8 mb-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          River Capital's <span className="text-blue-600">Company Oracle</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Upload your documents to begin.
        </p>
      </div>

      {/* Upload Section */}
      {isMobile ? (
        <div className="mx-auto mt-12 w-11/12 rounded-lg border border-blue-300 bg-white p-6 text-center shadow-lg">
          <p className="text-xl font-semibold text-gray-800">
            To start analyzing documents, please switch to a larger screen!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-4xl rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-700">
            Start your conversation by selecting the documents you want to explore
          </h2>

          {/* Document Uploader */}
          <div className="mb-4">
            <UploadComponent
              options={options}
              onComplete={() => console.log('Upload complete')}
              onUpdate={(data) => console.log('Upload update', data)}
            />
          </div>

          {/* Document ID selection */}
          <div className="mb-6">
            <Select
              options={availableDocuments.map((doc) => ({ value: doc.id, label: doc.id }))}
              onChange={handleDocumentSelection}
              placeholder="Select Document by ID"
              isDisabled={!isDocumentSelectionEnabled}
              isClearable
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          {/* List of selected documents */}
          <div className="mb-6 w-full">
            {selectedDocuments.map((doc, index) => (
              <div key={doc.id} className="flex items-center justify-between rounded-md p-2 shadow">
                <span className="text-sm font-medium text-gray-700">{doc.id}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDocument(index)}
                  className="rounded-full p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Start conversation button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300"
              disabled={!selectedDocuments.length || isLoadingConversation}
            >
              {isLoadingConversation ? 'Starting...' : 'Start Conversation'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
