"use client";
import Map from "../../components/map";
import { useEffect } from "react";
import { useState } from "react";
import Navbar from "../../components/navbar";
import { LatLngExpression } from "leaflet";

export default function Home() {

  const [name, setName] = useState('');
  const [center, setCenter] = useState<LatLngExpression>([45, 25]);


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
      } else {
        console.error(data.message);
      }
    };
    fetchUser();
    
  }, []);

  const handleSearch = (coords: LatLngExpression) =>
  {
    setCenter(coords);
  }


  return (
    <>
      <Navbar setCenter = {setCenter} />
       {name && <h1>Welcome, {name}</h1>}     
      <Map center = {center}/>
    </> 
   
  );
}
