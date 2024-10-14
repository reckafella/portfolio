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
            return JsonResponse(
                {'success': False,
                 'message': 'You are not authorized to create a post',
                 'redirect_url': reverse('home')})
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
    sort = request.GET.get('sort', 'date_desc')
    search_query = request.GET.get('search', '')

    order_by = {
        'date_desc': '-created_at',
        'date_asc': 'created_at',
        'title_asc': 'title',
        'title_desc': '-title',
        'author_asc': 'author__username',
        'author_desc': '-author__username',
    }.get(sort, '-created_at')
    
    blog_posts = BlogPost.objects.all()

    if search_query:
        blog_posts = blog_posts.filter(title__icontains=search_query) | blog_posts.filter(content__icontains=search_query)

    if topic != 'all':
        blog_posts = blog_posts.filter(topics__icontains=topic)

    blog_posts = blog_posts.order_by(order_by)

    all_topics = set()
    for post in BlogPost.objects.all():
        all_topics.update(post.get_topics())
    all_topics = sorted(list(all_topics))

    paginator = Paginator(blog_posts, 6)
    page = request.GET.get('page')

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        articles = paginator.page(1)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)

    sorting_options = {
        'date_desc': 'Date (Newest First)',
        'date_asc': 'Date (Oldest First)',
        'title_asc': 'Title (A-Z)',
        'title_desc': 'Title (Z-A)',
        'author_asc': 'Author (A-Z)',
        'author_desc': 'Author (Z-A)',
    }

    context = {
        'articles': articles,
        'page_title': 'Blog Posts',
        'submit_text': 'Read Article',
        'topics': all_topics,
        'current_topic': topic,
        'current_sort': sort,
        'sorting_options': sorting_options,
        'search_query': search_query,
    }

    if is_ajax(request):
        sort_html = render_to_string('blog/partials/sorting.html', context)
        posts_html = render_to_string('blog/partials/posts_list.html', context)
        pagination_html = render_to_string('blog/partials/pagination.html', context)
        topics_html = render_to_string('blog/partials/topics.html', context)
        return JsonResponse({
            'sort_html': sort_html,
            'posts_html': posts_html,
            'pagination_html': pagination_html,
            'topics_html': topics_html,
        })

    return render(request=request, template_name='blog/posts_list.html', context=context)

def author_posts_view(request, username):
    author = get_object_or_404(User, username=username)
    topic = request.GET.get('topic', 'all')
    sort = request.GET.get('sort', 'date_desc')
    search_query = request.GET.get('search', '')

    order_by = {
        'date_desc': '-created_at',
        'date_asc': 'created_at',
        'title_asc': 'title',
        'title_desc': '-title',
    }.get(sort, '-created_at')

    posts = BlogPost.objects.filter(author=author)

    if search_query:
        posts = posts.filter(title__icontains=search_query) | posts.filter(content__icontains=search_query)

    if topic != 'all':
        posts = posts.filter(topics__icontains=topic)

    posts = posts.order_by(order_by)

    all_topics = set()
    for post in BlogPost.objects.filter(author=author):
        all_topics.update(post.get_topics())
    all_topics = sorted(list(all_topics))

    paginator = Paginator(posts, 6)
    page = request.GET.get('page')

    try:
        articles = paginator.page(page)
    except PageNotAnInteger:
        articles = paginator.page(1)
    except EmptyPage:
        articles = paginator.page(paginator.num_pages)

    sorting_options = {
        'date_desc': 'Date (Newest First)',
        'date_asc': 'Date (Oldest First)',
        'title_asc': 'Title (A-Z)',
        'title_desc': 'Title (Z-A)',
    }
    context = {
        'author': author,
        'articles': articles,
        'topics': all_topics,
        'current_topic': topic,
        'current_sort': sort,
        'submit_text': 'Read Article',
        'sorting_options': sorting_options,
        'search_query': search_query,
    }

    if is_ajax(request):
        sort_html = render_to_string('blog/partials/sorting.html', context)
        posts_html = render_to_string('blog/partials/posts_list.html', context)
        pagination_html = render_to_string('blog/partials/pagination.html', context)
        topics_html = render_to_string('blog/partials/topics.html', context)
        return JsonResponse({
            'sort_html': sort_html,
            'posts_html': posts_html,
            'pagination_html': pagination_html,
            'topics_html': topics_html,
        })

    return render(request, 'blog/author_posts.html', context)

""" 
def posts_list_view(request):
    topic = request.GET.get('topic', 'all')
    sort = request.GET.get('sort', 'date_desc')

    order_by = {
        'date_desc': '-created_at',
        'date_asc': 'created_at',
        'title_asc': 'title',
        'title_desc': '-title',
        'author_asc': 'author__username',
        'author_desc': '-author__username',
    }.get(sort, '-created_at')
    
    if topic == 'all':
        blog_post_list = BlogPost.objects.all().order_by(order_by)
    else:
        blog_post_list = BlogPost.objects.filter(topics__icontains=topic).order_by(order_by)
    
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

    sorting_options = {
        'date_desc': 'Date (Newest First)',
        'date_asc': 'Date (Oldest First)',
        'title_asc': 'Title (A-Z)',
        'title_desc': 'Title (Z-A)',
        'author_asc': 'Author (A-Z)',
        'author_desc': 'Author (Z-A)',
    }

    context = {
        'articles': articles,
        'page_title': 'Blog Posts',
        'submit_text': 'Read Article',
        'topics': all_topics,
        'current_topic': topic,
        'current_sort': sort,
        'sorting_options': sorting_options,
    }

    if is_ajax(request):
        ''' topics_html = render_to_string('blog/partials/topics.html', context) '''
        sort_html = render_to_string('blog/partials/sorting.html', context)
        posts_html = render_to_string('blog/partials/posts_list.html', context)
        pagination_html = render_to_string('blog/partials/pagination.html', context)
        return JsonResponse({
            'sort_html': sort_html,
            'posts_html': posts_html,
            'pagination_html': pagination_html,
        })

    return render(request=request, template_name='blog/posts_list.html', context=context, status=200)


def author_posts_view(request, username):
    author = get_object_or_404(User, username=username)
    topic = request.GET.get('topic', 'all')
    sort = request.GET.get('sort', 'date_desc')

    order_by = {
        'date_desc': '-created_at',
        'date_asc': 'created_at',
        'title_asc': 'title',
        'title_desc': '-title',
        'author_asc': 'author__username',
        'author_desc': '-author__username',
    }.get(sort, '-created_at')

    if sort == 'date_desc':
        order_by = '-created_at'
    elif sort == 'date_asc':
        order_by = 'created_at'
    elif sort == 'title_asc':
        order_by = 'title'
    elif sort == 'title_desc':
        order_by = '-title'
    

    if topic == 'all':
        posts_list = BlogPost.objects.filter(author=author).order_by(order_by)
    else:
        posts_list = BlogPost.objects.filter(author=author, topics__icontains=topic).order_by(order_by)
    
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

    sorting_options = {
        'date_desc': 'Date (Newest First)',
        'date_asc': 'Date (Oldest First)',
        'title_asc': 'Title (A-Z)',
        'title_desc': 'Title (Z-A)',
    }
    context = {
        'author': author,
        'articles': articles,
        'topics': all_topics,
        'current_topic': topic,
        'current_sort': sort,
        'submit_text': 'Read Article',
        'sorting_options': sorting_options,
    }

    if is_ajax(request):
        ''' topics_html = render_to_string('blog/partials/topics.html', context) '''
        sort_html = render_to_string('blog/partials/sorting.html', context)
        posts_html = render_to_string('blog/partials/posts_list.html', context)
        pagination_html = render_to_string('blog/partials/pagination.html', context)
        return JsonResponse({
            'sort_html': sort_html,
            'posts_html': posts_html,
            'pagination_html': pagination_html,
        })

    return render(request, 'blog/author_posts.html', context)
 """