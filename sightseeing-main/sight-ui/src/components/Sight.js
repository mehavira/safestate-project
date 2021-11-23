import React from 'react';
// import { MdDeleteForever, MdEdit } from 'react-icons/md';

function Sight({ sight }) {
    return (
        <tr>
            <td>{sight.name}</td>
            <td>{sight.latitude} </td>
            <td>{sight.longitude} </td>
            <td>{sight.weather}</td>
            <td>{sight.crimeRate}</td>

        </tr>
    );
}

export default Sight;