import requests
import pytest
import json

from environment import *

def test_Australia():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_China():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "China",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_china():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "china",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_wuhan():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "china",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_mars():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "mars",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(not req.ok)
    assert(req.status_code == 400)

def test_japanAndchina():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "japan,china",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_JapanAndChina():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "Japan,China",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)


