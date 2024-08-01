## Setup:

Request install for:
* NodeJS v20.15
* Python 3.12

Once installed, you must run the following in Powershell, once you enter the folder you would like this app to appear in (cd into said folder):

```
git clone https://github.com/Henry6927/CSPAN_Internal.git

cd CSPAN_Internal

npm install

.\venv\Scripts\activate
```

create .env file in CSPAN_Internal file containing the following:

```
REACT_APP_AIRTABLE_BASE_ID=xxxxx

REACT_APP_AIRTABLE_API_KEY=xxxxx

REACT_APP_AIRTABLE_TABLE_NAME=InternalAppData

REACT_APP_API_KEY=xxxxxx

REACT_APP_GOOGLE_CSE_API_KEY=xxxxx

REACT_APP_GOOGLE_CSE_CX=xxxxx
```

* note that the google CSE, CX keys are not required, they are an aesthetic choice.


## localsetup setup
python run.py

## setup across network 
will require a network rule which allows it to listen on network IPs, 10.10.8.0/23.
netsh advfirewall firewall add rule name="Allow Flask on port 5000" protocol=TCP dir=in localport=5000 action=allow remoteip=10.10.8.0/23
will also require some modifications to run.py,__init__,app but otherwise just run on Terminal and connect 

notes for making edits:
npm run build anytime you make an edit,

