import React, { useState } from 'react';
import { useHistory } from "react-router-dom";

export const EditSightPage = ({ sightToEdit }) => {

    const [name, setName] = useState(sightToEdit.name);
    const [location, setLocation] = useState(sightToEdit.location);
    const [weather, setWeather] = useState(sightToEdit.weather);
    const [crimeRate, setCrimeRate] = useState(sightToEdit.crimeRate);


    const history = useHistory();

    const editSight = async () => {
        const editedSight = { name, location, weather, crimeRate };
        const response = await fetch(`/sights/${sightToEdit._id}`, {
            method: 'PUT',
            body: JSON.stringify(editedSight),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 200) {
            alert("Successfully edited sightseeing location");
        } else {
            alert(`Failed to edit sight, status code = ${response.status}`);
        }
        history.push("/");
    };

    return (
        <div>
            <h2>Edit Sight</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                required
                onChange={e => setName(e.target.value)} />
            <input
                type="number"
                value={location}
                required
                min='0'
                placeholder="Location"
                onChange={e => setLocation(e.target.value)} />
            <input
                type="number"
                placeholder="Weather"
                value={weather}
                required
                min='0'
                max="999"
                maxlength="3"
                onChange={e => setWeather(e.target.value)} />
            <input
                type="text"
                value={crimeRate}
                required
                maxlength="3"
                placeholder="Crime Rate"
                onChange={e => setCrimeRate(e.target.value)} />

            <button
                onClick={editSight}
            >Save</button>
        </div>
    );
}

export default EditSightPage;