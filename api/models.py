from .app import db

"""
Assumption: 'no more than one event may be scheduled ot occur at a given day and time' means that
we should not allow an event to be created if the event OR any of its repeats overlaps with any existing
event OR any of that event's repeats.

Assumption: We should track the time zone of the event start and end dates.
"""

class User(db.Model):
    """
    """
    __tablename__ = "user"
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    username = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False)
    

class Calendar(db.Model):
    """
    A Calendar belongs to a User and owns any number of Events. A user can have any number of Calendars
    as long as each has a different name.
    By creating a separate table for this (rather than connecting User directly to Event) I am
    future-proofing the design: we can add support for multiple users sharing events, one user having
    separate 'work' and 'home' calendars, etc.
    """
    __tablename__ = "calendar"
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer(), db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(), default="My Default Calendar", nullable=False)


class Event(db.Model):
    """
    """
    __tablename__ = "event"
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    calendar_id = db.Column(db.Integer(), db.ForeignKey("calendar.id"), nullable=False)
    name = db.Column(db.String(), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)

    def get_duration(self):
        return end_time - start_time


class Repetition(db.Model):
    """
    weekday is an integer from 0 to 6, where 0 is monday and 6 is sunday.
    (Chose this mapping because it's what datetime.date.weekday() uses.)
    Existence of one of these rows pointing at an Event indicates that the Event repeats on this day of the week.
    """
    __tablename__ = "repetition"
    event_id = db.Column(db.Integer(), db.ForeignKey("event.id"), nullable=False, primary_key=True)
    weekday = db.Column(db.Integer(), nullable=False, primary_key=True)



