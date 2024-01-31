import React, { useState } from 'react';
import { UploadDropzone } from 'react-uploader';
import { UrlBuilder } from '@bytescale/sdk';
import { Uploader } from 'uploader';

interface UploadComponentProps {
  options: any; // Define a more specific type based on your needs
  onComplete?: () => void;
  onUpdate?: (uploadedFiles: any) => void; // Define a more specific type
}

  // Configuration for the uploader

  const options = {
    apiKey: 'public_kW15bts8apta6Q33kMrLiGYEgL5R' || 'free',
    maxFileCount: 1,
    editor: { images: { crop: false } },
    mimeTypes: ['application/pdf'],
    showFinishButton: true,

  };
// Configuration for the uploader
const uploader = Uploader({
  apiKey: 'public_kW15bts8apta6Q33kMrLiGYEgL5R',
  // apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
  //   ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
  //   : 'no api key found',
});

const UploadComponent: React.FC<UploadComponentProps> = ({ options, onComplete, onUpdate }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleUpdate = async (data: any) => {
    console.log('handleUpdate called with data:', data);

    // Ensure that data contains uploadedFiles and it's not an empty array
    if (!data?.uploadedFiles?.length) {
      console.error('No files found in the update data:', data);
      return; // Exit if no files are found
    }

    const file = data.uploadedFiles[0];
    const fileUrl = file.fileUrl; // Use the fileUrl from the uploadedFiles object

    setName(file.originalFileName);
    setUrl(fileUrl);

    console.log('Preparing to send POST request with file URL:', fileUrl);

    // Replace 'http://0.0.0.0:8000' with your actual backend server address
    try {
      const response = await fetch('http://0.0.0.0:8000/api/document/ingest-pdf?url=' + encodeURIComponent(fileUrl), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Fetch called, awaiting response...');

      if (!response.ok) {
        console.error('POST request failed with status:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        const responseData = await response.json();
        console.log('POST request successful, data:', responseData);
        onUpdate && onUpdate(responseData);
      }
    } catch (error) {
      console.error('Error in fetch:', error);
    }
  };

  return (
    <div className="prose p-10 mt-20 mx-auto">
      <UploadDropzone
        uploader={uploader}
        options={options}
        onUpdate={handleUpdate}
        onComplete={onComplete}
        width="670px"
        height="250px"
      />
      {name && url && (
        <div className="mt-5">
          <div><b>Name:</b> {name}</div>
          <div><b>Link to PDF:</b> <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm">{url}</a></div>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;