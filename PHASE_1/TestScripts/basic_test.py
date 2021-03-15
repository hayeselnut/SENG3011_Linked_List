import requests
import pytest
import json

from environment import URL

def test_no_start_date():
    end_date = '2020-01-01T06:00:00'
    location = 'Japan'
    key_term = 'COVID-19'

    req = requests.get('{}?&end_date={}&location={}&key_term={}'.format(URL, end_date, location, key_term))

    assert(req.request.method == "GET")
    assert(req.status_code == 400)
    assert(not req.ok)

def test_no_end_date():
    start_date = '2020-01-01T06:00:00'
    location = 'Japan'
    key_term = 'COVID-19'

    req = requests.get('{}?&start_date={}&location={}&key_term={}'.format(URL, start_date, location, key_term))

    assert(req.request.method == "GET")
    assert(req.status_code == 400)
    assert(not req.ok)

def test_one_day():
    start_date = "2020-02-01T23:59:59"
    end_date = "2020-02-02T23:59:59"
    req = requests.get('{}?start_date={}&end_date={}'.format(URL, start_date, end_date))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_one_week():
    start_date = "2020-02-01T23:59:59"
    end_date = "2020-02-07T23:59:59"
    req = requests.get('{}?start_date={}&end_date={}'.format(URL, start_date, end_date))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_one_month():
    start_date = "2020-02-01T23:59:59"
    end_date = "2020-03-01T23:59:59"
    req = requests.get('{}?start_date={}&end_date={}'.format(URL, start_date, end_date))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_one_year():
    start_date = "2020-02-01T23:59:59"
    end_date = "2021-02-01T23:59:59"
    req = requests.get('{}?start_date={}&end_date={}'.format(URL, start_date, end_date))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_no_location():
    start_date = '2020-01-01T06:00:00'
    end_date = '2021-03-01T06:00:00'
    key_term = 'COVID-19'

    req = requests.get('{}?start_date={}&end_date={}&key_term={}'.format(URL, start_date, end_date, key_term))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_no_key_1():
    start_date = '2020-01-01T06:00:00'
    end_date = '2021-03-01T06:00:00'
    location = 'Japan'

    req = requests.get('{}?start_date={}&end_date={}&location={}'.format(URL, start_date, end_date, location))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_no_key_2():
    start_date = '2020-01-01T06:00:00'
    end_date = '2021-03-01T06:00:00'
    location = 'Wuhan'

    req = requests.get('{}?start_date={}&end_date={}&location={}'.format(URL, start_date, end_date, location))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_only_time():
    start_date = '2020-01-01T06:00:00'
    end_date = '2021-03-01T06:00:00'

    req = requests.get('{}?start_date={}&end_date={}'.format(URL, start_date, end_date))

    assert(req.request.method == "GET")
    assert(req.status_code == 200)
    assert(req.ok)

def test_nothing():
    req = requests.get('{}'.format(URL))

    assert(req.request.method == "GET")
    assert(not req.ok)
    assert(req.status_code == 400)

