from django.core.management.base import BaseCommand
from django.db import transaction
from app.models import Profile, Education, Experience, Skill


class Command(BaseCommand):
    help = 'Seed the database with initial about page data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update existing data',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        with transaction.atomic():
            # Create or update profile
            profile, created = Profile.objects.get_or_create(
                defaults={
                    'name': 'Ethan Wanyoike',
                    'title': 'Software Engineer',
                    'location': 'Nairobi, Kenya',
                    'email': 'ethanmuthoni@gmail.com',
                    'phone': '',
                    'summary': (
                        'A software engineer with a passion for building scalable applications and improving user '
                        'experiences. Experienced in both frontend and backend development, and always eager to '
                        'learn new technologies and improve my skills.'
                    )
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS('✓ Profile created successfully'))
            else:
                if force:
                    profile.name = 'Ethan Wanyoike'
                    profile.title = 'Software Engineer'
                    profile.location = 'Nairobi, Kenya'
                    profile.email = 'ethanmuthoni@gmail.com'
                    profile.summary = (
                        'A software engineer with a passion for building scalable applications and improving user '
                        'experiences. Experienced in both frontend and backend development, and always eager to '
                        'learn new technologies and improve my skills.'
                    )
                    profile.save()
                    self.stdout.write(self.style.SUCCESS('✓ Profile updated successfully'))
                else:
                    self.stdout.write(self.style.WARNING('✓ Profile already exists (use --force to update)'))

            # Create education entries
            education_data = [
                {
                    'degree': 'Full-stack Software Engineering',
                    'period': '2023 - 2024',
                    'institution': 'ALX Africa, Kenya',
                    'description': (
                        'Completed a comprehensive software engineering program covering full-stack development, '
                        'DevOps practices, and cloud computing. Projects included web applications, RESTful APIs, and '
                        'deployment pipelines.'
                    ),
                    'order': 0
                },
                {
                    'degree': 'Bachelor of Science in Economics & Statistics',
                    'period': '2016 - 2020',
                    'institution': 'Maasai Mara University, Kenya',
                    'description': (
                        'Graduated with a Second Class Honours degree specializing in Data Science and Analytics. '
                        'Completed a thesis on "Predictive Analytics in the Banking Sector".'
                    ),
                    'order': 1
                }
            ]

            for edu_data in education_data:
                edu, created = Education.objects.get_or_create(
                    degree=edu_data['degree'],
                    institution=edu_data['institution'],
                    defaults={
                        'period': edu_data['period'],
                        'description': edu_data['description'],
                        'order': edu_data['order'],
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✓ Education entry created: {edu_data["degree"]}'))
                elif force:
                    edu.period = edu_data['period']
                    edu.description = edu_data['description']
                    edu.order = edu_data['order']
                    edu.is_active = True
                    edu.save()
                    self.stdout.write(self.style.SUCCESS(f'✓ Education entry updated: {edu_data["degree"]}'))

            # Create skills
            skills_data = [
                'Python', 'Django', 'JavaScript', 'Git', 'TypeScript', 'Bootstap',
                'Nodejs', 'C', 'Bash', 'SQL', 'Docker', 'REST APIs'
            ]

            for i, skill_name in enumerate(skills_data):
                skill, created = Skill.objects.get_or_create(
                    name=skill_name,
                    defaults={
                        'category': 'Technical Skills',
                        'proficiency_level': 3,  # Advanced
                        'order': i,
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✓ Skill created: {skill_name}'))
                elif force:
                    skill.category = 'Technical Skills'
                    skill.proficiency_level = 3
                    skill.order = i
                    skill.is_active = True
                    skill.save()
                    self.stdout.write(self.style.SUCCESS(f'✓ Skill updated: {skill_name}'))

            # Create experience entries
            experience_data = [
                {
                    'title': 'Software Engineer',
                    'period': 'Apr. 2024 - Present',
                    'company': 'Alphaflare Ltd',
                    'icon_type': 'building',
                    'responsibilities': [
                        'Developed and maintained web applications using Django and JavaScript.',
                        'Collaborated with cross-functional teams to design and implement new features.',
                        'Participated in code reviews and provided constructive feedback to peers.',
                        'Assisted in the deployment of applications to cloud platforms (DigitalOcean).'
                    ],
                    'order': 0
                },
                {
                    'title': 'Freelance Web Developer',
                    'period': '2024 - 2025',
                    'company': 'Remote',
                    'icon_type': 'laptop',
                    'responsibilities': [
                        'Designed and developed custom websites for small businesses.',
                        'Implemented SEO best practices to improve website visibility.',
                        'Provided ongoing maintenance and support for clients\' websites.'
                    ],
                    'order': 1
                },
                {
                    'title': 'Data Analyst Intern',
                    'period': '2020 - 2021',
                    'company': 'Kenya Bureau of Statistics',
                    'icon_type': 'graph-up',
                    'responsibilities': [
                        'Assisted in data collection and analysis for national surveys.',
                        'Developed data visualizations to present findings to stakeholders.',
                        'Contributed to reports on economic indicators and trends.'
                    ],
                    'order': 2
                }
            ]

            for exp_data in experience_data:
                exp, created = Experience.objects.get_or_create(
                    title=exp_data['title'],
                    company=exp_data['company'],
                    defaults={
                        'period': exp_data['period'],
                        'icon_type': exp_data['icon_type'],
                        'responsibilities': exp_data['responsibilities'],
                        'order': exp_data['order'],
                        'is_active': True
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✓ Experience entry created: {exp_data["title"]}'))
                elif force:
                    exp.period = exp_data['period']
                    exp.icon_type = exp_data['icon_type']
                    exp.responsibilities = exp_data['responsibilities']
                    exp.order = exp_data['order']
                    exp.is_active = True
                    exp.save()
                    self.stdout.write(self.style.SUCCESS(f'✓ Experience entry updated: {exp_data["title"]}'))

        self.stdout.write(self.style.SUCCESS('\n🎉 About page data seeding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('✨ You can now manage your about page data via the admin interface.'))
