
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const FileUploader = ({ onDataParsed }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateData = (data) => {
    const requiredColumns = ['name', 'email', 'nric_number', 'phone', 'keyskilllist'];
    
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No data found in the uploaded file');
      return false;
    }
    
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const parseExcelFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header mapping
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (validateData(jsonData)) {
          onDataParsed(jsonData, file.name);
          toast.success(`Processed ${jsonData.length} rows from ${file.name}`);
        } else {
          setFile(null);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file. Please check the file format.');
        setFile(null);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
      setFile(null);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (handleFile(selectedFile)) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    if (!selectedFile.name.endsWith('.xlsx')) {
      toast.error('Please upload an Excel (.xlsx) file');
      return false;
    }
    
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (handleFile(droppedFile)) {
      setFile(droppedFile);
      parseExcelFile(droppedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    onDataParsed([], '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Participant Data</h2>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-gray-600 mb-2">Drag & drop an Excel (.xlsx) file here</p>
          <p className="text-gray-500 text-sm">or click to browse files</p>
          <p className="text-gray-400 text-xs mt-2">
            File must contain columns: name, email, nric_number, phone, keyskilllist
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-8 h-8 text-blue-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-red-600 hover:text-red-800 focus:outline-none"
              title="Remove file"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
