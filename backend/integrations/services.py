"""SOAP service client for the public CountryInfoService."""

from functools import lru_cache

from zeep import Client

WSDL = (
    'http://webservices.oorsprong.org/websamples.countryinfo/'
    'CountryInfoService.wso?WSDL'
)
SOURCE = 'webservices.oorsprong.org'


@lru_cache(maxsize=1)
def get_client():
    """Return a cached zeep client for the CountryInfoService WSDL."""
    return Client(WSDL)


def list_continents():
    """Return the list of continents exposed by the SOAP service."""
    response = get_client().service.ListOfContinentsByName()
    return [
        {'code': continent.sCode, 'name': continent.sName}
        for continent in response
    ]


def list_countries():
    """Return the list of countries with their ISO codes."""
    response = get_client().service.ListOfCountryNamesByCode()
    return [
        {'iso_code': country.sISOCode, 'name': country.sName}
        for country in response
    ]


def country_info(iso_code):
    """Return detailed information for a country given its ISO code."""
    info = get_client().service.FullCountryInfo(iso_code)

    languages = []
    if info.Languages is not None:
        languages = [
            language.sName for language in (info.Languages.tLanguage or [])
        ]

    return {
        'name': info.sName,
        'capital': info.sCapitalCity,
        'phone_code': info.sPhoneCode,
        'continent_code': info.sContinentCode,
        'currency_code': info.sCurrencyISOCode,
        'flag_url': info.sCountryFlag,
        'languages': languages,
    }
