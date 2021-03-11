class ReportRequest:
    def __init__(self, start_date, end_date, key_term, location):
        self.start_date = start_date
        self.end_date = end_date
        self.key_term = key_term
        self.location = location

    def serialize(self):
        return {
            "start_date": str(self.start_date),
            "end_date": str(self.end_date),
            "key_term": self.key_term,
            "location": self.location
        }

class ReportResponse:
    def __init__(self):
        self.reports = []

    def add_report(self, report):
        self.reports.append(report)

def get_reports_from_database(report_request):
    reports = get_all_reports()
    report_response = ReportResponse()

    for report in reports:
        if not report_request.start_date < report.date < report_request.end_date:
            continue

        if report_request.key_term not in report.desc:
            continue

        if report.location != report_request.location:
            continue

        report_response.add_report(report)

def get_all_reports():
    return []