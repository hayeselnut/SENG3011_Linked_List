from flask import Flask, abort, jsonify
import dateutil.parser

from reports import ReportRequest, get_reports_from_database

APP = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/request", methods=['GET'])
def get_reports(request):
    report_request = parse_report_request(request)
    return get_reports_from_database(report_request)

def parse_report_request(request):
    if not request.args:
        abort(400, "Arguments not found")

    if 'start_date' not in request.args:
        abort(400, "'start_date' must not be null")

    if 'end_date' not in request.args:
        abort(400, "'end_date' must not be null")

    if 'key_term' not in request.args:
        abort(400, "'key_term' must not be null")

    if 'location' not in request.args:
        abort(400, "'location' must not be null")

    return ReportRequest(
        parse_date(request.args.get('start_date')),
        parse_date(request.args.get('end_date')),
        request.args.get('key_term'),
        request.args.get('location')
    )

def parse_date(date_string):
    try:
        return dateutil.parser.parse(date_string)
    except ValueError:
        abort(400, "invalid date format")

if __name__ == "__main__":
  APP.run()