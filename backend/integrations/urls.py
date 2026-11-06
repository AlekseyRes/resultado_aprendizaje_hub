from django.urls import path

from .views import ContinentListView, CountryDetailView, CountryListView

app_name = 'integrations'

urlpatterns = [
    path('soap/continents/', ContinentListView.as_view(), name='soap-continents'),
    path('soap/countries/', CountryListView.as_view(), name='soap-countries'),
    path(
        'soap/countries/<str:iso_code>/',
        CountryDetailView.as_view(),
        name='soap-country-detail',
    ),
]
