export const sendPushNotification = async (pushToken, title, body) => {
  if (!pushToken) {
    console.log('sendPushNotification: no pushToken, skipping');
    return;
  }

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: pushToken, title, body, sound: 'default' }),
    });

    const data = await response.json();
    console.log('Expo push response:', JSON.stringify(data)); // ← share this output
  } catch (err) {
    console.error('Push notification error:', err.message);
  }
};