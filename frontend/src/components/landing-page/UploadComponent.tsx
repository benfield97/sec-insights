import React, { useState } from 'react';
import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';

interface UploadComponentProps {
  options: any; // You can define a more specific type based on your needs
  onComplete?: (data: any) => void; // Updated to pass data to onComplete
  onUpdate?: (uploadedFiles: any) => void; // This can still be used for other update logic if needed
}

// Ensure to initialize the Uploader outside of the component to avoid re-creating it on every render
const uploader = Uploader({
  apiKey: 'public_kW15bts8apta6Q33kMrLiGYEgL5R',
});

const UploadComponent: React.FC<UploadComponentProps> = ({ options, onComplete, onUpdate }) => {
    const handleComplete = async (data: any) => {
        console.log('handleComplete called with data:', data);
        
        // Check if the data object has the expected structure and contains the fileUrl
        if (!data?.[0]?.fileUrl) {
            console.error('No fileUrl found in the complete data:', data);
            return; // Exit if fileUrl is not found
        }
        
        // Extract the fileUrl from the data object
        const fileUrl = data[0].fileUrl;
        console.log('File URL to be sent to the backend:', fileUrl);
        
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
        onUpdate={(data) => console.log('Upload in progress, data:', data)} // Optional: can log or handle progress updates
        onComplete={handleComplete}
        width="670px"
        height="250px"
        />
    </div>
    );
    };

export default UploadComponent;
