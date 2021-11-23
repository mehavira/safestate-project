import React from 'react';
import Sight from './Sight';

function SightList({ sights }) {
    return (
        <table id="sights_table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Weather</th>
                    <th>Crime Rate</th>

                </tr>
            </thead>
            <tbody>
                {sights.map((sight, i) => <Sight sight={sight}

                    key={i} />)}
            </tbody>
        </table>
    );
}

export default SightList;
