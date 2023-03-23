from celery import Celery
from flask import Flask, make_response, redirect, Response, request, send_file
from functools import wraps
from flask.templating import render_template

import argparse
import base64
import copy
import datetime
import getpass
import hashlib
import json
import os
import pymongo
import random
import string
import time
import logging

debug = True

app = Flask(__name__)
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'
app.config['MONGO_SERVER'] = 'localhost'
app.config['MONGO_DB'] = 'flask-pixel-tracker'

mongo_client = pymongo.MongoClient(app.config['MONGO_SERVER'], 27017, connect=False)
mongo_db = mongo_client[app.config['MONGO_DB']]

celery = Celery('pfpt.main', broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

base_url = 'http://localhost:5000/'

logger = logging.getLogger('werkzeug') # grabs underlying WSGI logger
handler = logging.FileHandler('test.log') # creates handler for the log file
logger.addHandler(handler) # adds handler to the werkzeug WSGI logger


@celery.task
def consume_open(event_record):
    send_hash = event_record['data']['sh'] if 'sh' in event_record['data'] else None

    event_collection = mongo_db['event-collection']
    event_id = event_collection.insert_one(event_record)

    sent_collection = mongo_db['sent-collection']
    subject_collection = mongo_db['subject-collection']
    open_collection = mongo_db['opens-collection']

    sent_collection.update_one({'send_hash': send_hash}, {'$inc': {'opens': 1}}, True)

    sent_email = sent_collection.find_one({'send_hash': send_hash})

    subject_hash = sent_email['subject_hash']
    open_hash = sent_email['open_hash']

    open_result = open_collection.update_one({'open_hash': open_hash}, {'$inc': {'opens': 1}}, True)

    if open_collection.find_one({'open_hash': open_hash})['opens'] == 1:
        subject_collection.update_one({'subject_hash': subject_hash}, {'$inc': {'opens': 1}}, True)


@app.route("/pixel.png")
def pixel():
    # pixel_data = base64.b64decode("R0lGODlhAQABAIAAAP8AAP8AACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==")
    """
    1x1 transparent pixel from PIL
    """
    # pixel_data = PIL.new('RGBA', (1, 1), (0, 0, 0, 0)).tobytes()
    """
    get param from url
    """
    param_id = request.args.get('sh', None)

    pixel_data = '../pixel.png'
    # logger = logging.getLogger('werkzeug')
    logger.info('This will get logged, {}'.format(param_id))
    event_record = {
        'time': int(time.time()),
        'data': {},
        'headers': {},
    }

    import requests
    req = requests.get('https://webhook.site/7a0a40bc-9114-4a49-bc6b-2409991ca4cf')

    event_record['data'] = copy.deepcopy(request.args)

    for header in request.headers:
        event_record['headers'][header[0]] = request.headers.get(header[0])

    consume_open.delay(event_record)

    return send_file(pixel_data, mimetype='image/png')
    # return Response({"pixel": "will be returned"})


@app.route("/api/generate-pixel")
def generate_pixel():
    event_record = {
        'to_address': request.args.get('to', None),
        'from_address': request.args.get('from', None),
        'subject': request.args.get('subject', None),
        'sent_date': int(time.time()),
        'opens': 0,
    }

    send_hash = hashlib.sha1('{}'.format(event_record).encode('utf-8')).hexdigest()
    subject_hash = hashlib.sha1(str(event_record['subject']).encode('utf-8')).hexdigest()
    open_hash = hashlib.sha1('{}:{}'.format(event_record['subject'],event_record['to_address']).encode('utf-8')).hexdigest()

    event_record['send_hash'] = send_hash
    event_record['subject_hash'] = subject_hash
    event_record['open_hash'] = open_hash

    sent_collection = mongo_db['sent-collection']
    sent_collection.insert_one(event_record)

    subject_collection = mongo_db['subject-collection']
    open_collection = mongo_db['opens-collection']

    if subject_collection.find_one({'subject_hash': subject_hash}) is None:
        subject_collection.insert_one({
            'subject_hash': subject_hash,
            'subject': event_record['subject'],
            'opens': 0,
            'sends': 1,
            'date_sent': int(time.time()),
        })
    else:
        subject_collection.update_one({
            'subject_hash': subject_hash
        }, {
            '$inc': {'sends': 1}
        }, True)

    if open_collection.find_one({'open_hash': open_hash}) is None:
        open_collection.insert_one({
            'open_hash': open_hash,
            'subject_hash': subject_hash,
            'subject': event_record['subject'],
            'opens': 0,
            'sends': 1,
            'date_sent': int(time.time()),
        })
    else:
        open_collection.update_one({
            'open_hash': open_hash
        }, {
            '$inc': {'sends': 1}
        }, True)

    return Response(json.dumps({'id': send_hash}), mimetype="application/json")


"""
track links clicked
"""
@app.route("/api/track-link")
def track_link():
    data = request.args
    sender_address = data.get('from', None)
    recipient_address = data.get('to', None)
    urls = data.get('url', None)
    
    """ save the link hash and url to the database """
    link_collection = mongo_db['link-collection']
    db_list = []
    sha_list = []
    for url in urls:
        link_hash = hashlib.sha1(
                    '{}:{}:{}'.format(
                        sender_address, 
                        recipient_address, 
                        url
                    ).encode('utf-8')).hexdigest()
        sha_list.append(base_url+'open-link/'+str(link_hash))
        db_list.append({
            'link_hash': link_hash,
            'sender_address': sender_address,
            'recipient_address': recipient_address,
            'url': url,
            'clicks': 0,
        })
        # link_collection.update_one({'link_hash': link_hash, 'url': url}, {'$inc': {'clicks': 1}}, True)
    link_collection.insert_many(db_list)
    return Response(json.dumps({'redirect_links': sha_list}), mimetype="application/json")

@app.route("/open-link/<link_hash>")
def open_link(link_hash):
    link_collection = mongo_db['link-collection']
    link_collection.update_one({'link_hash': link_hash}, {'$inc': {'clicks': 1}}, True)
    link = link_collection.find_one({'link_hash': link_hash})
    return redirect(link['url'], 302)




if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Python & Flask implementation of pixel tracking')

    parser.add_argument('command', nargs=1, choices=('run', 'create-admin-user', ))
    args = parser.parse_args()

    if 'run' in args.command:
        app.run()
    
