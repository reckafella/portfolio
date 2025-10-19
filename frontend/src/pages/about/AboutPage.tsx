import React, { useState, useEffect } from 'react';
import { BsDownload, BsGeoAlt, BsEnvelope, BsPencilSquare, BsX } from 'react-icons/bs';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';
import { aboutApi } from '../../utils/aboutApi';
import { handleApiError } from '../../utils/api';
import ProfileEditForm from '../../components/forms/about/ProfileEditForm';
import SkillsEditForm from '../../components/forms/about/SkillsEditForm';
import EducationEditFormV3 from '../../components/forms/about/EducationEditFormV3';
import ExperienceEditFormV3 from '../../components/forms/about/ExperienceEditFormV3';
import { tabSyncService, TabSyncMessage } from '@/services/tabSyncService';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMetaTags } from '@/hooks/useMetaTags';
import '../../styles/about.css';

interface AboutPageData {
  name: string;
  title: string;
  location: string;
  email: string;
  summary: string;
  education: Array<{
    id?: number;
    degree: string;
    start_date: string;
    end_date?: string | null;
    is_current: boolean;
    period: string;
    institution: string;
    description: string;
  }>;
  skills: string[];
  experience: Array<{
    id?: number;
    title: string;
    start_date: string;
    end_date?: string | null;
    is_current: boolean;
    period: string;
    company: string;
    type: string;
    responsibilities: string[];
  }>;
}

interface EditState {
  profile: boolean;
  education: boolean;
  experience: boolean;
  skills: boolean;
}


const AboutPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<AboutPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [editMode, setEditMode] = useState<EditState>({
    profile: false,
    education: false,
    experience: false,
    skills: false
  });
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);
  const [sectionsBeingEditedByOthers, setSectionsBeingEditedByOthers] = useState<Record<string, string>>({});

  usePageTitle('About Me');
  useMetaTags({
    title: 'About Me',
    description: 'My professional journey and experiences',
    keywords: 'about me, professional journey, experiences',
    ogTitle: 'About Me',
    ogDescription: 'My professional journey and experiences',
    ogType: 'website',
    ogUrl: window.location.origin,
    ogImage: '/static/assets/images/logo-og.png',
    twitterTitle: 'About Me',
    twitterDescription: 'My professional journey and experiences',
    twitterImage: '/static/assets/images/logo-og.png',
    twitterSite: '@frmundu',
    twitterCreator: '@frmundu',
    canonical: window.location.origin,
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  // Listen for cross-tab edit and content update events
  useEffect(() => {
    const handleTabSyncMessage = (message: TabSyncMessage) => {
      if (message.type === 'EDIT_START' && message.payload.editType === 'about') {
        const section = message.payload.editSection;
        const editor = message.payload.editUser || 'Another user';
        if (section) {
          setSectionsBeingEditedByOthers(prev => ({
            ...prev,
            [section]: editor
          }));
        }
      } else if (message.type === 'EDIT_END' && message.payload.editType === 'about') {
        const section = message.payload.editSection;
        if (section) {
          setSectionsBeingEditedByOthers(prev => {
            const newState = { ...prev };
            delete newState[section];
            return newState;
          });
        }
      } else if (message.type === 'CONTENT_UPDATED' && message.payload.contentType === 'about') {
        // Refresh about data when content is updated in another tab
        fetchAboutData();
        setSuccessMessage('Content updated in another tab. Page refreshed.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    };

    tabSyncService.addListener(handleTabSyncMessage);

    return () => {
      tabSyncService.removeListener(handleTabSyncMessage);
    };
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await aboutApi.get();
      if (response.ok) {
        const data = await response.json();
        setData(data);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Failed to load about page data. Please try again later.`);
      handleApiError(err as Response);
    } finally {
      setIsLoading(false);
    }
  };


  const toggleEditMode = (section: keyof EditState) => {
    const willBeEditing = !editMode[section];
    
    setEditMode(prev => ({
      ...prev,
      [section]: willBeEditing
    }));
    
    // Broadcast edit state to other tabs
    if (willBeEditing) {
      tabSyncService.broadcastEditStart('about', section, user?.username);
    } else {
      tabSyncService.broadcastEditEnd('about', section);
    }
    
    setError(null);
    setSuccessMessage('');
  };

  const toggleGlobalEditMode = () => {
    const newGlobalEdit = !isGlobalEditMode;
    setIsGlobalEditMode(newGlobalEdit);
    
    const sections: (keyof EditState)[] = ['profile', 'education', 'experience', 'skills'];
    
    if (newGlobalEdit) {
      // Enable editing for all sections
      setEditMode({
        profile: true,
        education: true,
        experience: true,
        skills: true
      });
      
      // Broadcast edit start for all sections
      sections.forEach(section => {
        tabSyncService.broadcastEditStart('about', section, user?.username);
      });
    } else {
      // Disable editing for all sections
      setEditMode({
        profile: false,
        education: false,
        experience: false,
        skills: false
      });
      
      // Broadcast edit end for all sections
      sections.forEach(section => {
        tabSyncService.broadcastEditEnd('about', section);
      });
    }
    
    setError(null);
    setSuccessMessage('');
  };

  const handleUpdate = (section: keyof EditState, updatedData: Record<string, unknown>) => {
    if (data) {
      setData(prev => ({ ...prev!, ...updatedData }));
      
      // If we're in global edit mode, keep all sections editable
      // Otherwise, just close the individual section
      if (!isGlobalEditMode) {
        setEditMode(prev => ({ ...prev, [section]: false }));
        // Broadcast edit end for this section
        tabSyncService.broadcastEditEnd('about', section);
      }
      
      // Broadcast content update to other tabs
      tabSyncService.broadcastContentUpdate('about');
      
      setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'building':
        return '🏢';
      case 'laptop':
        return '💻';
      case 'graph-up':
        return '📈';
      case 'code-slash':
        return '💻';
      case 'globe':
        return '🌐';
      default:
        return '🏢';
    }
  };

  const downloadResume = async () => {
    try {
      const response = await aboutApi.downloadResume();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Create blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${data?.name?.replace(/\s+/g, '_') || 'Resume'}.pdf`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Resume downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      /* console.error('Download error:', err); */
      setError('Failed to download resume. Please try again later.' + err);
      setTimeout(() => setError(null), 5000);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <AlertMessage type="danger" message={error} />;
  if (!data) return null;

  return (
    <section id="resume" className="resume section py-4">
      <div className="container">
        <div className="section-title text-center mb-1">
          <h1>About Me</h1>
          <p>My professional journey and experiences</p>
          <div className="mt-3">
            <button 
              onClick={downloadResume}
              className="btn btn-info me-2" 
              title="Download Resume"
            >
              <BsDownload className="me-2" />
              Download CV
            </button>
            {isAuthenticated && (
              <button
                onClick={toggleGlobalEditMode}
                className={`btn ${isGlobalEditMode ? 'btn-danger' : 'btn-outline-primary'}`}
                title={isGlobalEditMode ? 'Exit editing mode for all sections' : 'Edit all sections at once'}
              >
                {isGlobalEditMode ? (
                  <>
                    <BsX className="me-2" />
                    Exit Edit Mode
                  </>
                ) : (
                  <>
                    <BsPencilSquare className="me-2" />
                    Edit All Sections
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
          </div>
        )}

        {/* Global Edit Mode Indicator */}
        {isAuthenticated && isGlobalEditMode && (
          <div className="global-edit-mode">
            <div className="alert alert-warning mb-0" role="alert">
              <i className="bi bi-pencil-fill me-2"></i>
              <strong>Global Edit Mode Active</strong> - All sections are now editable. 
              Make your changes and click "Exit Edit Mode" when finished.
            </div>
          </div>
        )}



        <div className="container">
          <div className="row">
            {/* Left Column */}
            <div className="col-lg-6">
              {/* Profile Section */}
              <div className="d-flex align-items-center mb-3">
                <h3 className="resume-title mb-0">Summary</h3>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => toggleEditMode('profile')}
                      className="edit-icon-btn text-primary"
                      title={editMode.profile ? 'Cancel editing' : 'Edit profile'}
                    >
                      {editMode.profile ? <BsX size={18} /> : <BsPencilSquare size={16} />}
                    </button>
                    {sectionsBeingEditedByOthers['profile'] && (
                      <span className="badge bg-warning ms-2" title={`Being edited by ${sectionsBeingEditedByOthers['profile']}`}>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {sectionsBeingEditedByOthers['profile']} is editing
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {editMode.profile ? (
                <ProfileEditForm
                  data={data}
                  onUpdate={(updatedData) => handleUpdate('profile', updatedData as unknown as Record<string, unknown>)}
                  onError={handleError}
                  onCancel={() => toggleEditMode('profile')}
                />
              ) : (
                <div className="resume-item pb-0 mb-3">
                  <h4>{data.name}</h4>
                  <p><em>{data.summary}</em></p>
                  <ul className="list-unstyled">
                    <li>
                      <BsGeoAlt className="me-2" />
                      {data.location}
                    </li>
                    <li>
                      <BsEnvelope className="me-2" />
                      {data.email}
                    </li>
                  </ul>
                </div>
              )}

              {/* Education Section */}
              <div className="d-flex align-items-center mb-3">
                <h3 className="resume-title mb-0">Education</h3>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => toggleEditMode('education')}
                      className="edit-icon-btn text-primary"
                      title={editMode.education ? 'Cancel editing' : 'Edit education'}
                    >
                      {editMode.education ? <BsX size={18} /> : <BsPencilSquare size={16} />}
                    </button>
                    {sectionsBeingEditedByOthers['education'] && (
                      <span className="badge bg-warning ms-2" title={`Being edited by ${sectionsBeingEditedByOthers['education']}`}>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {sectionsBeingEditedByOthers['education']} is editing
                      </span>
                    )}
                  </>
                )}
              </div>

              {editMode.education ? (
                <EducationEditFormV3
                  data={data.education}
                  onUpdate={(updatedData) => handleUpdate('education', { education: updatedData })}
                  onError={handleError}
                  onCancel={() => toggleEditMode('education')}
                />
              ) : (
                <>
                  {data.education.map((edu, index) => (
                    <div key={index} className="resume-item">
                      <h4>{edu.degree}</h4>
                      <h5 className="text-success">{edu.period}</h5>
                      <p><em>{edu.institution}</em></p>
                      <p>{edu.description}</p>
                    </div>
                  ))}
                </>
              )}

              {/* Skills Section */}
              <div className="d-flex align-items-center mb-3">
                <h3 className="resume-title mb-0">Skills</h3>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => toggleEditMode('skills')}
                      className="edit-icon-btn text-primary"
                      title={editMode.skills ? 'Cancel editing' : 'Edit skills'}
                    >
                      {editMode.skills ? <BsX size={18} /> : <BsPencilSquare size={16} />}
                    </button>
                    {sectionsBeingEditedByOthers['skills'] && (
                      <span className="badge bg-warning ms-2" title={`Being edited by ${sectionsBeingEditedByOthers['skills']}`}>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {sectionsBeingEditedByOthers['skills']} is editing
                      </span>
                    )}
                  </>
                )}
              </div>

              {editMode.skills ? (
                <SkillsEditForm
                  data={data.skills}
                  onUpdate={(updatedData) => handleUpdate('skills', { skills: updatedData })}
                  onError={handleError}
                  onCancel={() => toggleEditMode('skills')}
                />
              ) : (
                <div className="resume-item">
                  <h4>Technical Skills</h4>
                  <div className="skill-tags">
                    {data.skills.map((skill, index) => (
                      <span key={index} className="badge bg-success m-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="col-lg-6">
              <div className="d-flex align-items-center mb-3">
                <h3 className="resume-title mb-0">Professional Experience</h3>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => toggleEditMode('experience')}
                      className="edit-icon-btn text-primary"
                      title={editMode.experience ? 'Cancel editing' : 'Edit experience'}
                    >
                      {editMode.experience ? <BsX size={18} /> : <BsPencilSquare size={16} />}
                    </button>
                    {sectionsBeingEditedByOthers['experience'] && (
                      <span className="badge bg-warning ms-2" title={`Being edited by ${sectionsBeingEditedByOthers['experience']}`}>
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {sectionsBeingEditedByOthers['experience']} is editing
                      </span>
                    )}
                  </>
                )}
              </div>

              {editMode.experience ? (
                <ExperienceEditFormV3
                  data={data.experience.map(exp => ({
                    ...exp,
                    icon_type: exp.type
                  }))}
                  onUpdate={(updatedData) => handleUpdate('experience', { experience: updatedData })}
                  onError={handleError}
                  onCancel={() => toggleEditMode('experience')}
                />
              ) : (
                <>
                  {data.experience.map((exp, index) => (
                    <div key={index} className="resume-item">
                      <h4>{exp.title}</h4>
                      <h5 className="text-success">{exp.period}</h5>
                      <p>
                        <em>
                          <span className="me-2">{getIcon(exp.type)}</span>
                          {exp.company}
                        </em>
                      </p>
                      <ul>
                        {exp.responsibilities.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default AboutPage;
