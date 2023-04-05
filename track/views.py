import copy
import hashlib
import json
import time
import pymongo
from django.shortcuts import redirect, render

# Create your views here.
"""
write a simple django api
"""
from django.http import HttpResponse, JsonResponse
# from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse
from django.core import serializers
from django.conf import settings
# from rest_framework.decorators import api_view


base_url = 'http://localhost:5000/track/'
mongo_client = pymongo.MongoClient(settings.MONGO_SERVER, 27017, connect=False)
mongo_db = mongo_client[settings.MONGO_DB]



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



# @api_view(['GET'])
@csrf_exempt
def pixel(request):
    param_id = request.GET.get('sh', None)
    # print(param_id)

    pixel_data = './pixel.png'
    pixel_data = open('./pixel.png', 'rb')
    event_record = {
        'time': int(time.time()),
        'data': {},
        'headers': {},
    }

    # for testing
    # import requests
    # req = requests.get('https://webhook.site/7a0a40bc-9114-4a49-bc6b-2409991ca4cf')

    event_record['data'] = copy.deepcopy(request.GET)

    consume_open(event_record)
    from django.http import HttpResponse
    response = HttpResponse(pixel_data, content_type='image/png')
    response['Content-Disposition'] = 'attachment; filename="pixel.png"'
    return response

# @api_view(['POST'])
@csrf_exempt
def generate_pixel(request):
    event_record = {
        'to_address': request.GET.get('to', None),
        'from_address': request.GET.get('from', None),
        'subject': request.GET.get('subject', None),
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

    return JsonResponse({'id': send_hash})


# @api_view(['POST'])
@csrf_exempt
def track_link(request):
    data = json.loads(request.body.decode('utf-8'))
    print(data)
    sender_address = data['sender_address']
    recipient_address = data['recipient_address']
    urls = data.get('url', None)
    
    """ save the link hash and url to the database """
    link_collection = mongo_db['link-collection']
    db_list = []
    sha_list = []

    import pyshorteners
    s = pyshorteners.Shortener()
    print(s.tinyurl.short('http://www.google.com'))
    # long_url = input("Enter the URL to shorten: ")
    
    # #TinyURL shortener service
    # type_tiny = pyshorteners.Shortener()
    # short_url = type_tiny.tinyurl.short(long_url)
    
    # print("The Shortened URL is: " + short_url)


    for url in urls:
        link_hash = hashlib.sha1(
                    '{}:{}:{}'.format(
                        sender_address, 
                        recipient_address, 
                        url
                    ).encode('utf-8')).hexdigest()
        long_url = base_url+'open-link?hash='+str(link_hash)
        type_tiny = pyshorteners.Shortener()
        print(long_url)
        short_url = type_tiny.tinyurl.short(long_url)
        print("The Shortened URL is: " + short_url)
        sha_list.append(short_url)
        db_list.append({
            'link_hash': link_hash,
            'sender_address': sender_address,
            'recipient_address': recipient_address,
            'url': url,
            'clicks': 0,
        })
        # link_collection.update_one({'link_hash': link_hash, 'url': url}, {'$inc': {'clicks': 1}}, True)
    link_collection.insert_many(db_list)
    return JsonResponse({'redirect_links': sha_list})

# @api_view(['GET'])
@csrf_exempt
def open_link(request):
    # print(link_hash)
    link_hash = request.GET.get('hash', None)
    print(link_hash)
    link_collection = mongo_db['link-collection']
    # link_collection.update_one({'link_hash': link_hash}, {'$inc': {'clicks': 1}}, True)
    link = link_collection.find_one_and_update({'link_hash': link_hash}, return_document=pymongo.ReturnDocument.AFTER, update={'$inc': {'clicks': 1}})
    # link.update({'clicks': link['clicks'] + 1})
    print(link)
    return redirect(link['url'], 302)


# import short_url
# url = short_url.