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
const uploader = Uploader({
  apiKey: 'public_kW15bts8apta6Q33kMrLiGYEgL5R'
  // apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
  //   ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
  //   : 'no api key found',
});

const UploadComponent: React.FC<UploadComponentProps> = ({ options, onComplete, onUpdate }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleUpdate = async (data: any) => {
    if (data && data.uploadedFiles && data.uploadedFiles.length !== 0) {
      const file = data.uploadedFiles[0];
      const fileName = file.originalFile.file.name;
      const fileUrl = UrlBuilder.url({
        accountId: file.accountId,
        filePath: file.filePath,
      });
      setName(fileName);
      setUrl(fileUrl);

      const queryParams = new URLSearchParams({ url: fileUrl }).toString();

      try {
        const response = await fetch(`http://0.0.0.0:8000/api/document/ingest-pdf?${queryParams}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to upload the file URL, status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('File URL uploaded successfully:', responseData);
      } catch (error) {
        console.error('Error uploading file URL:', error);
      }
    }
    onUpdate && onUpdate(data);
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
          <div><b>Link to PDF:</b> <a href={url} className="text-sm">{url}</a></div>
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
