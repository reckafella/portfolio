import React from "react";
import { Link } from "react-router-dom";

const SkillsSection: React.FC = () => {
    return (
        <>
            {/* Skills Section */}
            <section id="skills" className="section skills py-5">
                <div className="container">
                    {/** Section Title **/}
                    <div className="section-title text-center mb-1">
                        <h2>Skills & Expertise</h2>
                        <p className="text-muted">My Technical Toolkit</p>
                    </div>

                    <div className="container">
                        <div className="row row-cols-1 row-cols-md-3 g-4">
                            {/** Languages Column **/}
                            <div className="col">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-code-square fs-2 text-primary me-3"></i>
                                            <h3 className="card-title mb-0">
                                                Languages
                                            </h3>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Python
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        JavaScript
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        TypeScript
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        C
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        HTML/CSS
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        SQL
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Bash
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/** Frameworks Column **/}
                            <div className="col">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-stack fs-2 text-primary me-3"></i>
                                            <h3 className="card-title mb-0">
                                                Frameworks
                                            </h3>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Django
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Flask
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Node.js
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Express.js
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Bootstrap
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Tailwind CSS
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        RESTful APIs
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/** DevOps & Cloud Column **/}
                            <div className="col">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-cloud fs-2 text-primary me-3"></i>
                                            <h3 className="card-title mb-0">
                                                DevOps & Cloud
                                            </h3>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Docker
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        AWS
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        CI/CD
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Terraform
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Ansible
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Nginx & Apache
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        GitHub Actions
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/** Databases Column **/}
                            <div className="col">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-database fs-2 text-primary me-3"></i>
                                            <h3 className="card-title mb-0">
                                                Databases
                                            </h3>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        PostgreSQL
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        MySQL
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        MongoDB
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        SQLite
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Redis
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        MongoDB Atlas
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/** Tools & Platforms Column **/}
                            <div className="col">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-tools fs-2 text-primary me-3"></i>
                                            <h3 className="card-title mb-0">
                                                Tools & Platforms
                                            </h3>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Git & GitHub
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        JIRA
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Trello
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        VS Code
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Postman
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/** Soft Skills Column **/}
                            <div className="col">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="bi bi-people fs-2 text-primary me-3"></i>
                                            <h3 className="card-title mb-0">
                                                Soft Skills
                                            </h3>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Teamwork
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Communication
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Problem Solving
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="col-6">
                                                <ul className="list-unstyled">
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Adaptability
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Attention to Detail
                                                    </li>
                                                    <li className="mb-2">
                                                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                                                        Leadership
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/** Call to Action **/}
                        <div className="row mt-5">
                            <div className="col-12 d-flex justify-content-center align-items-center text-center">
                                <div className="p-5 w-auto card rounded-3 shadow-lg border-2">
                                    <h4 className="mb-3 fw-bold">
                                        Want to see my skills in action?
                                    </h4>
                                    <p className="mb-4">
                                        Explore my portfolio projects or check
                                        out my technical articles.
                                    </p>
                                    <div className="d-flex flex-wrap justify-content-center gap-3">
                                        <Link
                                            to="/about"
                                            className="btn btn-success btn-lg px-1 justify-content-center align-items-center"
                                        >
                                            <i className="bi bi-file-earmark-person me-2"></i>
                                            View Resume
                                        </Link>
                                        <Link
                                            to="/projects"
                                            className="btn btn-secondary btn-lg px-1 justify-content-center align-items-center"
                                        >
                                            <i className="bi bi-code-slash me-1"></i>
                                            View Projects
                                        </Link>
                                        <Link
                                            to="/blog"
                                            className="btn btn-info btn-lg px-1 justify-content-center align-items-center"
                                        >
                                            <i className="bi bi-journal-text me-2"></i>
                                            Read Blog
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default SkillsSection;
