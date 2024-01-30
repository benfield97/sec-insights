import { MAX_NUMBER_OF_SELECTED_DOCUMENTS } from "~/hooks/useDocumentSelector";
import { BackendDocument, BackendDocumentType } from "~/types/backend/document";
import { SecDocument, DocumentType } from "~/types/document";
import { documentColors } from "~/utils/colors";
import _ from "lodash";

export const fromBackendDocumentToFrontend = (
  backendDocuments: BackendDocument[]
) => {
  // sort by created_at so that de-dupe filter later keeps oldest duplicate docs
  backendDocuments = _.sortBy(backendDocuments, 'created_at');
  let frontendDocs: SecDocument[] = backendDocuments.map((backendDoc, index) => {
    // we have 10 colors for 10 documents
    const colorIndex = index < 10 ? index : 0;
    return {
      id: backendDoc.id,
      url: backendDoc.url,
      color: documentColors[colorIndex],
    } as SecDocument;
  });

  return frontendDocs;
};
