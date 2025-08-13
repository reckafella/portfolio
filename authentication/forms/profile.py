from django import forms
from django.contrib.auth.forms import PasswordChangeForm
from django_countries import countries
from django_countries.fields import CountryField
import json
import os

from authentication.models import Profile, SocialLinks, UserSettings


class ProfileForm(forms.ModelForm):
    # Override country field with a select dropdown
    country = forms.ChoiceField(
        choices=[('', 'Select a country')] + [(code, name) for code, name in countries],
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control form-select',
            'id': 'id_country'
        })
    )
    
    # Override city field with a select dropdown (will be populated dynamically)
    city = forms.CharField(
        required=False,
        widget=forms.Select(attrs={
            'class': 'form-control form-select',
            'id': 'id_city',
            'disabled': True  # Initially disabled until country is selected
        })
    )
    
    class Meta:
        model = Profile
        fields = ['bio', 'profile_pic', 'country',
                  'city', 'title', 'experience']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'profile_pic': forms.FileInput(attrs={'class': 'form-control'}),
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'experience': forms.TextInput(attrs={'class': 'form-control'})
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # If we have an instance with a city, we need to populate the city choices
        if self.instance and self.instance.pk and self.instance.country and self.instance.city:
            self.fields['city'].widget.attrs['disabled'] = False
            # Load cities for the current country
            cities = self.get_cities_for_country(self.instance.country)
            self.fields['city'].widget = forms.Select(
                choices=[('', 'Select a city')] + cities,
                attrs={
                    'class': 'form-control form-select',
                    'id': 'id_city'
                }
            )
    
    def get_cities_for_country(self, country_code):
        """
        Get cities for a given country code.
        This is a simplified implementation - you can enhance it with a proper cities database.
        """
        # Path to cities data file
        cities_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'cities.json')
        
        try:
            if os.path.exists(cities_file):
                with open(cities_file, 'r', encoding='utf-8') as f:
                    cities_data = json.load(f)
                    country_cities = cities_data.get(country_code, [])
                    return [(city, city) for city in country_cities]
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        
        # Fallback to common cities if data file doesn't exist
        common_cities = {
            'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
            'GB': ['London', 'Birmingham', 'Liverpool', 'Sheffield', 'Bristol', 'Glasgow', 'Leicester', 'Edinburgh', 'Leeds', 'Cardiff'],
            'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
            'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
            'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
            'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
            'IT': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania'],
            'ES': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'],
            'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama'],
            'CN': ['Shanghai', 'Beijing', 'Chongqing', 'Tianjin', 'Guangzhou', 'Shenzhen', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing'],
            'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'],
            'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia'],
            'MX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'Mérida'],
            'RU': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don'],
            'ZA': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Polokwane', 'Pietermaritzburg', 'Kimberley'],
            'NG': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos'],
            'KE': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'],
        }
        
        cities = common_cities.get(country_code, [])
        return [(city, city) for city in cities]


class SocialLinksForm(forms.ModelForm):
    class Meta:
        model = SocialLinks
        exclude = ['profile', 'created_at', 'updated_at']
        widgets = {
            'twitter_x': forms.URLInput(attrs={'class': 'form-control'}),
            'facebook': forms.URLInput(attrs={'class': 'form-control'}),
            'instagram': forms.URLInput(attrs={'class': 'form-control'}),
            'linkedin': forms.URLInput(attrs={'class': 'form-control'}),
            'github': forms.URLInput(attrs={'class': 'form-control'}),
            'youtube': forms.URLInput(attrs={'class': 'form-control'}),
            'tiktok': forms.URLInput(attrs={'class': 'form-control'}),
            'website': forms.URLInput(attrs={'class': 'form-control'}),
            'whatsapp': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        for field in self.fields:
            if cleaned_data.get(field) and not cleaned_data['whatsapp'] and\
                    not cleaned_data[field].startswith(('http://', 'https://')):
                raise forms.ValidationError(
                    f'{field} must start with http:// or https://')

        # remove + from whatsapp number if present
        whatsapp = cleaned_data.get('whatsapp')
        if whatsapp and whatsapp.startswith('+'):
            cleaned_data['whatsapp'] = whatsapp[1:].replace(' ', '')

        if 'whatsapp' in cleaned_data and cleaned_data['whatsapp']:
            if not cleaned_data['whatsapp'].isdigit():
                raise forms.ValidationError('WhatsApp number must be numeric.')

        return cleaned_data


class UserPasswordChangeForm(PasswordChangeForm):
    old_password = forms.CharField(label='Old Password', required=True,
                                   min_length=8, max_length=64,
                                   widget=forms.PasswordInput(
                                       attrs={'class': 'form-control'}))

    new_password1 = forms.CharField(label='New Password', required=True,
                                    min_length=8, max_length=64,
                                    widget=forms.PasswordInput(
                                        attrs={'class': 'form-control'}))

    new_password2 = forms.CharField(label='Confirm New Password',
                                    required=True, min_length=8, max_length=64,
                                    widget=forms.PasswordInput(
                                        attrs={'class': 'form-control'}))

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(user, *args, **kwargs)

    def clean_old_password(self):
        old_password = self.cleaned_data.get('old_password')
        if not self.user.check_password(old_password):
            raise forms.ValidationError('Old password is incorrect.')
        return old_password

    def clean(self):
        cleaned_data = super().clean()
        new_password1 = cleaned_data.get('new_password1')
        new_password2 = cleaned_data.get('new_password2')
        if new_password1 and new_password2 and new_password1 != new_password2:
            raise forms.ValidationError('New passwords do not match.')
        return cleaned_data

    def save(self, commit=True):
        new_password = self.cleaned_data.get('new_password1')
        self.user.set_password(new_password)
        if commit:
            self.user.save()
        return self.user


class UserSettingsForm(forms.ModelForm):
    class Meta:
        model = UserSettings
        exclude = ['user']
        widgets = {
            'changes_notifications': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}),
            'new_products_notifications': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}),
            'marketing_notifications': forms.CheckboxInput(
                attrs={'class': 'form-check-input'}),
            'security_notifications': forms.CheckboxInput(
                attrs={'class': 'form-check-input', 'disabled': True}),
        }
