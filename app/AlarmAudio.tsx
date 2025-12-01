"use client";

import { useEffect } from "react";

export default function AlarmAudio() {
  useEffect(() => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.value = 0.02;
    oscillator.start();

    return () => {
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
      context.close().catch(() => undefined);
    };
  }, []);

  return null;
}
