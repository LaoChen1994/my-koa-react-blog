import React, { useEffect } from 'react';
import styles from './style.module.scss';

interface Props {}

const Welcome: React.FC<Props> = () => {
  const degToArc = (deg: number) => (Math.PI * 2 * deg) / 360;

  const getCoordinate = (radius: number, x: number, y: number) => (
    angle: number
  ) => {
    const xDis = radius * Math.cos(degToArc(angle));
    const yDis = radius * Math.sin(degToArc(angle));

    return {
      corrdX: x + xDis,
      corrdY: y + yDis
    };
  };

  const initCanvas = () => {
    const elem = document.getElementById('plot') as HTMLCanvasElement;
    const ctx = elem.getContext('2d') as CanvasRenderingContext2D;
    const bigR = getCoordinate(100, 0, 0);
    const smallR = getCoordinate(50, 0, 0);

    // ******************************************************
    ctx.save();

    const gradient = ctx.createLinearGradient(0, 0, 80, 40);
    gradient.addColorStop(0.25, '#35477d');
    gradient.addColorStop(0.5, '#e7a4e4');
    gradient.addColorStop(0.75, '#f44');
    gradient.addColorStop(1, '#f67280');

    // 用于在canvas中使用外部字体
    const link = document.createElement('link') as HTMLLinkElement;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '../../static/style/mixins.css';

    document.getElementsByTagName('head')[0].appendChild(link);

    var image = new Image();
    image.src = link.href;
    image.onerror = function() {
      // @ts-ignore
      document.fonts.load('100px betty', 'Blog').then(() => {
        ctx.translate(400, 150);
        ctx.font = '100px betty';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = gradient;
        ctx.strokeText('Blog', 0, 0);
      });
    };
    // *************************************

    let NUM = 0;
    let color = '#35477d';
    let type: 'add' | 'clear' = 'add';
    const MAX_NUM = 60;
    function addStrip() {
      ctx.restore();
      ctx.save();

      ctx.clearRect(0, 0, 200, 300);

      ctx.translate(100, 150);
      // 初始化圆
      // ctx.beginPath();
      // ctx.strokeStyle = '#cfb495';
      // ctx.arc(0, 0, 100, 0, degToArc(360));
      // ctx.closePath();
      // ctx.stroke();

      // ctx.beginPath();
      // ctx.translate(0, 0);
      // ctx.arc(0, 0, 50, 0, degToArc(360));
      // ctx.closePath();
      // ctx.stroke();

      for (let i = 0; i < NUM % 60; i++) {
        const angle = (i * 360) / MAX_NUM;
        const { corrdX: bX, corrdY: bY } = bigR(angle);
        const { corrdX: sX, corrdY: sY } = smallR(angle);

        // if (!(NUM % MAX_NUM)) {
        color =
          '#' +
          (Math.random() * 0xffffff)
            .toString(16)
            .substr(0, 6)
            .toUpperCase()
            .padEnd(6, '0');
        // }

        ctx.beginPath();
        ctx.moveTo(sX, sY);
        ctx.lineTo(bX, bY);
        ctx.lineWidth = 5;
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      NUM++;
      requestAnimationFrame(addStrip);
    }

    setTimeout(() => {
      requestAnimationFrame(addStrip);
    }, 100);
  };

  useEffect(() => {
    initCanvas();
  }, []);

  return (
    <div className={styles.header}>
      <canvas width="600" height="300" id="plot"></canvas>
    </div>
  );
};

export default Welcome;
