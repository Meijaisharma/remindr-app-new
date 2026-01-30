import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import './App.css';

function App() {
  useEffect(() => {
    LocalNotifications.requestPermissions();
  }, []);

  const setAlarm = async () => {
    await LocalNotifications.schedule({
      notifications: [{
        title: "Re:mindr",
        body: "Time is up! ⏳",
        id: 1,
        schedule: { at: new Date(Date.now() + 5000) },
        sound: 'beep.wav'
      }]
    });
    alert("Alarm set for 5 seconds!");
  };

  return (
    <div className="ios-container">
      <div className="glass-card">
        <h1>Re:mindr</h1>
        <p>Focus Reminder</p>
        <button className="ios-btn" onClick={setAlarm}>🔔 Set Alarm (5s)</button>
      </div>
    </div>
  );
}
export default App;
