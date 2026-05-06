import { useState, useEffect } from 'react';

const getNow = () => new Date();

export const useCurrentTime = () => {
  const [now, setNow] = useState(getNow);

  useEffect(() => {
    const id = setInterval(() => setNow(getNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
};
