'use client';
import { useEffect, useState } from 'react';

export default function ProtectedPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErr('No token, please login');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(json => setData(json))
      .catch(e => setErr(e.message));
  }, []);

  if (err) return <p style={{ color: 'red', padding: 16 }}>{err}</p>;
  if (!data) return <p style={{ padding: 16 }}>Loading…</p>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Protected Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}