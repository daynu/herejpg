'use client';
import './upload.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadPhoto = () => {
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = captionRef.current;
    if (el) {
      el.style.height = 'auto'; // reset
      el.style.height = `${el.scrollHeight}px`; // grow
    }
  };

    useEffect(() => {
    autoResize();
  }, []);

  const router = useRouter();

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720, facingMode: 'environment' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
      });
  };

  useEffect(() => {
    if (useCamera) {
      getVideo();
    } else {
      // stop camera when toggled off
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [useCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setBase64Image(dataUrl);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !base64Image) {
      setError('Please select or capture an image and provide a caption.');
      return;
    }

    try {
      const coords = await new Promise<GeolocationCoordinates>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition((pos) => resolve(pos.coords), reject)
      );

      const formData = {
        image: base64Image,
        caption,
        lat: coords.latitude.toString(),
        lng: coords.longitude.toString(),
      };

      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Error occurred while fetching geolocation.');
    }
  };

  return (
    <form id='uploadForm' onSubmit={handleUpload}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h1>Upload Photo</h1>

      <input id='fileInput' className='form-control' type="file" accept="image/*" onChange={handleImageChange} />
      <textarea
        ref={captionRef}
        placeholder="Caption"
        value={caption}
        onChange={(e) => {
          setCaption(e.target.value);
          autoResize();
        }}
        className="caption-input"
      />


      {base64Image && (
        <img src={base64Image} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px' }} />
      )}

      <button className='upload-pg-button' type="submit">Upload</button>

      <button className='upload-pg-button' type="button" onClick={() => setUseCamera((prev) => !prev)}>
        {useCamera ? 'Stop Camera' : 'Use Camera'}
      </button>

      {useCamera && (
        <>
          <div id='cameraInputDiv' style={{ marginTop: '10px' }}>
            <video ref={videoRef} width="500" height="300" autoPlay playsInline />
          </div>
          <button id='captureButton' type="button" onClick={handleCapture} style={{ marginTop: '10px' }}>
            Capture Photo
          </button>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}

      <button id='cancelUploadButton' className='upload-pg-button' onClick={() => {router.push('/')}}>
        Cancel
      </button>
    </form>
  );
};

export default UploadPhoto;
