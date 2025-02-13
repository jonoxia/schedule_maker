import pytest
import json
from ..app import create_app


def test_user_query():
    app = create_app()
    client = app.test_client()

    # Create some users:
    response = client.post("/users/create", data ={
        'username': "Jono Xia",
        'email': "jono@fastmail.fm"
    })
    
    response = client.get("/users")
    assert response.status == "200 OK"
    # check for expected username in return value?
    
def test_event_query():
    app = create_app()
    client = app.test_client()

    # Create user and 
    response = client.post("/users/create", data ={
        'username': "Jono Xia",
        'email': "jono@fastmail.fm"
    })
    # parse user ID out of response
    data = json.loads(response.data)
    user_id = int( data['user_id'])
    
    response = client.post("/calendars/create", data = {
        'user_id': user_id,
    })
    # parse calendar ID out of response
    data = json.loads(response.data)
    calendar_id = int( data['calendar_id'])

    response = client.post("/events/create", data = {
        'calendar_id': calendar_id,
        'name': "asdfsdaf",
        'start_time': "asdefasdf",
        'end_time': "asdfasdfds"
    })
    assert response.status == "200 OK"

    response = client.get("/events")
    assert response.status == "200 OK"
