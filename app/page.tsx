export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Mot du Jour API</h1>
      <p>Daily message webhooks are running</p>
      <ul>
        <li>POST /api/webhooks/get-active-users</li>
        <li>POST /api/webhooks/generate-message</li>
        <li>POST /api/webhooks/check-message-history</li>
        <li>POST /api/webhooks/log-sent-message</li>
      </ul>
    </div>
  );
}