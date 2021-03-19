import requests
import pytest
import json

from environment import URL

def test_Covid():
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

def test_Bitcoin():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "China",
        "key_term": "Bitcoin"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(not req.ok)
    assert(req.status_code == 400)

def test_Haemorrhagic_Fever():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "China",
        "key_term": "Haemorrhagic Fever"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_unknown():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "China",
        "key_term": "Haemorrhagic Fever,unknown"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_other():
    PARAMS = {
        "start_date": "2020-01-01T08:00:00",
        "end_date": "2021-03-01T08:00:00",
        "location": "China",
        "key_term": "Influenza-like illness,other"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)


test_Covid()
test_Bitcoin()
test_Haemorrhagic_Fever()
test_other()