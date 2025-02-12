import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';


function EditingPanel({on_form_submit, existing_event=null, hour_selected=null, day_selected=null, click_coordinates=[0,0]}) {
    /* */
    var defaultStartTime;
    var defaultEndTime;
    if (existing_event) {
	defaultStartTime = existing_event.start_time;
	defaultEndTime = existing_event.end_time;
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
    const [eventList, setEventList] = useState([]);
    const [eventEditingPaneOpen, setEventEditingPaneOpen] = useState(false);
    const [editingEventId, setEditingEventId] = useState(0);
    const [hourSelected, setHourSelected] = useState(null);
    const [daySelected, setDaySelected] = useState(null);
    const [clickCoordinates, setClickCoordinates] = useState([]);

    useEffect(() => {
	setEventList(
	    [
		{
		    "id": 0,
		    "name": "Slime Party",
		    "start_time": new Date( Date.parse("2025-02-14T15:30:00") ),
		    "end_time": new Date ( Date.parse("2025-02-14T16:30:00") )
		}
	    ]
	);
    }, []);

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
	    if (eventList[j].start_time <= my_end_time && eventList[j].end_time >= my_start_time) {
		return [j];
	    }
	}
	return [];
    }

    function handleHourCellClick(event) {
	if (eventEditingPaneOpen) {
	    return;
	}
	const cell = event.target.id.split("/");
	setDaySelected(cell[0]);
	setHourSelected(cell[1]);
	setClickCoordinates([ event.pageX, event.pageY ]);
	setEventEditingPaneOpen(true);
    }

    function handleEventDivClick(event) {
	if (eventEditingPaneOpen) {
	    return;
	}
	const event_id = event.target.id.replace("event_", "");
	console.log("Edit existing event at: " + event_id);
	setEditingEventId(event_id);
	setEventEditingPaneOpen(true);
	event.preventDefault();
    }

    function handleEditingPanelFormSubmit(childData) {
	if (childData.existing_event_id != null) {
	    console.log("Update existing event - childData is ");
	    console.log(childData);
	} else {
	    console.log("Make new event - childData is ");
	    console.log(childData);
	}
	// TODO: submit to the server side!!
	// then trigger a refresh
	
	setEventEditingPaneOpen(false);
    }

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

