import React, { useState, useEffect } from 'react';
import './App.css';


function EditingPanel({on_form_submit, existing_event=null, hour_selected=null, day_selected=null, click_coordinates=[0,0]}) {
    /* React component representing the pane that pops up containing an event form. Can be used to
       edit an existing event or to create a new event.

       Props:
       - on_form-submit: callback function that the form input values will be passed to.
       - existing_event: if not null, is treated as an update to this existing event. If null, creates a new event.
       - hour_selected: if we're creating a new event, tells what hour the user clicked on, which will be used
       to set the event's default start and end time.
       - day_selected: integer 0-6 corresponding to the days of the week/columns of the table. If we're creating a new
       event, used to set the event's default start and end time.
       - click_coordinates: the panel will be absolutely positioned at these x,y coordinates like a modal dialog box.
     */
    var defaultStartTime;
    var defaultEndTime;
    if (existing_event) {
	defaultStartTime = new Date(existing_event.start_time);
	defaultEndTime = new Date(existing_event.end_time);
    } else {
	const today = new Date();
	const date_clicked = today.getDate() - today.getDay() + parseInt(day_selected);
	
	defaultStartTime = new Date();
	defaultStartTime.setDate( date_clicked );
	defaultStartTime.setHours(parseInt(hour_selected), 0, 0);
	
	defaultEndTime = new Date();
	defaultEndTime.setDate( date_clicked );
	defaultEndTime.setHours( parseInt(hour_selected) + 1, 0, 0);
    }
    
    function saveForm(event) {
	const input_fields = event.target.form.getElementsByTagName("input");
	var childData = {};

	if (existing_event) {
	    childData["existing_event_id"] = existing_event.id;
	}

	for (var i in input_fields) {
	    var name = input_fields[i].name;
	    if (input_fields[i].type == "checkbox") {
		childData[ name ] = input_fields[i].checked;
	    } else {
		childData[ name ] = input_fields[i].value;
	    }
	}
	on_form_submit(childData);
	event.preventDefault();
    }

    return (
	<div id="editing-panel" style={{
		 "left": click_coordinates[0],
		 "top": click_coordinates[1]}}>
	    <form id="edit-event-form">
	    <p>Event Name: <input name="event_name" type="text" defaultValue={ existing_event && existing_event.name}></input></p>
	    <p>Start Time: <input name="event_start" type="text" defaultValue={ defaultStartTime }></input></p>
	    <p>End Time: <input name="event_end" type="text" defaultValue={ defaultEndTime  }></input></p>
	    <p>Repeats:</p>
		<ul>
		    <li>Mondays: <input type="checkbox" name="mon-check"></input></li>
		    <li>Tuesdays: <input type="checkbox" name="tue-check"></input></li>
		    <li>Wednesdays: <input type="checkbox" name="wed-check"></input></li>
		    <li>Thursdays: <input type="checkbox" name="thu-check"></input></li>
		    <li>Fridays: <input type="checkbox" name="fri-check"></input></li>
		    <li>Saturdays: <input type="checkbox" name="sat-check"></input></li>
		    <li>Sundays: <input type="checkbox" name="sun-check"></input></li>
		</ul>
		<button onClick={saveForm}>Save</button>
	    </form>
	</div>
    )
}


function App() {
    /*
      Main UI component for scheduling app.

      State:
      - eventList: list of currently known events, where each event is an object with name, start date/time,
      and end date/time
      - eventEditingPaneOpen: flag to toggle whether editing pane is shown or hidden
      - editingEventId: index of existing event which is currently being edited in the pane, if any
      - hourSelected and daySelected: if no existing event is being edited, tracks the cell you clicked in so that
      its hour and day are used as the default setting for new event creation.
      - clickCoordinates: used to position the (hovering) editing pane near where you clicked your mouse
     */
    const [eventList, setEventList] = useState([]);
    const [eventEditingPaneOpen, setEventEditingPaneOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState(0);
    const [hourSelected, setHourSelected] = useState(null);
    const [daySelected, setDaySelected] = useState(null);
    const [clickCoordinates, setClickCoordinates] = useState([]);

    useEffect(() => {
	async function fetchData() {
	    const response = await fetch('/events');
	    var json = await response.json();
	    console.log("Got this json: ");
	    console.log(json);

	    for (i = 0; i < json.events.length; i++) {
		if (json.events[i].start_time) {
		    json.events[i].start_time = Date.parse(json.events[i].start_time);
		    json.events[i].end_time = Date.parse(json.events[i].end_time);
		}
	    }
	    setEventList( json.events );
	}
	fetchData();
    }, []);

    /* Display the week that contains today's date. Sunday to saturday. hour_of_day_indices and day_of_week
     * indices are simply arrays of integers which we loop through to create the table. day_of_week_names and
     * hour_of_day_names are the user-readable strings used to label the corresponding rows and columns.*/
    const today = new Date();
    var start_of_this_week = new Date(
	1900 + today.getYear(),
	today.getMonth(),
	today.getDate() - today.getDay()
    );

    var hour_of_day_indices = [];
    for (var i = 0; i < 24; i++) {
	hour_of_day_indices.push(i);
    }
    
    var hour_of_day_names = [];
    hour_of_day_names.push("12 AM");
    for (var i = 1; i < 12; i++) {
	hour_of_day_names.push(i + "AM");
    }
    hour_of_day_names.push("12 PM");
    for (var i = 1; i < 12; i++) {
	hour_of_day_names.push(i + "PM");
    }

    var day_of_week_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const todays_weekday = today.getDay();
    
    var day_of_week_indices = [];
    for (var j = 0; j < 7; j++) {
	day_of_week_indices.push(j);
    }

    /* Utility function used when rendering calendar week: returns a list of the indices of any events which
     * overlap with the given day_of_week and hour of day. If no events overlap, returns empty list. */
    function eventIdsThisHour(day_of_week, hour) {
	const my_start_time = new Date(
	    1900 + start_of_this_week.getYear(),
	    start_of_this_week.getMonth(),
	    start_of_this_week.getDate() + day_of_week,
	    hour
	);

	const my_end_time = new Date(
	    1900 + start_of_this_week.getYear(),
	    start_of_this_week.getMonth(),
	    start_of_this_week.getDate() + day_of_week,
	    hour + 1
	);

	for (var j = 0; j < eventList.length; j++) {
	    if (eventList[j].start_time < my_end_time && eventList[j].end_time > my_start_time) {
		return [j];
	    }
	}
	return [];
    }

    /* functions for saving state to the server: */
    async function postNewEvent(childData) {
	const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
	};
	const response = await fetch('/events/create', requestOptions);
	const data = await response.json();
	// TODO set state so main UI refreshes here
    }

    async function postUpdateEvent(childData) {
	const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(childData)
	};
	const response = await fetch('/events/update', requestOptions);
	const data = await response.json();
	// TODO set state so main UI refreshes here.
    }

    /* Handler functions for click events to open/close editing panel: */
    function handleHourCellClick(event) {
	/* Clicking on an empty cell of the calendar opens the editing pane ready to create a new event
	 * starting in this hour/day.*/
	if (eventEditingPaneOpen) {
	    return;
	}
	const cell = event.target.id.split("/");
	setDaySelected(cell[0]);
	setHourSelected(cell[1]);
	setEditingEventId(null);
	setClickCoordinates([ event.pageX, event.pageY ]);
	setEventEditingPaneOpen(true);
    }

    function handleEventDivClick(event) {
	/* Clicking on an existing event opens the editing pane ready to
	 * starting in this hour/day.*/

	if (eventEditingPaneOpen) {
	    return;
	}
	const event_id = event.target.id.replace("event_", "");
	console.log("Edit existing event at: " + event_id);
	setEditingEventId(event_id);
	setDaySelected(null);
	setHourSelected(null);
	setEventEditingPaneOpen(true);
	event.preventDefault();
    }
    
    function handleEditingPanelFormSubmit(childData) {
	/* Triggered by callback when user clicks the submit button in the editing pane, updates an event or
	 * creates a new event, then closes the pane. */
	if (childData.existing_event_id != null) {
	    console.log("Update existing event - childData is ");
	    console.log(childData);
	    postUpdateEvent(childData);
	} else {
	    console.log("Make new event - childData is ");
	    console.log(childData);
	    postNewEvent(childData);
	}
	
	setEventEditingPaneOpen(false);
    }


    /* Main HTML representation of the schedule is as a table, with days of the week as columns and hours of the day
     * as rows. */
  return (
    <div className="App">
        <h1>Schedule Maker for Community Energy Labs</h1>
	<p>Click any empty space to begin creating an event in that time/day. Click an existing event to edit it.</p>
	<table className="calendar">
	    <thead>
		<tr key="header_row">
		    <td key="day_of_week_indices_first"></td>
		    {day_of_week_indices.map( idx => (
			<td key={"header_"+ idx}>
			    { (idx == todays_weekday)? "Today": ""}
			    <br/>
			    { day_of_week_names[idx] }
			    <br/>
			    { month_names[start_of_this_week.getMonth()] + " " + (start_of_this_week.getDate() + idx )}
			</td>
		    ))}
		</tr>
	    </thead>
	    <tbody>
	    {hour_of_day_indices.map( hour => (
		<tr key={hour + "_row"}>
		    <td>{hour_of_day_names[hour]}</td>
		    {day_of_week_indices.map( day => (
			<td key={day + "/" + hour} id={day + "/" + hour} onClick={handleHourCellClick}>

			    {eventIdsThisHour(day, hour).map( event => (
				<div className="scheduled_event" id={"event_" + event} onClick={handleEventDivClick}>
				    {eventList[event].name}
				</div>
			    ))}

			</td>
		    ))}
		</tr>
	    ))}
	    </tbody>
	</table>

	{ eventEditingPaneOpen && <EditingPanel
				      on_form_submit={handleEditingPanelFormSubmit}
				      existing_event={editingEventId ? eventList[editingEventId]: null}
				      hour_selected={hourSelected}
				      day_selected={daySelected}
				      click_coordinates ={clickCoordinates}
				  />}
    </div>

      
  );
}

export default App;

