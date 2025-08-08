from cloudinary.models import CloudinaryField
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    experience = models.CharField(max_length=50, blank=True, null=True)
    profile_pic = CloudinaryField('image', blank=True, null=True)
    cloudinary_image_id = models.CharField(max_length=255, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class SocialLinks(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE,
                                related_name='social_media')
    twitter_x = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    tiktok = models.URLField(blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    changes_notifications = models.BooleanField(default=True)
    new_products_notifications = models.BooleanField(default=True)
    marketing_notifications = models.BooleanField(default=False)
    security_notifications = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s settings"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class UserProfileImage(models.Model):
    profile = models.OneToOneField(Profile, on_delete=models.CASCADE)
    profile_pic = CloudinaryField('image', null=True, blank=True)
    cloudinary_image_id = models.CharField(max_length=255, blank=True,
                                           null=True)
    cloudinary_image_url = models.URLField(blank=True, null=True)
    optimized_image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.profile.user.username}'s profile image"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create a Profile instance when a new User is created
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Save the Profile instance when the User is saved
    """
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=Profile)
def create_social_links(sender, instance, created, **kwargs):
    """
    Create a SocialLinks instance when a new Profile is created
    """
    if created:
        SocialLinks.objects.create(profile=instance)


@receiver(post_save, sender=Profile)
def create_user_settings(sender, instance, created, **kwargs):
    """
    Create a UserSettings instance when a new Profile is created
    """
    if created:
        UserSettings.objects.create(user=instance.user)


@receiver(post_save, sender=Profile)
def create_user_profile_image(sender, instance, created, **kwargs):
    """
    Create a UserProfileImage instance when a new Profile is created
    """
    if created:
        UserProfileImage.objects.create(profile=instance)
    else:
        # Ensure the UserProfileImage is updated if the Profile already exists
        try:
            instance.userprofileimage.save()
        except UserProfileImage.DoesNotExist:
            UserProfileImage.objects.create(profile=instance)
        except Exception as e:
            raise Exception(f"Error updating UserProfileImage: {e}")
