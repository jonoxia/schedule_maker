from .models import User, Calendar, Event, Repetition
from flask import render_template, request
import datetime

JAVASCRIPT_DATE_FORMAT = "%a %b %d %Y %H:%M:%S %Z%z"

def parse_js_date(date_string):
    # client-side submits strings in Javascript date format which looks like this:
    # 'Mon Feb 10 2025 13:00:00 GMT-0800 (Pacific Standard Time)'
    return datetime.datetime.strptime( date_string.split(" (")[0], JAVASCRIPT_DATE_FORMAT)


def get_default_calendar(db):
    user_id = 1
    user_query = db.session.query(User).filter(User.id == user_id)
    if user_query.count() == 0:
        user = User(
            username="Default User",
            email = "Default Email"
        )
        db.session.add(user)
        db.session.commit()
        user_id = user.id
        
    calendar_id = 1
    calendar_query = db.session.query(User).filter(Calendar.id == calendar_id)
    if calendar_query.count() == 0:
        user = Calendar(
            user_id = user_id,
            name="Default Calendar"
        )
        db.session.add(calendar)
        db.session.commit()
    return calendar


def register_routes(app, db):

    @app.route("/users")
    def user_list():
        users = db.session.execute(db.select(User).order_by(User.username))
        user_names = [user[0].username for user in users]
        return {'users': user_names}
        #return render_template("user/list.html", users=users)

    @app.route("/users/create", methods=["GET", "POST"])
    def user_create():
        if request.method == "POST":
            user = User(
                username=request.form["username"],
                email=request.form["email"],
            )
            db.session.add(user)
            db.session.commit()
            #return redirect(url_for("user_detail", id=user.id))

        #return render_template("user/create.html")
        return {"user_id": user.id}

    @app.route("/calendars/create", methods=["GET", "POST"])
    def calendar_create():
        if request.method == "POST":
            calendar = Calendar(
                user_id = int( request.form["user_id"]),
            )
            db.session.add(calendar)
            db.session.commit()

        return {"calendar_id": calendar.id}

    @app.route("/events/create", methods=["GET", "POST"])
    def event_create():
        # TODO for now we are using default calendar; in a real version we'd accept calendar
        # ID from the client.

        calendar = get_default_calendar(db)
        if request.method == "POST":
            body = request.get_json()
            event = Event(
                calendar_id = calendar.id,
                name = body["event_name"],
                start_time = parse_js_date(body["event_start"]),
                end_time = parse_js_date(body["event_end"])
            )
            # TODO body JSON also includes checkboxes for which weekdays we repeat on,
            # e.g. "mon-check" etc.
            db.session.add(event)
            db.session.commit()

        return {"event_id": event.id}

    @app.route("/events/update", methods=["GET", "POST"])
    def event_update():
        if request.method == "POST":
            body = request.get_json()
            event_id = body["existing_event_id"]
            print("Got request to update ")
            print(event_id)

        return {"event_id": 0}
            

    @app.route("/events")
    def event_list():
        # Filter for selected user and calendar
        events = [event[0] for event in db.session.execute(db.select(Event).order_by(Event.start_time))]
        # TODO: Join to Repetition here.
        # don't create all the future repetitions of the event; let the UI handle that.
        event_listing = []
        for event in events:
            event_listing.append({
                "id": event.id,
                "name": event.name,
                "start_time": event.start_time.strftime(JAVASCRIPT_DATE_FORMAT),
                "end_time": event.end_time.strftime(JAVASCRIPT_DATE_FORMAT)
            })
            
        return {"events": event_listing}

