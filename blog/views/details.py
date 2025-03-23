import random

from django.db.models import Q
from django.urls import reverse_lazy
from django.views.generic import DetailView

from blog.models import BlogPostPage
from blog.forms import BlogPostForm


class PostDetailView(DetailView):
    model = BlogPostPage
    form_class = BlogPostForm
    template_name = "blog/post_details.html"
    context_object_name = "post"

    def get_queryset(self):
        queryset = super().get_queryset()

        # If user is not authenticated, show only published posts
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(live=True)

        # If user is authenticated but not the author or staff
        elif not self.request.user.is_staff:
            queryset = queryset.filter(Q(live=True) | Q(author=self.request.user))
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        post = self.get_object()
        posts = self.get_queryset()

        # Only show other (unpublished) posts by the same author if:
        # 1. The post is published, OR
        # 2. The current user is the author, OR
        # 3. The current user is staff
        can_view_other_posts = (
            post.published
            or self.request.user == post.author
            or (self.request.user.is_authenticated and self.request.user.is_staff)
        )

        if can_view_other_posts:
            query = Q(author=post.author) & ~Q(id=post.id) & Q(live=True)
            if self.request.user.is_authenticated:
                query |= Q(author=self.request.user)
            if self.request.user.is_authenticated and self.request.user.is_staff:
                # Assuming unpublished posts should be visible to staff
                query |= Q(live=False)

            context["other_posts"] = (
                BlogPostPage.objects.filter(query)
                .exclude(id=post.id)
                .order_by("-first_published_at")[: random.randint(3, 5)]
            )
        else:
            context["other_posts"] = []
        
        context["post_topics"] = post.get_topics()
        context["all_topics"] = self.add_topics(posts)
        context["form"] = self.form_class(instance=post)
        context['page_title'] = f'Update: {post.title}'
        context['submit_text'] = 'Update Post'
        context['action_url'] = reverse_lazy('blog:update_article', kwargs={'slug': post.slug})

        return context
    
    def add_topics(self, articles):
        """ Returns a list of tuples for all topics in the queryset + total number of articles for each article """
        if not articles.exists():
            return []
        topics = set(topic.strip() for post in articles for topic in post.get_topics())
        return sorted([(topic, articles.filter(topics__icontains=topic).count()) for topic in topics])
        
