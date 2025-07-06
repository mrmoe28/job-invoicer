        await fetch(`/api/upload?id=${doc.id}`, { method: 'DELETE' });
      }
      
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const handleViewPdf = (doc: Document) => {
    if (doc.type === 'application/pdf' || doc.name.endsWith('.pdf')) {
      setSelectedPdf(doc);
    }
  };

  const handleSignDocument = (doc: Document) => {
    setDocumentToSign(doc);
  };

  const handleSignatureComplete = (signatures: any[]) => {
    if (!documentToSign) return;

    // Update document status
    setDocuments(prev => prev.map(doc => 
      doc.id === documentToSign.id
        ? { ...doc, status: 'signed', signatures }
        : doc
    ));

    setDocumentToSign(null);
    alert('Document signed successfully!');
  };

  const handleTemplateComplete = async (values: Record<string, any>, content: string) => {
    try {
      // Create a blob from the content
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], `${selectedTemplate.name}_${Date.now()}.txt`, { type: 'text/plain' });
      
      // Upload the generated contract
      await handleUpload(file);
      
      // Update the document with template metadata
      setDocuments(prev => {
        const newDoc = prev[0]; // Just uploaded
        return [
          { ...newDoc, category: 'contracts', subcategory: selectedTemplate.name },
          ...prev.slice(1)
        ];
      });

      setSelectedTemplate(null);
      setShowTemplates(false);
    } catch (error) {
      console.error('Template save error:', error);
      alert('Failed to save contract');
    }
  };

  const getFileIcon = (doc: Document) => {
    const isPdf = doc.type === 'application/pdf' || doc.name.endsWith('.pdf');
    const isWord = doc.type.includes('word') || doc.name.match(/\.(doc|docx)$/);
    const isExcel = doc.type.includes('excel') || doc.name.match(/\.(xls|xlsx)$/);
    
    if (isPdf) return <FileText className="w-5 h-5 text-red-500" />;
    if (isWord) return <FileText className="w-5 h-5 text-blue-500" />;
    if (isExcel) return <FileText className="w-5 h-5 text-green-500" />;
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  const getStatusBadge = (status?: Document['status']) => {
    const badges = {
      draft: 'bg-gray-600 text-gray-200',
      pending_signature: 'bg-yellow-600 text-yellow-200',
      signed: 'bg-green-600 text-green-200',
      completed: 'bg-blue-600 text-blue-200'
    };

    const labels = {
      draft: 'Draft',
      pending_signature: 'Pending Signature',
      signed: 'Signed',
      completed: 'Completed'
    };

    if (!status) return null;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get all categories for filter
  const allCategories = [
    { id: 'all', name: 'All Documents' },
    ...Object.values(DOCUMENT_CATEGORIES).map(cat => ({
      id: cat.id,
      name: cat.name
    }))
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New from Template
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Templates Section */}
        {showTemplates && (
          <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Contract Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CONTRACT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className="p-4 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition-colors"
                >
                  <FileText className="w-8 h-8 text-orange-500 mb-2" />
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Upload New Document</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <FileUpload
              onUpload={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              maxSize={10}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              {allCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Categories Overview */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.values(DOCUMENT_CATEGORIES).slice(0, 5).map(category => {
            const count = documents.filter(doc => doc.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  filterCategory === category.id
                    ? 'bg-gray-700 border-orange-500'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{getCategoryIcon(category.id)}</div>
                <div className="text-sm font-medium text-white">{category.name}</div>
                <div className="text-xs text-gray-400 mt-1">{count} documents</div>
              </button>
            );
          })}
        </div>

        {/* Document List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDocuments.map((doc) => {
                  const category = Object.values(DOCUMENT_CATEGORIES).find(cat => cat.id === doc.category);
                  const isPdf = doc.type === 'application/pdf' || doc.name.endsWith('.pdf');
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(doc)}
                          <span className="ml-3 text-white">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(doc.category)}`}>
                          {category?.name || 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-400">
                          {doc.provider === 's3' && '☁️ S3'}
                          {doc.provider === 'cloudinary' && '☁️ Cloudinary'}
                          {(!doc.provider || doc.provider === 'local') && '💾 Local'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {isPdf && (
                            <>
                              <button
                                onClick={() => handleViewPdf(doc)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {doc.status !== 'signed' && (
                                <button
                                  onClick={() => handleSignDocument(doc)}
                                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-gray-600 rounded transition-colors"
                                  title="Sign Document"
                                >
                                  <FileSignature className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          <a
                            href={doc.url}
                            download
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm || filterCategory !== 'all' 
                  ? 'No documents found matching your criteria' 
                  : 'No documents uploaded yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PDFViewer
          url={selectedPdf.url}
          title={selectedPdf.name}
          onClose={() => setSelectedPdf(null)}
        />
      )}

      {/* Document Signer Modal */}
      {documentToSign && (
        <DocumentSigner
          url={documentToSign.url}
          title={documentToSign.name}
          onComplete={handleSignatureComplete}
          onClose={() => setDocumentToSign(null)}
        />
      )}

      {/* Contract Template Editor */}
      {selectedTemplate && (
        <ContractTemplateEditor
          template={selectedTemplate}
          onSave={handleTemplateComplete}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}