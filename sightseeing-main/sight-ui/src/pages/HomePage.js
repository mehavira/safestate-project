import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import banner from './media/columbia_rv.jpg'

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 0
        };

        this.handleChange = this.handleChange.bind(this);
        this.searchSights = this.searchSights.bind(this);
    }

    handleChange = event => {
        event.preventDefault();
        console.log(event.target.value)
        this.setState({ value: event.target.value });
    };


    searchSights = async (event) => {
        console.log("search sights");
        event.preventDefault();
        const response = await fetch('http://localhost:8222/sight-ideas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                zipCode: this.state.value
            })
        });
        response.json().then(result => { console.log(result) }).catch(error => { console.log(error) })

    };



    render() {
        return (
            <>
                {/* <h2>Oregon Sightseeing App</h2> */}

                <img src={banner} alt="Banner" class='responsive'></img>

                <br></br>

                <p class="Intro"> Welcome! This app provides you a list of sightseeing places close to you. To use it,
                    just put the 5-digit postal code in the search bar below and click the "Search" button'. </p>

                <br></br>

                <form>

                    <label for="zip">Enter 5-digit zip code from Oregon</label>
                    <input
                        type="number"
                        name="value"
                        id="zip"
                        maxLength="5"
                        minLength="5"
                        min="97001"
                        value={this.state.value}
                        onChange={this.handleChange}
                        max="97920"
                        placeholder='97XXX'
                        className='Button'
                        required>

                    </input>
                    <button className='Button' onClick={this.searchSights}>Search</button>
                </form>
                <br></br>
                <br></br>

            </>

        );
    }

}

export default HomePage;

<Link to="/show-sights" className=' Anchor'>Search</Link>