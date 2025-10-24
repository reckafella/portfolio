import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AlertMessage } from '@/components/common/AlertMessage';
import { tabSyncService, TabSyncMessage } from '@/services/tabSyncService';
import { ProjectFormData, AutoSaveState, PROJECT_TYPES, CATEGORIES } from './types';

interface ProjectEditorPageProps {
  mode: 'create' | 'edit';
  slug?: string;
  initialProject?: {
    title?: string;
    description?: string;
    project_type?: string;
    category?: string;
    client?: string;
    project_url?: string;
    images?: Array<{ id: number; cloudinary_image_url: string }>;
    videos?: Array<{ id: number; youtube_url: string }>;
  };
  onSubmit: (_data: ProjectFormData) => Promise<{ slug?: string }>;
  isSubmitting: boolean;
  submitError?: string;
  user?: { username?: string };
  onNavigateBack: () => void;
}

export function ProjectEditorPage({
  mode,
  slug,
  initialProject,
  onSubmit,
  isSubmitting: isSubmittingProp,
  submitError: submitErrorProp,
  user,
  onNavigateBack,
}: ProjectEditorPageProps) {
  const isEditing = mode === 'edit';

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    project_type: 'personal',
    category: 'Web Development',
    client: 'Personal',
    project_url: '',
    images: [],
    youtube_urls: [''],
    existing_images: [],
    existing_videos: [],
    images_to_delete: [],
    videos_to_delete: [],
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [autoSave, setAutoSave] = useState<AutoSaveState>({
    isAutoSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  });
  const [beingEditedBy, setBeingEditedBy] = useState<string | null>(null);
  const [showContentUpdatedWarning, setShowContentUpdatedWarning] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const initialContentRef = useRef<string>('');

  // Check if form data meets auto-save criteria
  const shouldAutoSave = (data: ProjectFormData): boolean => {
    return (
      data.title.trim().length > 0 &&
      data.description.trim().length > 10 &&
      data.project_type.trim().length > 0 &&
      data.category.trim().length > 0
    );
  };


  // Auto-save function
  const performAutoSave = useCallback(async (data: ProjectFormData) => {
    setAutoSave(prev => ({ ...prev, isAutoSaving: true }));

    try {
      await onSubmit(data);
      initialContentRef.current = data.description;
      setAutoSave({
        isAutoSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      });
    } catch (error) {
      setAutoSave(prev => ({ ...prev, isAutoSaving: false }));
      // Don't show errors for auto-save failures, just log them
      // eslint-disable-next-line no-console
      console.warn('Auto-save failed:', error);
    }
  }, [onSubmit]);

  // Populate form with existing project data
  useEffect(() => {
    if (initialProject && !initialDataLoaded && isEditing) {
      const initialContent = initialProject.description || '';
      setFormData({
        title: initialProject.title || '',
        description: initialContent,
        project_type: initialProject.project_type || 'personal',
        category: initialProject.category || 'Web Development',
        client: initialProject.client || 'Personal',
        project_url: initialProject.project_url || '',
        images: [],
        youtube_urls: initialProject.videos?.map((v: { youtube_url: string }) => v.youtube_url) || [''],
        existing_images: initialProject.images?.map((img: { id: number; cloudinary_image_url: string }) => ({
          id: img.id,
          url: img.cloudinary_image_url
        })) || [],
        existing_videos: initialProject.videos?.map((vid: { id: number; youtube_url: string }) => ({
          id: vid.id,
          youtube_url: vid.youtube_url
        })) || [],
        images_to_delete: [],
        videos_to_delete: [],
      });
      initialContentRef.current = initialContent;
      setInitialDataLoaded(true);
    }
  }, [initialProject, initialDataLoaded, isEditing]);

  // Broadcast edit start
  useEffect(() => {
    if (isEditing && slug && initialDataLoaded) {
      tabSyncService.broadcastEditStart('project', slug, user?.username);
    }

    return () => {
      if (isEditing && slug) {
        tabSyncService.broadcastEditEnd('project', slug);
      }
    };
  }, [isEditing, slug, initialDataLoaded, user]);

  // Listen for cross-tab events
  useEffect(() => {
    const handleTabSyncMessage = (message: TabSyncMessage) => {
      if (message.type === 'EDIT_START' && message.payload.editType === 'project' && message.payload.editSection === slug) {
        const editor = message.payload.editUser || 'Another user';
        setBeingEditedBy(editor);
      } else if (message.type === 'EDIT_END' && message.payload.editType === 'project' && message.payload.editSection === slug) {
        setBeingEditedBy(null);
      } else if (message.type === 'CONTENT_UPDATED' && message.payload.contentType === 'project' && message.payload.contentId === slug) {
        setShowContentUpdatedWarning(true);
      }
    };

    tabSyncService.addListener(handleTabSyncMessage);
    return () => tabSyncService.removeListener(handleTabSyncMessage);
  }, [slug]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (formData.description && formData.description !== initialContentRef.current && shouldAutoSave(formData)) {
      setAutoSave(prev => ({ ...prev, hasUnsavedChanges: true }));
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave(formData);
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, performAutoSave]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSave.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSave.hasUnsavedChanges]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = (formData.existing_images?.length || 0) + formData.images.length + files.length;

    if (totalImages > 5) {
      setErrors(prev => ({ ...prev, images: ['You can only upload up to 5 images total'] }));
      return;
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      images_to_delete: [...(prev.images_to_delete || []), imageId]
    }));
  };

  const restoreExistingImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      images_to_delete: (prev.images_to_delete || []).filter(id => id !== imageId)
    }));
  };

  const addYoutubeUrl = () => {
    setFormData(prev => ({
      ...prev,
      youtube_urls: [...prev.youtube_urls, '']
    }));
  };

  const updateYoutubeUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      youtube_urls: prev.youtube_urls.map((url, i) => i === index ? value : url)
    }));
  };

  const removeYoutubeUrl = (index: number) => {
    // Only allow removing new URLs (not existing ones from backend)
    setFormData(prev => ({
      ...prev,
      youtube_urls: prev.youtube_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await onSubmit(formData);
      // Navigation is handled by parent component
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Project save error:', error);

      if (error && typeof error === 'object') {
        const errorObj = error as {
          status?: number;
          data?: Record<string, string[]>;
          message?: string;
        };

        if (errorObj.status === 400 && errorObj.data) {
          const validationErrors: Record<string, string[]> = {};
          Object.keys(errorObj.data).forEach(key => {
            const value = errorObj.data?.[key];
            if (Array.isArray(value)) {
              validationErrors[key] = value;
            } else if (typeof value === 'string') {
              validationErrors[key] = [value];
            }
          });
          setErrors(validationErrors);
        } else if (errorObj.message) {
          setErrors({ general: [errorObj.message] });
        } else {
          setErrors({ general: ['Failed to save project. Please try again.'] });
        }
      } else {
        setErrors({ general: ['Failed to save project. Please try again.'] });
      }
    }
  };

  return (
    <section className="section project project-editor-page">
      <div className="container-fluid my-1 mx-auto px-auto px-lg-1">
        {/* Header */}
        <div className="editor-header border-bottom border-lg">
          <div className="container-fluid py-3">
            <div className="row align-items-center">
              <div className="col">
                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded"
                    onClick={() => {
                      if (autoSave.hasUnsavedChanges) {
                        const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                        if (confirmLeave) onNavigateBack();
                      } else {
                        onNavigateBack();
                      }
                    }}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Projects
                  </button>
                  <div>
                    <h1 className="h4 mb-0">
                      {isEditing ? `Edit: ${initialProject?.title || 'Project'}` : 'New Project'}
                    </h1>
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      {beingEditedBy && (
                        <span className="badge bg-warning">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          {beingEditedBy} is also editing this project
                        </span>
                      )}
                      {showContentUpdatedWarning && (
                        <span className="badge bg-info">
                          <i className="bi bi-info-circle-fill me-1"></i>
                          Content updated in another tab
                          <button 
                            className="btn btn-sm btn-link p-0 ms-2"
                            onClick={() => window.location.reload()}
                          >
                            Reload
                          </button>
                        </span>
                      )}
                      {autoSave.isAutoSaving && (
                        <span className="text-warning">
                          <i className="bi bi-clock me-1"></i>
                          Auto-saving...
                        </span>
                      )}
                      {autoSave.lastSaved && !autoSave.hasUnsavedChanges && (
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Saved {autoSave.lastSaved.toLocaleTimeString()}
                        </span>
                      )}
                      {autoSave.hasUnsavedChanges && (
                        <span className="text-warning">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Unsaved changes
                        </span>
                      )}
                      {!shouldAutoSave(formData) && formData.description && (
                        <span className="text-info">
                          <i className="bi bi-info-circle me-1"></i>
                          Auto-save requires: title, description (10+ chars), type, and category
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <button
                  type="submit"
                  form="project-form"
                  className="btn btn-success btn-sm rounded"
                  disabled={isSubmittingProp || !shouldAutoSave(formData)}
                >
                  {isSubmittingProp ? (
                    <div className='d-flex justify-content-around align-items-center'>
                      <LoadingSpinner size="sm" className="me-1" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <div className='d-flex justify-content-around align-items-center'>
                      <i className="bi bi-check-circle me-1"></i>
                      {isEditing ? 'Update Project' : 'Create Project'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-fluid py-3 py-lg-4">
          <div className="row editor-main">
            {/* Editor Column */}
            <div className="col-lg-7">
              <div className="">
                {errors.general && errors.general.map((msg, idx) => (
                  <AlertMessage
                    key={idx}
                    type="danger"
                    message={msg}
                    className="mb-4"
                  />
                ))}
                
                {submitErrorProp && (
                  <AlertMessage
                    type="danger"
                    message={submitErrorProp}
                    className="mb-4"
                  />
                )}

                <form id="project-form" onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-4">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Project Title<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg border-0 shadow-none ${errors.title ? 'is-invalid' : ''}`}
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your project title..."
                      style={{ fontSize: '2rem', fontWeight: '600' }}
                    />
                    {errors.title && (
                      <div className="invalid-feedback">
                        {errors.title.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label fw-semibold">
                      Description<span className="text-danger ms-1">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={8}
                      placeholder="Describe your project in detail..."
                    />
                    {errors.description && (
                      <div className="invalid-feedback">
                        {errors.description.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Project URL */}
                  <div className="mb-4">
                    <label htmlFor="project_url" className="form-label fw-semibold">
                      Live Project URL
                    </label>
                    <input
                      type="url"
                      className={`form-control ${errors.project_url ? 'is-invalid' : ''}`}
                      id="project_url"
                      name="project_url"
                      value={formData.project_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                    {errors.project_url && (
                      <div className="invalid-feedback">
                        {errors.project_url.join(', ')}
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="row col-lg-5 justify-content-center align-items-start">
              <div className="editor-sidebar">
                <div className="card-card">
                  <div className="card-body">
                    {/* Type & Category */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <label htmlFor="project_type" className="fw-bold form-label">
                          Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.project_type ? 'is-invalid' : ''}`}
                          id="project_type"
                          name="project_type"
                          value={formData.project_type}
                          onChange={handleInputChange}
                          required
                        >
                          {PROJECT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-6">
                        <label htmlFor="category" className="fw-bold form-label">
                          Category <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Client */}
                    <div className="mb-3">
                      <label htmlFor="client" className="fw-bold form-label">
                        Client
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.client ? 'is-invalid' : ''}`}
                        id="client"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        placeholder="Personal, Company Name, etc."
                      />
                    </div>

                    {/* Images */}
                    <div className="mb-3">
                      <label className="fw-bold form-label">
                        Project Images (Max 5)
                      </label>
                      <input
                        type="file"
                        className={`form-control ${errors.images ? 'is-invalid' : ''}`}
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        disabled={((formData.existing_images?.length || 0) + formData.images.length) >= 5}
                      />
                      {errors.images && (
                        <div className="invalid-feedback d-block">
                          {errors.images.join(', ')}
                        </div>
                      )}
                      <small className="text-muted">
                        {(formData.existing_images?.length || 0) + formData.images.length}/5 images
                      </small>
                    </div>

                    {/* Existing Images */}
                    {formData.existing_images && formData.existing_images.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Current Images</label>
                        <div className="row g-2">
                          {formData.existing_images.map((img) => {
                            const isMarkedForDeletion = formData.images_to_delete?.includes(img.id);
                            return (
                              <div key={img.id} className="col-6">
                                <div className={`card position-relative ${isMarkedForDeletion ? 'opacity-50' : ''}`}>
                                  <img src={img.url} alt="" className="card-img-top" style={{ height: '100px', objectFit: 'cover' }} />
                                  <div className="card-body p-1 text-center">
                                    {isMarkedForDeletion ? (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-success w-100"
                                        onClick={() => restoreExistingImage(img.id)}
                                      >
                                        <i className="bi bi-arrow-counterclockwise me-1"></i>
                                        Restore
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger w-100"
                                        onClick={() => removeExistingImage(img.id)}
                                      >
                                        <i className="bi bi-trash me-1"></i>
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* New Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">New Images</label>
                        <div className="row g-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="col-6">
                              <div className="card position-relative">
                                <img src={preview} alt="" className="card-img-top" style={{ height: '100px', objectFit: 'cover' }} />
                                <div className="card-body p-1 text-center">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-danger w-100"
                                    onClick={() => removeNewImage(index)}
                                  >
                                    <i className="bi bi-x"></i>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* YouTube URLs */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="fw-bold form-label mb-0">
                          YouTube Videos
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={addYoutubeUrl}
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      {formData.youtube_urls.map((url, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <input
                            type="url"
                            className="form-control form-control-sm"
                            value={url}
                            onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeYoutubeUrl(index)}
                            disabled={formData.youtube_urls.length === 1}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
