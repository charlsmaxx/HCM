// File upload utility with drag & drop support
class FileUploader {
  constructor(options = {}) {
    this.options = {
      endpoint: '/api/upload',
      maxSize: 500 * 1024 * 1024, // 500MB
      allowedTypes: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/ogg',
        'video/mp4', 'video/mov', 'video/avi', 'video/webm'
      ],
      folder: null,
      onProgress: null,
      onSuccess: null,
      onError: null,
      ...options
    };
  }

  // Get auth token
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  // Validate file
  validateFile(file) {
    // Check file size
    if (file.size > this.options.maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.formatFileSize(this.options.maxSize)}`);
    }

    // Check file type
    if (this.options.allowedTypes.length > 0 && !this.options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    return true;
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Upload single file
  async uploadFile(file, folder = null) {
    try {
      this.validateFile(file);

      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (this.options.onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            this.options.onProgress(percentComplete, e.loaded, e.total);
          }
        });
      }

      return new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (this.options.onSuccess) {
              this.options.onSuccess(response);
            }
            resolve(response);
          } else {
            const error = JSON.parse(xhr.responseText);
            const errorMessage = error.error || 'Upload failed';
            if (this.options.onError) {
              this.options.onError(errorMessage);
            }
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          const errorMessage = 'Network error during upload';
          if (this.options.onError) {
            this.options.onError(errorMessage);
          }
          reject(new Error(errorMessage));
        });

        xhr.open('POST', this.options.endpoint);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error.message);
      }
      throw error;
    }
  }

  // Upload multiple files
  async uploadFiles(files, folder = null) {
    const fileArray = Array.from(files);
    const results = [];

    for (const file of fileArray) {
      try {
        const result = await this.uploadFile(file, folder);
        results.push({ file: file.name, success: true, result });
      } catch (error) {
        results.push({ file: file.name, success: false, error: error.message });
      }
    }

    return results;
  }
}

// Create drag & drop file upload component
function createFileUploadComponent(options = {}) {
  const {
    containerId,
    inputId,
    accept = 'image/*,audio/*,video/*',
    folder = null,
    onUploadComplete,
    onUploadError,
    maxFiles = 1,
    showPreview = true,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return null;
  }

  // Create uploader instance
  const uploader = new FileUploader({
    folder,
    onSuccess: (result) => {
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    },
    onError: (error) => {
      if (onUploadError) {
        onUploadError(error);
      }
    },
  });

  // Create file input if not exists
  let fileInput = document.getElementById(inputId);
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = inputId;
    fileInput.accept = accept;
    fileInput.style.display = 'none';
    if (maxFiles > 1) {
      fileInput.multiple = true;
    }
    document.body.appendChild(fileInput);
  }

  // Create upload area
  const uploadArea = document.createElement('div');
  uploadArea.className = 'border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors';
  uploadArea.innerHTML = `
    <div class="upload-content">
      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p class="mt-2 text-sm text-gray-600">
        <span class="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p class="text-xs text-gray-500 mt-1">Images, Audio, or Video files</p>
    </div>
    <div class="upload-progress hidden mt-4">
      <div class="bg-gray-200 rounded-full h-2.5">
        <div class="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
      </div>
      <p class="text-sm text-gray-600 mt-2">Uploading...</p>
    </div>
    <div class="upload-preview mt-4 hidden"></div>
  `;

  container.innerHTML = '';
  container.appendChild(uploadArea);

  const uploadContent = uploadArea.querySelector('.upload-content');
  const progressBar = uploadArea.querySelector('.upload-progress');
  const progressFill = progressBar.querySelector('div');
  const previewArea = uploadArea.querySelector('.upload-preview');

  // Handle file selection
  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    if (maxFiles === 1 && fileArray.length > 1) {
      alert('Please select only one file');
      return;
    }

    // Show progress
    uploadContent.classList.add('hidden');
    progressBar.classList.remove('hidden');

    try {
      if (fileArray.length === 1) {
        // Single file upload
        const file = fileArray[0];
        
        // Update progress
        uploader.options.onProgress = (percent) => {
          progressFill.style.width = percent + '%';
        };

        const result = await uploader.uploadFile(file, folder);
        
        // Hide progress, show preview
        progressBar.classList.add('hidden');
        
        if (showPreview) {
          previewArea.classList.remove('hidden');
          if (result.mimetype.startsWith('image/')) {
            previewArea.innerHTML = `
              <img src="${result.url}" alt="Preview" class="max-w-full h-48 object-cover rounded-lg mx-auto">
              <p class="text-sm text-gray-600 mt-2">${file.name}</p>
            `;
          } else {
            previewArea.innerHTML = `
              <div class="bg-gray-100 p-4 rounded-lg">
                <p class="text-sm font-medium text-gray-700">${file.name}</p>
                <p class="text-xs text-gray-500 mt-1">${uploader.formatFileSize(file.size)}</p>
                <a href="${result.url}" target="_blank" class="text-primary-600 text-sm mt-2 inline-block">View File</a>
              </div>
            `;
          }
        }

        // Store URL in hidden input or callback
        if (fileInput.dataset.targetInput) {
          const targetInput = document.getElementById(fileInput.dataset.targetInput);
          if (targetInput) {
            targetInput.value = result.url;
          }
        }

        if (onUploadComplete) {
          onUploadComplete(result);
        }
      } else {
        // Multiple file upload
        const results = await uploader.uploadFiles(fileArray, folder);
        
        progressBar.classList.add('hidden');
        
        if (showPreview) {
          previewArea.classList.remove('hidden');
          previewArea.innerHTML = `
            <div class="space-y-2">
              ${results.map(r => `
                <div class="bg-gray-100 p-2 rounded text-sm">
                  ${r.success ? 
                    `<span class="text-green-600">✓</span> ${r.file} - Uploaded` :
                    `<span class="text-red-600">✗</span> ${r.file} - ${r.error}`
                  }
                </div>
              `).join('')}
            </div>
          `;
        }

        if (onUploadComplete) {
          onUploadComplete(results);
        }
      }
    } catch (error) {
      progressBar.classList.add('hidden');
      uploadContent.classList.remove('hidden');
      
      if (onUploadError) {
        onUploadError(error.message);
      } else {
        alert('Upload failed: ' + error.message);
      }
    }
  };

  // Click to upload
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-primary-500', 'bg-primary-50');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-primary-500', 'bg-primary-50');
    handleFiles(e.dataTransfer.files);
  });

  return {
    uploader,
    fileInput,
    uploadArea,
    reset: () => {
      uploadContent.classList.remove('hidden');
      progressBar.classList.add('hidden');
      previewArea.classList.add('hidden');
      previewArea.innerHTML = '';
      fileInput.value = '';
    }
  };
}

// Make it globally available
window.FileUploader = FileUploader;
window.createFileUploadComponent = createFileUploadComponent;

