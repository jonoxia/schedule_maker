import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [eventEditingPaneOpen, setEventEditingPaneOpen] = useState(false);

  useEffect(() => {
    /*fetch('/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });*/
  }, []);

    var placeholderData = {
	"events": [
	    {
	    "name": "Slime Party",
	    "start_time": "2025-02-14 03:30:00",
	    "end_time": "2025-02-14 04:30:00"
	    }
	]
    };

    const today = new Date();

    var start_of_this_week = new Date(
	today.getYear(),
	today.getMonth(),
	today.getDate() - today.getDay()
    );
	
    console.log("Start of this week is " + start_of_this_week.toLocaleDateString());
    
    var hours = [];
    for (var i = 6; i < 12; i++) {
	hours.push(i + "AM");
    }
    hours.push("12 PM");
    for (var i = 1; i < 12; i++) {
	hours.push(i + "PM");
    }

    var days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const todays_weekday = today.getDay();
    var today_row = [];
    for (var j = 0; j < 7; j++) {
	today_row.push(j);
    }

    /*
     * for each event, parse start time and end time into javascript date objects
     * instead of looping through strings "6am" to "12pm" create an array of javascript date objects
     * representing times
     * in the table rendering, each cell then knows its start time and can compare that to events
     * if there's an event starting during that time period, show that in this cell
     */

    function eventsThisHour(day_of_week, hour) {
	console.log("EventsThisHour called with " + day_of_week + ", " + hour);
	if (day_of_week == 3 && hour == "3PM") {

	    return placeholderData.events;
	}
	return [];
    }


    function handleHourCellClick(event) {
	console.log("Create new event at: " + event.target.id);
    }

    function handleEventDivClick(event) {
	console.log("Edit existing event at: " + event.target.id);
	event.preventDefault();
    }

  return (
    <div className="App">
        <h1>Schedule Maker for Community Energy Labs</h1>
	<table className="calendar">
	    <thead>
		<tr key="header_row">
		    <td key="today_row_first"></td>
		    {today_row.map( idx => (
			<td key={"header_"+ idx}>
			    { (idx == todays_weekday)? "Today": ""}
			    <br/>
			    { days_of_week[idx] }
			    <br/>
			    { month_names[start_of_this_week.getMonth()] + " " + (start_of_this_week.getDate() + idx )}
			</td>
		    ))}
		</tr>
	    </thead>
	    <tbody>
	    {hours.map( hour => (
		<tr key={hour + "_row"}>
		    <td>{hour}</td>
		    {today_row.map( day => (
			<td key={day + "/" + hour} id={day + "/" + hour} onClick={handleHourCellClick}>

			    {eventsThisHour(day, hour).map( event => (
				<div className="scheduled_event" id={"event_" + event.name} onClick={handleEventDivClick}>
				    {event.name}
				</div>
			    ))}

			</td>
		    ))}
		</tr>
	    ))}
	    </tbody>
	</table>

    </div>
      
      
  );
}

export default App;

