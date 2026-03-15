import React from "react";
import ReactDOM from "react-dom/client";
import FaultyTerminal from "./FaultyTerminal";

const FaultyTerminalRoot: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "100%", position: "fixed", inset: 0, zIndex: 0 }}>
      <FaultyTerminal
        scale={1.5}
        gridMul={[2, 1]}
        digitSize={2}
        timeScale={0.2}
        pause={false}
        scanlineIntensity={0.3}
        glitchAmount={1}
        flickerAmount={0.6}
        noiseAmp={1}
        chromaticAberration={1}
        dither={0.69}
        curvature={0.1}
        tint="#4a90e2"
        mouseReact
        mouseStrength={0.5}
        pageLoadAnimation
        brightness={0.5}
      />
    </div>
  );
};

const container = document.getElementById("faulty-terminal-root");

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<FaultyTerminalRoot />);
}

