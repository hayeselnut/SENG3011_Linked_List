import requests
import pytest
import json

from environment import URL

def test_time1():
    PARAMS = {
        "start_date": "2020-xx-xxTxx:xx:xx",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time2():
    PARAMS = {
        "start_date": "2020-01-xxTxx:xx:xx",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time3():
    PARAMS = {
        "start_date": "2020-01-01Txx:xx:xx",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time4():
    PARAMS = {
        "start_date": "2020-xx-xxTxx:xx:xx",
        "end_date": "xxxx-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time5():
    PARAMS = {
        "start_date": "2020-01-04T17:00:xx",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time6():
    PARAMS = {
        "start_date": "2020-01-04T17:00:00",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time7():
    PARAMS = {
        "start_date": "2020-01-04T17:00:00",
        "end_date": "2021-02-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time7():
    PARAMS = {
        "start_date": "2020-01-04T17:00:00",
        "end_date": "2021-02-01Txx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time8():
    PARAMS = {
        "start_date": "2020-01-04T17:00:00",
        "end_date": "2021-02-30Txx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(not req.ok)
    assert(req.status_code == 400)

def test_time9():
    PARAMS = {
        "start_date": "2020-01-04T17:00:00",
        "end_date": "2021-02-01T17:00:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time10():
    PARAMS = {
        "start_date": "2020-01-04T17:00:00",
        "end_date": "2021-02-01T17:00:00",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time11():
    PARAMS = {
        "start_date": "xxxx-xx-xxTxx:xx:xx",
        "end_date": "2021-02-01T17:00:00",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(not req.ok)
    assert(req.status_code == 400)

def test_time12():
    PARAMS = {
        "start_date": "2021-03-01T08:00:00",
        "end_date": "2021-02-01T17:00:00",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(not req.ok)
    assert(req.status_code == 400)

def test_time13():
    PARAMS = {
        "start_date": "2021-xx-xxTxx:xx:xx",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time14():
    PARAMS = {
        "start_date": "2020-xx-xxTxx:xx:xx",
        "end_date": "2021-xx-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time15():
    PARAMS = {
        "start_date": "2021-01-xxTxx:xx:xx",
        "end_date": "2021-03-xxTxx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

def test_time16():
    PARAMS = {
        "start_date": "2021-01-01Txx:xx:xx",
        "end_date": "2021-01-30Txx:xx:xx",
        "location": "Australia",
        "key_term": "COVID-19"
    }

    req = requests.get(url = URL, params = PARAMS)

    assert(req.request.method == "GET")
    assert(req.ok)
    assert(req.status_code == 200)

test_time1()
test_time2()
test_time3()
test_time4()
test_time5()
test_time6()
test_time7()
test_time8()
test_time9()
test_time10()
test_time11()
test_time12()
test_time13()
test_time14()
test_time15()
test_time16()
