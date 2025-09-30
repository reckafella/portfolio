from rest_framework import serializers


class AboutPageSerializer(serializers.Serializer):
    """Serializer for the About page data"""
    name = serializers.CharField(default="Ethan Wanyoike")
    title = serializers.CharField(default="Software Engineer")
    location = serializers.CharField(default="Nairobi, Kenya")
    email = serializers.EmailField(default="ethanmuthoni@gmail.com")
    summary = serializers.CharField(default=(
        "A software engineer with a passion for building scalable applications and improving user "
        "experiences. Experienced in both frontend and backend development, and always eager to "
        "learn new technologies and improve my skills."
    ))

    education = serializers.ListField(child=serializers.DictField(), default=lambda: [
        {
            "degree": "Full-stack Software Engineering",
            "period": "2023 - 2024",
            "institution": "ALX Africa, Kenya",
            "description": (
                "Completed a comprehensive software engineering program covering full-stack development, "
                "DevOps practices, and cloud computing. Projects included web applications, RESTful APIs, and "
                "deployment pipelines."
            )
        },
        {
            "degree": "Bachelor of Science in Economics & Statistics",
            "period": "2016 - 2020",
            "institution": "Maasai Mara University, Kenya",
            "description": (
                "Graduated with a Second Class Honours degree specializing in Data Science and Analytics. "
                "Completed a thesis on \"Predictive Analytics in the Banking Sector\"."
            )
        }
    ])

    skills = serializers.ListField(child=serializers.CharField(), default=lambda: [
        "Python", "Django", "JavaScript", "Git", "TypeScript", "Bootstrap",
        "Node.js", "C", "Bash", "SQL", "Docker", "REST APIs"
    ])

    experience = serializers.ListField(child=serializers.DictField(), default=lambda: [
        {
            "title": "Software Engineer",
            "period": "Apr. 2024 - Present",
            "company": "Alphaflare Ltd",
            "type": "building",  # for icon
            "responsibilities": [
                "Developed and maintained web applications using Django and JavaScript.",
                "Collaborated with cross-functional teams to design and implement new features.",
                "Participated in code reviews and provided constructive feedback to peers.",
                "Assisted in the deployment of applications to cloud platforms (DigitalOcean)."
            ]
        },
        {
            "title": "Freelance Web Developer",
            "period": "2024 - 2025",
            "company": "Remote",
            "type": "laptop",  # for icon
            "responsibilities": [
                "Designed and developed custom websites for small businesses.",
                "Implemented SEO best practices to improve website visibility.",
                "Provided ongoing maintenance and support for clients' websites."
            ]
        },
        {
            "title": "Data Analyst Intern",
            "period": "2020 - 2021",
            "company": "Kenya Bureau of Statistics",
            "type": "graph-up",  # for icon
            "responsibilities": [
                "Assisted in data collection and analysis for national surveys.",
                "Developed data visualizations to present findings to stakeholders.",
                "Contributed to reports on economic indicators and trends."
            ]
        }
    ])
