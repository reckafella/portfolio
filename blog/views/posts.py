from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse, reverse_lazy
from titlecase import titlecase
import random

from blog.forms import BlogPostForm
from blog.models import BlogPost
from app.helpers import is_ajax, upload_image_to_cloudflare, delete_image_from_cloudflare


class PostDetailView(DetailView):
    model = BlogPost
    template_name = 'blog/post_detail.html'
    context_object_name = 'post'

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(published=True)
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.get_object()
        context['other_posts'] = BlogPost.objects.filter(author=post.author).exclude(id=post.id).order_by('-created_at')[:random.randint(3, 5)]
        return context


class PostCreateView(LoginRequiredMixin, UserPassesTestMixin, CreateView):
    model = BlogPost
    form_class = BlogPostForm
    template_name = 'blog/create_post.html'
    context_object_name = 'view'
    success_url = reverse_lazy('blog:post_list')

    def form_valid(self, form):
        form.instance.author = self.request.user
        form.instance.title = titlecase(form.instance.title)
        if not self.test_func():
            if is_ajax(self.request):
                return JsonResponse({
                    'success': False,
                    'message': 'You are not authorized to create a post',
                    'redirect_url': reverse('app:home')
                })
            return redirect('app:home')
        
        # Upload cover image to Cloudflare if it exists in the form
        cover_image = form.files.get('cover_image')
        if cover_image:
            try:
                image_id, image_url = upload_image_to_cloudflare(cover_image)
                form.instance.cloudflare_image_id = image_id
                form.instance.cloudflare_image_url = image_url
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'message': f'Image upload failed: {str(e)}'
                })

        return super().form_valid(form)

    def test_func(self):
        return self.request.user.is_staff

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Create New Post'
        return context

    def get_success_url(self):
        return reverse_lazy('blog:post_detail', kwargs={'slug': self.object.slug})


class PostListView(ListView):
    model = BlogPost
    template_name = 'blog/posts_list.html'
    context_object_name = 'articles'
    paginate_by = 6

    def get_queryset(self):
        topic = self.request.GET.get('topic', 'all')
        sort = self.request.GET.get('sort', 'date_desc')
        search_query = self.request.GET.get('search', '')

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

        return blog_posts.order_by(order_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        articles = self.get_queryset()
        context['page_title'] = 'Blog Posts'
        context['submit_text'] = 'Read Article'
        context['topics'] = (
            sorted(set(topic.strip() for post in articles for topic in post.get_topics())) 
            if articles.exists() else []
        )
        context['current_topic'] = self.request.GET.get('topic', 'all')
        context['current_sort'] = self.request.GET.get('sort', 'date_desc')
        context['sorting_options'] = {
            'date_desc': 'Date (Newest First)',
            'date_asc': 'Date (Oldest First)',
            'title_asc': 'Title (A-Z)',
            'title_desc': 'Title (Z-A)',
            'author_asc': 'Author (A-Z)',
            'author_desc': 'Author (Z-A)',
        }
        context['search_query'] = self.request.GET.get('search', '')
        context['all_authors'] = True
        return context


class AuthorPostsView(ListView):
    model = BlogPost
    template_name = 'blog/posts_list.html'
    context_object_name = 'articles'
    paginate_by = 6

    def get_queryset(self):
        self.author = get_object_or_404(User, username=self.kwargs['username'])
        topic = self.request.GET.get('topic', 'all')
        sort = self.request.GET.get('sort', 'date_desc')
        search_query = self.request.GET.get('search', '')

        order_by = {
            'date_desc': '-created_at',
            'date_asc': 'created_at',
            'title_asc': 'title',
            'title_desc': '-title',
        }.get(sort, '-created_at')

        posts = BlogPost.objects.filter(author=self.author)

        if search_query:
            posts = posts.filter(title__icontains=search_query) | posts.filter(content__icontains=search_query)

        if topic != 'all':
            posts = posts.filter(topics__icontains=topic)

        return posts.order_by(order_by)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['author'] = self.author
        context['page_title'] = 'Blog Posts'
        context['topics'] = sorted(set(topic.strip() for post in BlogPost.objects.filter(author=self.author) for topic in post.get_topics()))
        context['current_topic'] = self.request.GET.get('topic', 'all')
        context['current_sort'] = self.request.GET.get('sort', 'date_desc')
        context['sorting_options'] = {
            'date_desc': 'Date (Newest First)',
            'date_asc': 'Date (Oldest First)',
            'title_asc': 'Title (A-Z)',
            'title_desc': 'Title (Z-A)',
        }
        context['submit_text'] = 'Read Article'
        context['search_query'] = self.request.GET.get('search', '')
        context['all_authors'] = False
        return context


class PostUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = BlogPost
    form_class = BlogPostForm
    template_name = 'blog/create_post.html'

    def form_valid(self, form):
        cover_image = form.files.get('cover_image')
        post = form.instance
        post.title = titlecase(post.title)

        # Delete the old image from Cloudflare if a new image is being uploaded
        if cover_image and post.cloudflare_image_id:
            delete_image_from_cloudflare(post.cloudflare_image_id)

        # Upload new image to Cloudflare
        if cover_image:
            try:
                image_id, image_url = upload_image_to_cloudflare(cover_image)
                post.cloudflare_image_id = image_id
                post.cloudflare_image_url = image_url
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'message': f'Image upload failed: {str(e)}'
                })

        return super().form_valid(form)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff

    def get_success_url(self):
        return reverse_lazy('blog:post_detail', kwargs={'slug': self.object.slug})

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = f'Edit Post: {self.object.title}'
        return context


class PostDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = BlogPost
    template_name = 'blog/deletion/confirm_delete.html'
    success_url = reverse_lazy('blog:post_list')

    def delete(self, request, *args, **kwargs):
        post = self.get_object()
        
        # Delete image from Cloudflare if it exists
        if post.cloudflare_image_id:
            delete_image_from_cloudflare(post.cloudflare_image_id)

        return super().delete(request, *args, **kwargs)

    def test_func(self):
        post = self.get_object()
        return self.request.user == post.author or self.request.user.is_staff
