'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);
  const router = useRouter();

  const submit = async e => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      router.push('/protected');
    } else {
      setErr(data.message || 'Login failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Login</h1>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} /><br/>
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} /><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}