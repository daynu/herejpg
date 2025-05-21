'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';

const Register = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
    const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (error) {
      setErrorMsg('Something went wrong. Try again.');
    }

  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto" id="log-in-form">
      <h3 id="logo">HereJPG</h3>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <input
            id="name"
            type="text"
            className="form-control mb-3"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
        />

      <input
        id="email"
        type="email"
        className="form-control mb-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required 
      />

      <input
        id="password"
        type="password"
        className="form-control mb-3"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        id="submitForm"
        type="submit"
        className="btn btn-outline-dark mb-3"
      >
        Register
      </button>
      <p className="text-center">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
};

export default Register;
