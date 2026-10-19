import { useEffect, useState } from 'react';

// The live thing: from the visitor's own clock, where HX-07 is on today's practice laps.
// A lap is 92 minutes; the first 36 of each are flown in Earth's shadow.
const LAP = 92 * 60;
const SHADOW = 36 * 60;
const DAY = 24 * 60 * 60;

function read(now: Date) {
  const s = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const lap = Math.floor(s / LAP) + 1;
  const into = s % LAP;
  const night = into < SHADOW;
  const toSunrise = night ? SHADOW - into : LAP - into + SHADOW;
  return { lap, laps: Math.ceil(DAY / LAP), into, night, toSunrise };
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

export default function LapClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const r = read(now);
  const minutes = Math.floor(r.into / 60);

  return (
    <div className="lap">
      <p className="lap__text">
        Right now HX-07 is {minutes} min into practice lap {r.lap} of {r.laps} today,{' '}
        {r.night ? 'on the night side' : 'in daylight'}. Next sunrise in{' '}
        <span className="lap__time">{mmss(r.toSunrise)}</span>.
      </p>
      <div
        className="lap__bar"
        role="meter"
        aria-label="Progress through the current lap"
        aria-valuemin={0}
        aria-valuemax={92}
        aria-valuenow={minutes}
      >
        <span className="lap__shadow" style={{ width: `${(SHADOW / LAP) * 100}%` }} />
        <span className="lap__track" style={{ transform: `translateX(${(r.into / LAP) * 100}%)` }}>
          <span className="lap__craft" />
        </span>
      </div>
    </div>
  );
}
