import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect } from 'react';
import './map.css';
import L from 'leaflet';

interface Photo {
  location: {
    lat: number;
    lng: number;
  };
  caption: string;
  image: string;
  _id: string;
  createdAt: string;
  user: {
    name: string;
    _id: string;
  };
}

interface User {
  name: string;
  id: string;
  role: 'user' | 'admin';
}

interface MapProps {
  center: LatLngExpression;
}

const SetViewOnCenterChange: React.FC<{ center: LatLngExpression }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  return null;
};

const Map: React.FC<MapProps> = ({ center }) => {
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [editingPhoto, setEditingPhoto] = React.useState<Photo | null>(null);
  const [editCaption, setEditCaption] = React.useState<string>('');
  const [editImage, setEditImage] = React.useState<string>('');

  useEffect(() => {
    const fetchPhotos = async () => {
      const response = await fetch('/api/photos');
      const data = await response.json();
      setPhotos(data.posts);
    };

    fetchPhotos();
  }, []);

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
        setUser(
          {
            name: data.name,
            id: data.id,
            role: data.role,
          }
        );
      } else {
        console.error(data.message);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log('User:', user);
  }, [user]);

  const handleEditButton = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditCaption(photo.caption);
    setEditImage(photo.image);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;

    const res = await fetch('/api/photos', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: editingPhoto._id,
        caption: editCaption,
        image: editImage,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) =>
          p._id === editingPhoto._id ? { ...p, caption: editCaption, image: editImage } : p
        )
      );
      setEditingPhoto(null);
    } else {
      console.error(data.message);
    }
  };

  const handleDeleteButton = async (photo: Photo) => {
    console.log('Delete button clicked for photo:', photo);
    const res = await fetch('/api/photos', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: photo._id }),
    });
    const data = await res.json();
    if (res.ok) {
      setPhotos((prevPhotos) => prevPhotos.filter((p) => p._id !== photo._id));
    } else {
      console.error(data.message);
    }
  }

  return (
    <>
    <MapContainer
      id="mapContainer"
      center={center}
      zoom={3}
      zoomControl={false}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomControl position="bottomleft" />
      <SetViewOnCenterChange center={center} />

      {photos.map((photo, idx) => {
        const customIcon = L.icon({
          iconUrl: photo.image,
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -50],
          className: 'photo-marker',
        });

        return (
          <Marker
            key={idx}
            position={[photo.location.lat, photo.location.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className='popupContent'>
                <strong>{photo.user.name}</strong>
              
                {photo.caption}

                <br />
                <img
                  src={photo.image}
                  alt="Uploaded"
                  style={{ maxWidth: '150px', maxHeight: '150px' }}
                />
                 {photo.createdAt && (
                  <span>Posted on: {new Date(photo.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}</span>
                )}
                {user && ( String(user?.id) === String(photo.user._id) || user.role == 'admin') && (
                  <div className='mapButtonsContainer' style={{ marginTop: '8px' }}>
                    <button className='mapButton' onClick={() => handleEditButton(photo)}>Edit</button>
                    <button className='mapButton deleteButton' onClick={() => handleDeleteButton(photo)}>Delete</button>
                  </div>
                )}
              </div>
  
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>

    {editingPhoto && (
  <div className="edit-sidebar">
    <h2>Edit Photo</h2>
    <label>
      Caption:
      <input
        type="text"
        value={editCaption}
        onChange={(e) => setEditCaption(e.target.value)}
      />
    </label>

    <label>
      Current Image:
      <img
        src={editImage}
        alt="Current"
        id='current-image'
      />
    </label>
    <label>
      New Image:
      <input
        className='form-control'
        type="file"
        accept="image/*"
         onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  if (reader.result && typeof reader.result === 'string') {
                    setEditImage(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
      />
    </label>
    <div className="sidebar-buttons">
      <button className='mapButton' onClick={handleSaveEdit}>Save</button>
      <button className='mapButton deleteButton' onClick={() => {
        setEditingPhoto(null);
        setEditImage('');
        setEditCaption('');
      }}>
        Cancel
      </button>
    </div>
  </div>
)}

    </>
  );
};

export default Map;
