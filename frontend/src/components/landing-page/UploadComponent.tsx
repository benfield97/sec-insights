import React from 'react';
import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';

interface UploadComponentProps {
  options: any; // You should define a more specific type based on your needs
  onComplete?: (responseData: any) => void; // Adjusted to pass responseData to onComplete
  onUpdate?: (uploadedFiles: any) => void; // This can still be used for other update logic if needed
}

const uploader = Uploader({
  apiKey: 'public_kW15bts8apta6Q33kMrLiGYEgL5R',
});

const UploadComponent: React.FC<UploadComponentProps> = ({ options, onComplete, onUpdate }) => {
    const handleComplete = async (data: any) => {
        console.log('handleComplete called with data:', data);
      
        // Assuming data is an array and accessing the first item
        if (data.length !== 0 && data[0].fileUrl && (data[0].originalFile?.originalFileName || data[0].filePath)) {
          const fileUrl = data[0].fileUrl;
          const originalFileName = data[0].originalFile?.originalFileName || data[0].filePath;
          console.log(`File URL: ${fileUrl}, Original file name: ${originalFileName}`);
      
          // Construct the payload with the required fields
          const payload = JSON.stringify({
            url: fileUrl,
            name: originalFileName
          });
      
          try {
            // Send the POST request to the backend endpoint
            const response = await fetch('http://0.0.0.0:8000/api/document/ingest-pdf', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: payload
            });
      
            console.log('Fetch called, awaiting response...');
      
            if (!response.ok) {
              const errorResponse = await response.json();
              console.error('POST request failed with status:', response.status, 'and message:', JSON.stringify(errorResponse));
              throw new Error(`HTTP error! status: ${response.status} and message: ${JSON.stringify(errorResponse)}`);
            } else {
              const responseData = await response.json();
              console.log('POST request successful, data:', responseData);
              // Assuming responseData contains the new document in the format expected by SecDocument
              if (onComplete) {
                onComplete(responseData); // This is the correct place for calling onComplete
              }
            }
          } catch (error) {
            console.error('Error in fetch:', error);
          }
        } else {
          console.error('No fileUrl or originalFileName found in the complete data:', data);
        }
    };

  return (
    <div className="w-2/3">
      <UploadDropzone
        uploader={uploader}
        options={options}
        onUpdate={onUpdate} // Propagate the onUpdate prop
        onComplete={handleComplete} // Use the handleComplete function
        width="670px"
        height="250px"
      />
    </div>
  );
};

export default UploadComponent;
