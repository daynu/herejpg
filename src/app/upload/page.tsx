'use client';

import React, { useState } from 'react';

const UploadPhoto = () => {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);

  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string); 
      };
      reader.readAsDataURL(file); 
    }
  };

  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !base64Image) {
      setError('Please select an image and provide a caption.');
      return;
    }

    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => {
            console.error('Error getting location:', err);
            reject(err);
          }
        )
      );

      const formData = {
        image: base64Image, 
        caption: caption,
        lat: coords.latitude.toString(),
        lng: coords.longitude.toString(),
      };

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        window.location.href = '/'; // Redirect to home page after success
      } else {
        const data = await res.json();
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Error occurred while fetching geolocation.');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)} // Handle caption change separately
      />

      {base64Image && <img src={base64Image} alt="Preview" style={{ maxWidth: '300px' }} />}
      
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadPhoto;
