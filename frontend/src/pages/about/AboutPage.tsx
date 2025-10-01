import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { BsDownload, BsGeoAlt, BsEnvelope, BsBuilding, BsLaptop, BsGraphUp } from 'react-icons/bs';
import axios from 'axios';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AlertMessage } from '../../components/common/AlertMessage';

interface AboutPageData {
  name: string;
  title: string;
  location: string;
  email: string;
  summary: string;
  education: Array<{
    degree: string;
    period: string;
    institution: string;
    description: string;
  }>;
  skills: string[];
  experience: Array<{
    title: string;
    period: string;
    company: string;
    type: string;
    responsibilities: string[];
  }>;
}

const AboutPage: React.FC = () => {
  const [data, setData] = useState<AboutPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await axios.get('/api/v1/about/');
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to load about page data. Please try again later.\n ${err}`);
        /* console.error('Error fetching about data:', err); */
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'building':
        return <BsBuilding />;
      case 'laptop':
        return <BsLaptop />;
      case 'graph-up':
        return <BsGraphUp />;
      default:
        return <BsBuilding />;
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <AlertMessage type="danger" message={error} />;
  if (!data) return null;

  const downloadResume = async () => {
    try {
      const response = await axios.get('/api/v1/resume-pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download resume. \nPlease try again later.' + err);
    }
  };

  return (
    <Container className="py-5">
      {/* Title Section */}
      <Row className="mb-4 text-center">
        <Col>
          <h1>About Me</h1>
          <p className="lead">My professional journey and experiences</p>
          <Button
            variant="info"
            href="/api/v1/resume-pdf"
            onClick={downloadResume}
            className="mt-3"
          >
            <BsDownload className="me-2" />
            Download CV
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Left Column */}
        <Col lg={6}>
          {/* Summary */}
          <Card className="mb-4">
            <Card.Body>
              <h3>Summary</h3>
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
            </Card.Body>
          </Card>

          {/* Education */}
          <Card className="mb-4">
            <Card.Body>
              <h3>Education</h3>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <h4>{edu.degree}</h4>
                  <h5 className="text-success">{edu.period}</h5>
                  <p><em>{edu.institution}</em></p>
                  <p>{edu.description}</p>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Skills */}
          <Card className="mb-4">
            <Card.Body>
              <h3>Skills</h3>
              <div className="skill-tags">
                {data.skills.map((skill, index) => (
                  <Badge bg="success" className="m-1" key={index}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h3>Professional Experience</h3>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <h4>{exp.title}</h4>
                  <h5 className="text-success">{exp.period}</h5>
                  <p>
                    <em>
                      {getIcon(exp.type)}
                      <span className="ms-2">{exp.company}</span>
                    </em>
                  </p>
                  <ul>
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AboutPage;
