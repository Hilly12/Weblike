import React, {useEffect, useRef} from 'react';

type VoidFunction = () => (unknown | void);

interface CanvasProps {
  width: number;
  height: number;
  refreshRate: number;
  start: VoidFunction;
  update: VoidFunction;
  paint: (context: CanvasRenderingContext2D) => (unknown | void);
}

function useInterval(callback: VoidFunction, delay: number) {
  const savedCallback = useRef<VoidFunction | null>(null)

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    const id = setInterval(tick, delay)
    return () => clearInterval(id)

  }, [delay])
}

const Canvas = ({width, height, refreshRate, start, update, paint}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    start();
  }, [start]);

  useInterval(() => {
    update();
    repaint();
  }, refreshRate);

  const repaint = () => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    paint(context);
  };

  return <canvas ref={canvasRef} height={height} width={width}/>;
};

Canvas.defaultProps = {
  width: window.innerWidth,
  height: window.innerHeight,
  refreshRate: 1000,
  start: () => {
    console.log("Canvas Initialized");
  },
  update: () => {
    console.log("Canvas Updated");
  },
  paint: (context: CanvasRenderingContext2D) => {
    console.log("Canvas Repainted");
  }
};

export default Canvas;