
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Button } from './ui/button';

const FileUploader = ({ onDataParsed }) => {
  const [files, setFiles] = useState([]);
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
    return new Promise((resolve, reject) => {
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
            resolve(jsonData);
          } else {
            reject(new Error('Invalid data format'));
          }
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const processFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (!file.name.endsWith('.xlsx')) {
        toast.error(`${file.name}: Please upload Excel (.xlsx) files only`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Check for duplicate files
    const newFileNames = validFiles.map(file => file.name);
    const existingFileNames = files.map(file => file.name);
    const duplicateFiles = newFileNames.filter(name => existingFileNames.includes(name));
    
    if (duplicateFiles.length > 0) {
      toast.warning(`Skipped duplicate file(s): ${duplicateFiles.join(', ')}`);
    }
    
    // Process only new files
    const uniqueFiles = validFiles.filter(file => !existingFileNames.includes(file.name));
    
    if (uniqueFiles.length === 0) return;
    
    let allData = [];
    const processedFiles = [];
    const failedFiles = [];
    
    for (const file of uniqueFiles) {
      try {
        const data = await parseExcelFile(file);
        allData = [...allData, ...data];
        processedFiles.push(file);
      } catch (error) {
        failedFiles.push(file.name);
      }
    }
    
    if (processedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...processedFiles]);
      
      // Combine with data from previously uploaded files
      const combinedData = [...allData];
      onDataParsed(combinedData, processedFiles.map(f => f.name).join(', '));
      
      toast.success(`Processed ${processedFiles.length} file(s) with ${allData.length} rows total`);
    }
    
    if (failedFiles.length > 0) {
      toast.error(`Failed to process: ${failedFiles.join(', ')}`);
    }
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
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
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (indexToRemove) => {
    // Remove the file from the list
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    
    if (updatedFiles.length === 0) {
      // If all files removed, clear data
      onDataParsed([], '');
      return;
    }
    
    // Re-parse all remaining files
    const reprocessFiles = async () => {
      let allData = [];
      
      for (const file of updatedFiles) {
        try {
          const data = await parseExcelFile(file);
          allData = [...allData, ...data];
        } catch (error) {
          console.error(`Error re-processing ${file.name}:`, error);
        }
      }
      
      onDataParsed(allData, updatedFiles.map(f => f.name).join(', '));
    };
    
    reprocessFiles();
  };

  const handleReset = () => {
    setFiles([]);
    onDataParsed([], '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Participant Data</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${
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
        <p className="text-gray-600 mb-2">Drag & drop Excel (.xlsx) files here</p>
        <p className="text-gray-500 text-sm">or click to browse files</p>
        <p className="text-gray-400 text-xs mt-2">
          Files must contain columns: name, email, nric_number, phone, keyskilllist
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx"
          onChange={handleFileChange}
          multiple
        />
      </div>
      
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Uploaded Files ({files.length})</h3>
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove All
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
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
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                  title="Remove file"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
