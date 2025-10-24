import React, { useState, useMemo } from 'react';
import { BlogPreviewContent } from './BlogPreviewContent';
import '@/styles/device-preview.css';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DevicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  coverImage?: string | null;
  tags?: string[];
  published?: boolean;
  author?: string;
  readingTime?: string;
  viewCount?: number;
  publishedAt?: string;
}

interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  icon: string;
  frameClass: string;
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: 'bi-phone',
    frameClass: 'device-mobile'
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: 'bi-tablet',
    frameClass: 'device-tablet'
  },
  desktop: {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: 'bi-laptop',
    frameClass: 'device-desktop'
  }
};

export const DevicePreviewModal: React.FC<DevicePreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  coverImage,
  tags = [],
  published = false,
  author = 'Ethan Wanyoike',
  readingTime = '5 min read',
  viewCount = 0,
  publishedAt
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const deviceConfig = DEVICE_CONFIGS[selectedDevice];

  const previewData = useMemo(() => ({
    title,
    content,
    coverImage,
    tags,
    published,
    author,
    readingTime,
    viewCount,
    publishedAt: publishedAt || new Date().toISOString(),
    excerpt: content.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
  }), [title, content, coverImage, tags, published, author, readingTime, viewCount, publishedAt]);

  if (!isOpen) return null;

  const handleDeviceChange = (device: DeviceType) => {
    setSelectedDevice(device);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getPreviewStyle = () => {
    if (isFullscreen) {
      return {
        width: '100vw',
        height: '100vh',
        maxWidth: 'none',
        maxHeight: 'none'
      };
    }

    return {
      width: `${deviceConfig.width}px`,
      height: `${deviceConfig.height}px`,
      maxWidth: '90vw',
      maxHeight: '90vh'
    };
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className={`modal-dialog ${isFullscreen ? 'modal-fullscreen' : 'modal-xl'}`}>
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <h5 className="modal-title me-3">
                <i className="bi bi-eye me-2"></i>
                Preview: {title || 'Untitled'}
              </h5>
              {!published && (
                <span className="badge bg-warning">
                  <i className="bi bi-eye-slash me-1"></i>
                  Draft
                </span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2">
              {/* Device Selection */}
              <div className="btn-group" role="group">
                {Object.entries(DEVICE_CONFIGS).map(([device, config]) => (
                  <button
                    key={device}
                    type="button"
                    className={`btn btn-outline-secondary btn-sm ${
                      selectedDevice === device ? 'active' : ''
                    }`}
                    onClick={() => handleDeviceChange(device as DeviceType)}
                    title={`Preview on ${config.name}`}
                  >
                    <i className={`bi ${config.icon} me-1`}></i>
                    {config.name}
                  </button>
                ))}
              </div>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                <i className={`bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'}`}></i>
              </button>

              {/* Close Button */}
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
          </div>

          <div className="modal-body p-0">
            <div className="device-preview-container">
              <div 
                className={`device-frame ${deviceConfig.frameClass} ${isFullscreen ? 'fullscreen' : ''}`}
                style={getPreviewStyle()}
              >
                <div className="device-screen">
                  <div className="preview-content-wrapper">
                    <BlogPreviewContent {...previewData} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="text-muted small">
                <i className={`bi ${deviceConfig.icon} me-1`}></i>
                {deviceConfig.name} ({deviceConfig.width}×{deviceConfig.height})
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => window.open('#', '_blank')}
                  disabled
                  title="Live preview will be available after publishing"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>
                  View Live
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
