# aviso-tracker
WorkingDirectory=/opt/aviso-tracker/aviso-tracker
ExecStart=/opt/aviso-tracker/py3trenv/bin/python3 -m gunicorn --bind 127.0.0.1:5000 aviso_tracker.wsgi

Install local mongo for development on 27017
