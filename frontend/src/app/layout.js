export const metadata = { title: 'JWT App' };

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav style={{ padding: 16, background: '#eee' }}>
          <a href="/register" style={{ marginRight: 16 }}>Register</a>
          <a href="/login" style={{ marginRight: 16 }}>Login</a>
          <a href="/protected">Protected</a>
        </nav>
        {children}
      </body>
    </html>
  );
}