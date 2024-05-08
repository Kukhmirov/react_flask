import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './App.css';

const baseUrl = "http://127.0.0.1:5000"

function App() {
  const [description, setDescription] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [eventsList, setEventsList] = useState([]);
  const [eventId, setEventId] = useState(null);

  const fetchEvents = async() => {
    const data = await axios.get(`${baseUrl}/events`)
    setEventsList(data.data)
  }

  const handleChange = (evt, field) => {
    if (field === "description") {
      setDescription(evt.target.value);
    } else if (field === "edit") {
      setEditDescription(evt.target.value)
    }
  };

  const handleSubmit = async(evt) => {
    evt.preventDefault();
    try {
      if(editDescription) {
        const data = await axios.put(`${baseUrl}/events/${eventId}`, {description: editDescription})
        const updatedEvent = data.data.event;
        const updateList = eventsList.map((event) => {
          if (event.id === eventId) {
            return updatedEvent;
          }
          return event;
        });
        setEventsList(updateList)
      } else {
        const data = await axios.post(`${baseUrl}/events`, {description: description})
        setEventsList([...eventsList, data.data])
      }

      
      setDescription('');
      setEditDescription('');
      setEventId(null)
    } catch(err) {
      console.error(err);
    }
  }

  const handleDelete = async(id) => {
    await axios.delete(`${baseUrl}/events/${id}`)
    const updateList = eventsList.filter((event) => event.id !== id)
    setEventsList(updateList)
  };

  const toggleEdit = (evt) => {
    console.log(evt);
    setEventId(evt.id);
    setEditDescription(evt.description)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <>
      <section className="container">
        <form onSubmit={handleSubmit} className="my-form">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <input
            onChange={(evt) => handleChange(evt, 'description')}
            type="text"
            name="description"
            value={description}
            id="description"
            className="form-input"
            placeholder="Enter a description"
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </section>

      <section className="container">
        <ul className="events-list">
          {eventsList.map((event) => {
            if (event.id === eventId) {
              return (
                <form onSubmit={handleSubmit} className="my-form" key={event.id}>
                  <input
                    onChange={(evt) => handleChange(evt, 'edit')}
                    type="text"
                    name="editDescription"
                    value={editDescription}
                    id="editDescription"
                    className="form-input"
                    placeholder="Enter a description"
                  />
                  <button type="submit" className="submit-button">
                    Submit
                  </button>
                </form>
              )
            } else {
              return (
                <li className="event-item" key={event.id}>
                  {format(new Date(event.created_at), 'MM/dd, p')} : {" "}
                  {event.description}
                  <button className="delete-button" onClick={() => toggleEdit(event)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(event.id)}>
                    Delete
                  </button>
                </li>
              )
            }
          })}
        </ul>
      </section>
    </>
  )
}

export default App
