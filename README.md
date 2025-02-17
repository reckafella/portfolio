# Portfolio

This is my personal website built using Django and Bootstrap. It showcases my projects, skills, and provides a way to contact me.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About

This project is a personal portfolio website that highlights my skills, projects, and provides a platform for visitors to contact me. It includes sections for featured projects, latest blog posts, skills & technologies, and a call to action for collaboration.

## Features

- Responsive design using Bootstrap
- Dynamic content management with Django
- Integration with Cloudinary for image hosting
- User authentication and authorization
- Admin panel for managing projects and messages
- Sitemap and robots.txt for SEO

## Technologies Used

- **Frontend:**
  - HTML
  - CSS
  - JavaScript
  - Bootstrap

- **Backend:**
  - Django
  - Wagtail CMS

- **Database:**
  - SQLite (development)
  - PostgreSQL (production)

- **Other Tools:**
  - Cloudinary (image hosting)
  - AOS (Animate On Scroll)
  - Swiper (carousel)

## Setup and Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/reckafella/portfolio.git
    cd portfolio
    ```

2. Create and activate a virtual environment:

    ```sh
    python3 -m venv .env
    source .env/bin/activate
    ```

3. Install the dependencies:

    ```sh
    pip install -r requirements.txt
    ```
   
4. Create a cloudinary account (used for image hosting)
   - Copy the required details: name, api key and api secret into a file named "cloudinary.json"
     - "CLOUDINARY_CLOUD_NAME": "your cloudinary name",
     - "CLOUDINARY_API_KEY": "your cloudinary api key",
     - "CLOUDINARY_API_SECRET": "your cloudinary api secret"

   - These credentials are used for local development only

   - If you're hosting your project on platforms like [Render](https://render.com),
   you will need to store these credentials as environment variable

   - For hosting on Render, you need [Render](https://render.com) & [Supabase](https://supabase.com) accounts.
     - Use your GitHub account to create these accounts.
     - With these accounts set up, create a new project on Render and import code from GitHub.

   - Credentials to store in Render environment
     - SUPABASE_URL
     - SUPABASE_USER
     - SUPABASE_HOST
     - SUPABASE_PORT
     - SUPABASE_DB_PW
     - SUPABASE_DB_NAME
     - ENVIRONMENT set to "production"
     - plus the cloudinary details listed above
   - the file [render.yaml](./render.yaml) is used for running your project hosted on Render.

   - NOTE: You need to learn how to host your project on Render and how to create cloudinary details for image hosting.
5. Apply database migrations:

    ```sh
    python manage.py makemigrations
    python manage.py migrate
    ```

6. Create a superuser:

    ```sh
    python manage.py createsuperuser
    ```

7. Collect static files:

    ```sh
    python manage.py collectstatic
    ```

8. Run the development server:

    ```sh
    python manage.py runserver
    ```

## Usage

- Access the website at <http://127.0.0.1:8000/>

- Admin panel is available at <http://127.0.0.1:8000/admin/>

- Wagtail admin panel is available at <http://127.0.0.1:8000/cms/admin/>

- **Note: My website is available at <https://rohn.live> or <https://ethanmuthoni.me>**

## Project Structure

```markdown

portfolio/
├── app/
│   ├── migrations/
│   ├── static/
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   ├── images/
│   │   │   ├── vendor/
│   │   └── ...
│   ├── templates/
│   │   ├── app/
│   │   │   ├── base.html
│   │   │   ├── home.html
│   │   │   ├── projects/
│   │   │   └── ...
│   ├── views/
│   │   ├── projects/
│   │   └── ...
│   ├── forms.py
│   ├── models.py
│   ├── urls.py
│   └── ...
├── blog/
├── media/
├── .vscode/
├── .gitignore
├── README.md
├── manage.py
├── requirements.txt
└── ...

```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

- **Email:** [Ethan](mailto:ethanmuthoni@gmail.com)
- **LinkedIn:** [Ethan Wanyoike](https://www.linkedin.com/in/ethanwanyoike)
- **GitHub:** [reckafella](https://github.com/reckafella)
- **Facebook:** [@reckafella](https://facebook.com/reckafella)
- **Twitter/X:** [@devrohn](https://x.com/devrohn)
