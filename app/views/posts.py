from titlecase import titlecase
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.template.loader import render_to_string
from django.shortcuts import redirect, render, get_object_or_404
from django.utils.text import slugify
from app.helpers import is_ajax
from django.urls import reverse

from app.forms import BlogPostForm
from app.models import BlogPost

# section defines code related to the blog


def post_detail_view(request, slug):
    """ View to render the blog post details """
    post = get_object_or_404(BlogPost, slug=slug)
    
    other_posts = BlogPost.objects.filter(author=post.author).exclude(id=post.id).order_by('-created_at')[:5]


    context = {
        'post': post,
        'other_posts': other_posts
    }
    return render(request, 'blog/post_detail.html', context)



@login_required
def create_post(request):
    if not request.user.is_staff:
        if is_ajax(request):
            return JsonResponse({'success': False, 'message': 'You are not authorized to create a post'})
        return redirect('home')

    if request.method == 'POST':
        form = BlogPostForm(request.POST)
        if form.is_valid():
            title = titlecase(form.cleaned_data.get('title'))
            content = form.cleaned_data.get('content')

            post = BlogPost.objects.create(
                title=title,
                content=content,
                author=request.user
            )
            if not post.slug:
                post.slug = slugify(post.title)
                post.save()

            if is_ajax(request):
                response = {
                    'success': True,
                    'message': 'Post created successfully',
                    'redirect_url': reverse('post_detail', args=[post.slug])
                }
                return JsonResponse(response)

            return redirect('post_detail', slug=post.slug)
    else:
        form = BlogPostForm()
    
    context = {
        'form': form,
        'page_title': 'Create a New Post',
        'form_title': 'Create Post',
        'submit_text': 'Create',
        'author': request.user
    }

    return render(request, 'blog/create_post.html', context)




def posts_list_view(request):
    topic = request.GET.get('topic', 'all')
    
    if topic == 'all':
        blog_post_list = BlogPost.objects.all().order_by('-created_at')
    else:
        blog_post_list = BlogPost.objects.filter(topics__icontains=topic).order_by('-created_at')
    
    all_topics = set()
    for post in BlogPost.objects.all():
        all_topics.update(post.get_topics())
    all_topics = sorted(list(all_topics))

    paginator = Paginator(blog_post_list, 6)
    page = request.GET.get('page')

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        articles = paginator.page(1)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)

    context = {
        'articles': articles,
        'page_title': 'Blog Posts',
        'submit_text': 'Read Article',
        'topics': all_topics,
        'current_topic': topic
    }

    if is_ajax(request):
        posts_html = render_to_string('blog/partials/posts_list.html', context)
        pagination_html = render_to_string('blog/partials/pagination.html', context)
        return JsonResponse({
            'posts_html': posts_html,
            'pagination_html': pagination_html,
        })

    return render(request=request, template_name='blog/posts_list.html', context=context, status=200)


def author_posts_view(request, username):
    author = get_object_or_404(User, username=username)
    topic = request.GET.get('topic', 'all')
    
    if topic == 'all':
        posts_list = BlogPost.objects.filter(author=author).order_by('-created_at')
    else:
        posts_list = BlogPost.objects.filter(author=author, topics__icontains=topic).order_by('-created_at')
    
    all_topics = set()
    for post in BlogPost.objects.filter(author=author):
        all_topics.update(post.get_topics())
    all_topics = sorted(list(all_topics))

    paginator = Paginator(posts_list, 6)
    page = request.GET.get('page')

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        articles = paginator.page(1)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)

    context = {
        'author': author,
        'articles': articles,
        'topics': all_topics,
        'current_topic': topic,
        'submit_text': 'Read Article',
    }

    if is_ajax(request):
        posts_html = render_to_string('blog/partials/posts_list.html', context)
        pagination_html = render_to_string('blog/partials/pagination.html', context)
        return JsonResponse({
            'posts_html': posts_html,
            'pagination_html': pagination_html,
        })

    return render(request, 'blog/author_posts.html', context)

""" 
def posts_list_view(request):
    ''' View to render the page listing blog posts '''
    topic = request.GET.get('topic', 'all')
    
    if topic == 'all':
        blog_post_list = BlogPost.objects.all().order_by('-created_at')
    else:
        blog_post_list = BlogPost.objects.filter(topics__icontains=topic).order_by('-created_at')
    
    # Get all unique topics
    all_topics = set()
    for post in BlogPost.objects.all():
        all_topics.update(post.get_topics())
    all_topics = sorted(list(all_topics))

    paginator = Paginator(blog_post_list, 6)  # Show 6 posts per page
    page = request.GET.get('page')

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        articles = paginator.page(1)
    except EmptyPage:
        # If page is out of range, deliver last page of results.
        articles = paginator.page(paginator.num_pages)

    context = {
        'articles': articles,
        'page_title': 'Blog Posts',
        'submit_text': 'Read Article',
        'topics': all_topics,
        'current_topic': topic
    }

    return render(request=request, template_name='blog/posts_list.html', context=context, status=200)


def author_posts_view(request, username):
    author = get_object_or_404(User, username=username)
    topic = request.GET.get('topic', 'all')
    
    if topic == 'all':
        posts_list = BlogPost.objects.filter(author=author).order_by('-created_at')
    else:
        posts_list = BlogPost.objects.filter(author=author, topics__icontains=topic).order_by('-created_at')
    
    # Get all unique topics for this author's posts
    all_topics = set()
    for post in BlogPost.objects.filter(author=author):
        all_topics.update(post.get_topics())
    all_topics = sorted(list(all_topics))

    paginator = Paginator(posts_list, 6)  # Show 6 posts per page
    page = request.GET.get('page')

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        posts = paginator.page(1)
    except EmptyPage:
        # If page is out of range, deliver last page of results.
        posts = paginator.page(paginator.num_pages)

    context = {
        'author': author,
        'posts': posts,
        'topics': all_topics,
        'current_topic': topic
    }
    return render(request, 'blog/author_posts.html', context)
def author_posts_view(request, username):
    author = get_object_or_404(User, username=username)
    posts_list = BlogPost.objects.filter(author=author).order_by('-created_at')
    paginator = Paginator(posts_list, 6)  # Show 6 posts per page
    page = request.GET.get('page')

    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        posts = paginator.page(1)
    except EmptyPage:
        # If page is out of range, deliver last page of results.
        posts = paginator.page(paginator.num_pages)

    context = {
        'author': author,
        'posts': posts
    }
    return render(request, 'blog/author_posts.html', context)


def posts_list_view(request):
    View to render the page listing blog posts
    blog_post_list = BlogPost.objects.all().order_by('-created_at')
    paginator = Paginator(blog_post_list, 6)  # Show 6 posts per page
    page = request.GET.get('page')

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        articles = paginator.page(1)
    except EmptyPage:
        # If page is out of range, deliver last page of results.
        articles = paginator.page(paginator.num_pages)

    context = {
        'articles': articles,
        'page_title': 'Blog Posts',
        'submit_text': 'Read Article'
    }

    return render(request=request, template_name='blog/posts_list.html', context=context, status=200)
 """