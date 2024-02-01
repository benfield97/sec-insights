
import { BackendDocument } from "~/types/backend/document";
import { SecDocument } from "~/types/document";
import { documentColors } from "~/utils/colors";
import _ from "lodash";

export const fromBackendDocumentToFrontend = (
  backendDocuments: BackendDocument[]
): SecDocument[] => {
  backendDocuments = _.sortBy(backendDocuments, 'created_at');
  
  return backendDocuments.map((backendDoc, index) => {
    const colorIndex = index % documentColors.length;
    const color = documentColors[colorIndex] || documentColors[0]; // Fallback to first color if undefined
    return {
      id: backendDoc.id,
      url: backendDoc.url,
      color: color, // Ensured color is never undefined
      metadata_map: backendDoc.metadata_map,
    };
  });
};
