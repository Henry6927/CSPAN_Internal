python run.py


create .env file containing the following:

REACT_APP_AIRTABLE_BASE_ID=xxxxx

REACT_APP_AIRTABLE_API_KEY=xxxxx

REACT_APP_AIRTABLE_TABLE_NAME=InternalAppData

REACT_APP_API_KEY=xxxxxx

REACT_APP_GOOGLE_CSE_API_KEY=xxxxx

REACT_APP_GOOGLE_CSE_CX=xxxxx

for dev setup:
run localhost:3000 and localhost:5000 after proper setup to see logs.

for prod setup:
run (ip):5000 after proper setup. (python run.py), backend accessible via ip:5000/api, frontend via ip:5000/
