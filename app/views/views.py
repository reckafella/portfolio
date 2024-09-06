import os.path

from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import redirect, render, get_object_or_404
import json
from django.conf import settings
from django.urls import reverse

from app.forms import BlogPostForm

from ..models import BlogPost


def home_view(request):
    """ View to render the home page """
    return render(request=request, template_name='app/home.html', status=200)


def about_view(request):
    """ View to render the about page """
    return render(request=request, template_name='app/about.html', status=200)


def contact_view(request):
    """ View to render the contact page """
    return render(request=request, template_name='app/contact.html', status=200)


def projects_view(request):
    """ View to render the projects page """
    json_file_path = os.path.join(settings.BASE_DIR, 'app', 'static', 'assets', 'data', 'projects.json')

    with open(json_file_path, 'r') as fl:
        projects_data = json.load(fl)

    context = dict(projects=projects_data)

    return render(request=request, template_name='app/projects.html', context=context, status=200)


# section defines code related to the blog

def posts_list_view(request):
    """ View to render the page listing blog posts """
    blog_post_list = BlogPost.objects.all().order_by('-created_at')

    context = dict(articles=blog_post_list)

    return render(request=request, template_name='blog/posts_list.html', context=context, status=200)


def post_detail_view(request, slug):
    """ View to render the blog post details """
    post = get_object_or_404(BlogPost, slug=slug)

    context = {
        'post': post
    }
    return render(request, 'blog/post_detail.html', context)

def author_posts_view(request, username):
    author = get_object_or_404(User, username=username)

    posts = BlogPost.objects.filter(author=author).order_by('-created_at')
    context = {
        'author': author,
        'posts': posts
    }
    return render(request, 'blog/author_posts.html', context)


@login_required
def create_post(request):
    if request.method == 'POST':
        form = BlogPostForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            content = form.cleaned_data.get('content')

            post = BlogPost.objects.create(
                title=title,
                content=content,
                author=request.user
            )

            return redirect('post_detail', slug=post.slug)
    else:
        form = BlogPostForm()
    
    context = {
        'form': form,
        'form_action_url': reverse('create_post'),
        'page_title': 'Create a New Post',
        'form_title': 'Create Post',
        'submit_text': 'Create'
    }

    return render(request, 'blog/create_post.html', {'form': form})
