from titlecase import titlecase
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render, get_object_or_404
from django.utils.text import slugify
from ..helpers import is_ajax
from django.urls import reverse

from app.forms import BlogPostForm
from app.models import BlogPost

# section defines code related to the blog

def posts_list_view(request):
    """ View to render the page listing blog posts """
    blog_post_list = BlogPost.objects.all().order_by('-created_at')

    context = dict(
        articles=blog_post_list,
        page_title='Blog Posts',
        submit_text='Read Article'
    )

    return render(request=request, template_name='blog/posts_list.html', context=context, status=200)


def post_detail_view(request, slug):
    """ View to render the blog post details """
    post = get_object_or_404(BlogPost, slug=slug)
    
    other_posts = BlogPost.objects.filter(author=post.author).exclude(id=post.id).order_by('-created_at')[:5]


    context = {
        'post': post,
        'other_posts': other_posts
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
