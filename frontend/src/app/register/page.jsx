'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const router = useRouter();

  const submit = async e => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg('Registered! Please login.');
      setForm({ username: '', email: '', password: '' });
      router.push('/login');
    } else {
      const data = await res.json();
      setMsg(data.message || 'Error');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Register</h1>
      {msg && <p>{msg}</p>}
      <form onSubmit={submit}>
        <input placeholder="Username" value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })} /><br/>
        <input placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} /><br/>
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} /><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}