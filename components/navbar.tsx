'use client'

import React, { use, useEffect, useState } from 'react'
import './navbar.css'
import Link from 'next/link'
import 'bootstrap/dist/css/bootstrap.min.css';

interface NavbarProps {
  setCenter: (coords: [number, number]) => void;
}


const Navbar: React.FC<NavbarProps> = ({setCenter}) => {

  const [name, setName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
        const fetchUser = async () => {
      const res = await fetch('/api/currentuser', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setName(data.name);
        setIsLoggedIn(true);
      } else {
        console.error(data.message);
        setIsLoggedIn(false);
      }
    };
    fetchUser();
  }
  , []);


  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      setIsLoggedIn(false) 
    } else {
      console.error('Logout failed');
    }
  };

  const updateSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }


  useEffect(() => {
    const fetchSuggestions = async () => {
      if(searchQuery.length < 2)
      {
        setSuggestions([]);
        setShowSuggestions(true);
        return;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data);
      } else {
        console.error('Error fetching suggestions:', data);
      }
    }
    fetchSuggestions();

  }
  , [searchQuery]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();

      if(data[0])
      {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCenter([lat, lng]);
        setShowSuggestions(false);
      }
  }
  


  return (
    <div className='navbar'>
      <h1 id = "logo">HereJPG</h1>
      <form onSubmit={handleSearch} className='input-group mb-0' id='searchBar'>
        <input id='searchBar' className='form-control' type="text" placeholder='Enter location' value={searchQuery} onChange={updateSearchQuery} onFocus={() => setShowSuggestions(true)}/>
        {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          listStyle: 'none',
          padding: 0,
          border: '1px solid #ccc',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {suggestions.map((place, idx) => (
            <li
              key={idx}
              style={{ padding: '8px', cursor: 'pointer' }}
              onClick={() => {
                setSearchQuery(place.display_name);
                setShowSuggestions(false);
                setSuggestions([]);
              }}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
        <div className="input-group-append">
          <button type = "submit" className="btn btn-outline-secondary" >Search</button>
        </div>
      </form>
      <div className='nav-list'>
        {        isLoggedIn ? (
          <>
            <Link className='nav-option' href='/profile'><button className='btn btn-primary'>{name}</button></Link>
            <Link onClick={handleLogout} className='nav-option' href='/'><button className='btn btn-outline-primary'>Logout</button></Link>
            <Link className='nav-option' href='/upload'><button id='addButton' className='btn btn-outline-primary'><p className="bi bi-plus mb-0">+</p></button></Link>
          </>
        ) : (
        <>
        <Link className='nav-option' href='/login'><button className='btn btn-primary'>Login</button></Link>
        <Link className='nav-option' href='/register'><button className='btn btn-outline-primary'>Register</button></Link>
        </>
        )}
      </div>
    </div>
  )
}

export default Navbar