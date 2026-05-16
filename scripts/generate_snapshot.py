from __future__ import annotations

import json
import random
from pathlib import Path

import pandas as pd

random.seed(7)

portfolios = ['Grid Digitalization', 'Customer', 'Cyber', 'Corporate Functions', 'Operations Technology']
value_streams = ['Grid Ops', 'Customer Ops', 'Cybersecurity', 'ERP', 'Field Automation']
drivers = ['Cyber-Compliance', 'Technology Obsolescence', 'Multi-Driver', 'Strategy', 'Business Need', 'Other']
funding_status = ['Funded', 'Partially Funded', 'Unfunded']

special = [
    ('IAM Replatform Core', 'Cyber', 'Cybersecurity', 'IAM platform replatform and access controls', 'Identity and access modernization', 'Platform'),
    ('IAM Replatform Customer', 'Customer', 'Customer Ops', 'IAM platform replatform and customer identity sync', 'Identity and access modernization', 'Platform'),
    ('IAM Replatform OT', 'Operations Technology', 'Field Automation', 'IAM platform replatform for OT and privileged roles', 'Identity and access modernization', 'Platform'),
    ('Outage Management Modernization Grid', 'Grid Digitalization', 'Grid Ops', 'Outage management modernization with automated dispatch', 'Outage orchestration modernization', 'Application'),
    ('Outage Management Modernization Customer', 'Customer', 'Customer Ops', 'Outage management modernization for customer channels', 'Outage orchestration modernization', 'Application'),
]

rows = []
for i in range(50):
    if i < len(special):
        name, portfolio, value_stream, capability, outcomes, classification = special[i]
    else:
        portfolio = portfolios[i % len(portfolios)]
        value_stream = value_streams[i % len(value_streams)]
        capability = random.choice(['Network telemetry', 'Asset analytics', 'Zero trust controls', 'Cloud FinOps', 'Mobile workforce'])
        outcomes = random.choice(['Improved resiliency', 'Lower run cost', 'Reduced risk', 'Faster restoration', 'Better customer trust'])
        classification = random.choice(['Platform', 'Application', 'Infrastructure'])
        name = f'{capability} Initiative {i+1}'

    status = funding_status[(i * 3) % len(funding_status)]
    funded = status == 'Funded'
    bcr = round(random.uniform(0.6, 2.8), 2)
    cap = round(random.uniform(5, 95), 1)
    row = {
        'id': f'IT-{1000+i}',
        'name': name,
        'portfolioName': portfolio,
        'valueStream': value_stream,
        'funded': funded,
        'fundingStatus': status,
        'fundingSource': random.choice(['Base', 'Carryover', 'Incremental']),
        'driver': random.choice(drivers),
        'recommendation': random.choice(['CONTINUE', 'DELAY', 'CANCEL', 'REDUCE SCOPE']),
        'bcr': bcr,
        'totalCapitalCost': cap,
        'goLive': f"202{random.choice([6,7,8])}-{random.randint(1,12):02d}-01",
        'ouSponsor': random.choice(['Grid IT', 'Customer IT', 'Cyber Office', 'Corporate IT', 'OT Engineering']),
        'outcomes': outcomes,
        'classification': classification,
        'capability': capability,
        'dependsOn': f"IT-{1000+random.randint(0,49)}" if i % 7 == 0 else '',
        'year2026': round(cap * random.uniform(0.2, 0.4), 1),
        'year2027': round(cap * random.uniform(0.2, 0.4), 1),
        'year2028': round(cap * random.uniform(0.2, 0.4), 1),
    }
    rows.append(row)

root = Path(__file__).resolve().parents[1]
out_json = root / 'web/public/sample/snapshot.json'
out_xlsx = root / 'web/public/sample/seed-data.xlsx'
out_json.parent.mkdir(parents=True, exist_ok=True)
out_json.write_text(json.dumps(rows, indent=2), encoding='utf-8')
pd.DataFrame(rows).to_excel(out_xlsx, index=False)
print(f'Wrote {len(rows)} initiatives')
