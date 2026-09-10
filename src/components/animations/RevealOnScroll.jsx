"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const OBSERVER_OPTIONS = {
  threshold: 0.08,
  rootMargin: "0px 0px -40px 0px",
};

const REVEAL_TRANSITION_DURATION = 850;

let observerPool = null;

function getObserverPool() {
  if (observerPool) {
    return observerPool;
  }

  const callbacks = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const callback = callbacks.get(entry.target);

      if (callback) {
        callback(entry);
      }
    });
  }, OBSERVER_OPTIONS);

  observerPool = {
    callbacks,
    observer,
  };

  return observerPool;
}

function observeElement(element, callback) {
  const pool = getObserverPool();

  let isActive = true;

  pool.callbacks.set(element, callback);
  pool.observer.observe(element);

  return () => {
    if (!isActive) {
      return;
    }

    isActive = false;

    pool.callbacks.delete(element);
    pool.observer.unobserve(element);

    if (pool.callbacks.size === 0) {
      pool.observer.disconnect();
      observerPool = null;
    }
  };
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 32,
  scale = 0.985,
  once = false,
  as: Component = "div",
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let hasRevealed = element.classList.contains("reveal-on-scroll-visible");
    let willChangeTimer = null;
    let stopObserving = () => {};

    const clearWillChangeTimer = () => {
      if (willChangeTimer !== null) {
        window.clearTimeout(willChangeTimer);
        willChangeTimer = null;
      }
    };

    const releaseWillChange = (transitionDelay = 0) => {
      clearWillChangeTimer();

      willChangeTimer = window.setTimeout(
        () => {
          element.style.willChange = "auto";
          willChangeTimer = null;
        },
        REVEAL_TRANSITION_DURATION + transitionDelay + 50,
      );
    };

    const showElement = () => {
      if (hasRevealed && once) {
        return;
      }

      hasRevealed = true;

      clearWillChangeTimer();

      element.style.willChange = "opacity, transform";
      element.style.setProperty("--reveal-delay", `${delay}ms`);
      element.classList.add("reveal-on-scroll-visible");

      releaseWillChange(delay);
    };

    const hideElement = () => {
      if (once || !hasRevealed) {
        return;
      }

      hasRevealed = false;

      clearWillChangeTimer();

      element.style.willChange = "opacity, transform";
      element.style.setProperty("--reveal-delay", "0ms");
      element.classList.remove("reveal-on-scroll-visible");

      releaseWillChange();
    };

    if (prefersReducedMotion) {
      element.style.setProperty("--reveal-delay", "0ms");
      element.style.willChange = "auto";
      element.classList.add("reveal-on-scroll-visible");

      return () => {
        clearWillChangeTimer();
      };
    }

    if (!("IntersectionObserver" in window)) {
      const animationFrameId = window.requestAnimationFrame(showElement);

      return () => {
        window.cancelAnimationFrame(animationFrameId);
        clearWillChangeTimer();
      };
    }

    stopObserving = observeElement(element, (entry) => {
      if (entry.isIntersecting) {
        showElement();

        if (once) {
          stopObserving();
        }

        return;
      }

      hideElement();
    });

    return () => {
      stopObserving();
      clearWillChangeTimer();
    };
  }, [delay, once]);

  return (
    <Component
      ref={elementRef}
      style={{
        "--reveal-y": `${y}px`,
        "--reveal-scale": scale,
        "--reveal-delay": "0ms",
        willChange: "auto",
      }}
      className={cn("reveal-on-scroll", className)}
    >
      {children}
    </Component>
  );
}
