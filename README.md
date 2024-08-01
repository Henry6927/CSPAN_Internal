## Initial Setup:

Request install for:
* NodeJS v20.15
* Python 3.12

Once installed, you must run the following in Powershell once you are in the desired directory to put this project:

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


## Local Setup
After you have completed the initial setup, you can proceed to starting it on your local device doing the following inside the CSPAN_Internal app on Powershell 
```
.\venv\Scripts\activate

python run.py
```

it then should be accessible on localhost:5000, and the backend accessible on localhost:5000/api/{endpoint} 
## Setup Across Network 
will require a network rule which allows it to listen on network IPs, 10.10.8.0/23.
netsh advfirewall firewall add rule name="Allow Flask on port 5000" protocol=TCP dir=in localport=5000 action=allow remoteip=10.10.8.0/23
will also require some modifications to run.py,__init__,app but otherwise just run on Terminal and connect 

https://stackoverflow.com/questions/59026168/how-to-access-localhost-from-another-computer-on-same-network

https://stackoverflow.com/questions/59026168/how-to-access-localhost-from-another-computer-on-same-network#:~:text=To%20access%20a%20Flask%20app%20from%20another%20machine%2C,running%20the%20app%20the%20flask%20run%2C%20add%20--host%3D0.0.0.0

https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/rules

## Editing
utilize `npm run start` for developing to run frontend, and `run.py` for backend. Note this will require modifications to code as well.

`npm run build` anytime you make an edit.

Note app/routes/regeneration_routes and term_routes both have chatgpt version, which can be changed for cost saving /improved summaries. 

Model	Token limits

gpt-4o -- 30,000 TPM, 500 RPM, 90,000 TPD

gpt-4o-mini -- 200,000 TPM, 500 RPM, 10,000 RPD, 2,000,000 TPD

gpt-3.5-turbo	-- 200,000 TPM, 500 RPM, 10,000 RPD, 2,000,000 TPD

gpt-4	-- 10,000 TPM, 500 RPM, 10,000 RPD, 100,000 TPD

gpt-4-turbo -- 30,000 TPM, 500 RPM, 90,000 TPD

text-embedding-3-small	-- 1,000,000 TPM, 3,000 RPM, 3,000,000 TPD

dall-e-3 -- 5 images per minute, tts-1, 50 RPM

whisper-1	-- 50 RPM

