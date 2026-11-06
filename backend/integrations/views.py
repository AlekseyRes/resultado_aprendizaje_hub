from drf_yasg.utils import swagger_auto_schema
from requests.exceptions import RequestException
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from zeep.exceptions import Error as ZeepError

from . import services


def _error_response():
    return Response(
        {'detail': 'The SOAP service is unavailable. Please try again later.'},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


class ContinentListView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(tags=['SOAP'])
    def get(self, request):
        try:
            results = services.list_continents()
        except (ZeepError, RequestException, OSError):
            return _error_response()
        return Response({'source': services.SOURCE, 'results': results})


class CountryListView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(tags=['SOAP'])
    def get(self, request):
        try:
            results = services.list_countries()
        except (ZeepError, RequestException, OSError):
            return _error_response()
        return Response({'source': services.SOURCE, 'results': results})


class CountryDetailView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(tags=['SOAP'])
    def get(self, request, iso_code):
        try:
            result = services.country_info(iso_code)
        except (ZeepError, RequestException, OSError):
            return _error_response()
        return Response(result)
