import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import './FlipCard.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const snap = (degrees) => Math.round(degrees / 180) * 180;
const isBack = (degrees) => Math.abs(Math.round(degrees / 180)) % 2 === 1;

function FlipCard({ front, back, flipped, onFlipChange, ariaLabel = 'Flip card' }) {
  const reduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const shownRef = useRef(flipped);
  const pointerRef = useRef(null);
  const animationRef = useRef(null);
  const targetRef = useRef(flipped ? 180 : 0);
  const turn = useMotionValue(flipped ? 180 : 0);
  const tiltX = useSpring(0, { stiffness: 240, damping: 24, mass: 0.6 });
  const tiltY = useSpring(0, { stiffness: 240, damping: 24, mass: 0.6 });
  const lift = useSpring(1, { stiffness: 320, damping: 26 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const rotation = useTransform([turn, tiltY], ([spin, tilt]) => spin + tilt);
  const transform = useMotionTemplate`perspective(900px) scale(${lift}) rotateX(${tiltX}deg) rotateY(${rotation}deg)`;
  const glowXPercent = useMotionTemplate`${glowX}%`;
  const glowYPercent = useMotionTemplate`${glowY}%`;

  shownRef.current = flipped;

  function settle(degrees, velocity = 0, instant = false) {
    animationRef.current?.stop();
    targetRef.current = degrees;
    if (instant || reduceMotion) turn.jump(degrees);
    else {
      animationRef.current = animate(turn, degrees, {
        type: 'spring',
        stiffness: 170,
        damping: 20,
        velocity,
        restDelta: 0.05,
      });
    }

    const next = isBack(degrees);
    if (next !== shownRef.current) {
      shownRef.current = next;
      onFlipChange(next);
    }
  }

  function flip(instant = false) {
    const base = snap(turn.get());
    settle(isBack(base) ? base - 180 : base + 180, 0, instant);
  }

  function resetHover() {
    tiltX.set(0);
    tiltY.set(0);
    lift.set(1);
  }

  useEffect(() => {
    if (isBack(targetRef.current) === flipped) return;
    const next = isBack(targetRef.current) ? targetRef.current - 180 : targetRef.current + 180;
    targetRef.current = next;
    if (reduceMotion) turn.jump(next);
    else animationRef.current = animate(turn, next, { type: 'spring', stiffness: 170, damping: 20 });
  }, [flipped, reduceMotion, turn]);

  useEffect(() => () => animationRef.current?.stop(), []);

  function handlePointerDown(event) {
    if (event.button !== 0 || pointerRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    animationRef.current?.stop();
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startRotation: turn.get(),
      moved: false,
      lastRotation: turn.get(),
      lastTime: performance.now(),
    };
    if (!reduceMotion) lift.set(1.03);
  }

  function handlePointerMove(event) {
    const pointer = pointerRef.current;
    if (pointer?.id === event.pointerId) {
      const distance = event.clientX - pointer.startX;
      if (!pointer.moved && Math.abs(distance) < 6) return;
      pointer.moved = true;
      setDragging(true);
      const next = pointer.startRotation + (distance / 300) * 180;
      turn.set(next);
      const now = performance.now();
      pointer.lastRotation = next;
      pointer.lastTime = now;
      return;
    }

    if (reduceMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
    const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
    tiltX.set((0.5 - y) * 14);
    tiltY.set((x - 0.5) * 14);
    glowX.set(x * 100);
    glowY.set(y * 100);
  }

  function handlePointerUp(event, cancelled = false) {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);

    if (!pointer.moved) {
      if (!cancelled) flip();
      return;
    }

    const velocity = (pointer.lastRotation - pointer.startRotation) / 0.3;
    const destination = cancelled ? snap(pointer.startRotation) : clamp(snap(turn.get() + velocity * 0.16), snap(turn.get()) - 180, snap(turn.get()) + 180);
    settle(destination, velocity);
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!event.repeat) flip(true);
  }

  return (
    <div
      className={`flip-card${dragging ? ' is-dragging' : ''}`}
      role="button"
      tabIndex="0"
      aria-pressed={flipped}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => handlePointerUp(event)}
      onPointerCancel={(event) => handlePointerUp(event, true)}
      onPointerLeave={resetHover}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.detail === 0 && flip(true)}
      onDragStart={(event) => event.preventDefault()}
    >
      <motion.div className="flip-card__rotor" style={reduceMotion ? undefined : { transform, '--glow-x': glowXPercent, '--glow-y': glowYPercent }}>
        <div className="flip-card__face flip-card__face--front" aria-hidden={flipped}>
          {front}
          <span className="flip-card__glow" aria-hidden="true" />
        </div>
        <div className="flip-card__face flip-card__face--back" aria-hidden={!flipped}>
          {back}
          <span className="flip-card__glow" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  );
}

export default FlipCard;
