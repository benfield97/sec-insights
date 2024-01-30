// UploadComponent.tsx
import React, { useState } from 'react';
import { UploadDropzone } from '@bytescale/upload-widget-react';
import { UrlBuilder } from '@bytescale/sdk';

interface UploadComponentProps {
  options: any; // Define a more specific type based on your needs
  onComplete?: () => void;
  onUpdate?: (uploadedFiles: any) => void; // Define a more specific type
}

const UploadComponent: React.FC<UploadComponentProps> = ({ options, onComplete, onUpdate }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleUpdate = (data: any) => { // Adjust the type based on actual data structure
    if (data.uploadedFiles.length !== 0) {
      const file = data.uploadedFiles[0];
      const fileName = file.originalFile.file.name;
      const fileUrl = UrlBuilder.url({
        accountId: file.accountId,
        filePath: file.filePath,
      });
      setName(fileName);
      setUrl(fileUrl);
    }
    onUpdate && onUpdate(data);
  };

  return (
    <div className="prose p-10 mt-20 mx-auto">
      <UploadDropzone
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