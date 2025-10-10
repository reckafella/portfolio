/* Preview modal for Blog Posts */

import React from 'react';


interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Preview: {title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="preview-content">
              <h1 className="mb-4">{title}</h1>
              <div className="content" dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
