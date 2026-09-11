"use client";

import { useEffect } from "react";

const CONTACT_SECTION_ID = "contact";
const CONTACT_ROOT_MARGIN = "1200px 0px";

function setLockedHeight(element, height) {
  const value = `${height}px`;

  if (element.style.height !== value) {
    element.style.height = value;
  }

  if (element.style.minHeight !== value) {
    element.style.minHeight = value;
  }

  if (element.style.maxHeight !== value) {
    element.style.maxHeight = value;
  }
}

function clearLockedHeight(element) {
  element.style.removeProperty("height");
  element.style.removeProperty("min-height");
  element.style.removeProperty("max-height");
}

function setSpacerHeight(element, height) {
  if (height <= 0) {
    element.style.removeProperty("height");
    element.style.removeProperty("min-height");
    return;
  }

  const value = `${height}px`;

  if (element.style.height !== value) {
    element.style.height = value;
  }

  if (element.style.minHeight !== value) {
    element.style.minHeight = value;
  }
}

export function ContactLayoutSync() {
  useEffect(() => {
    const root = document.getElementById(CONTACT_SECTION_ID);

    if (!root) {
      return;
    }

    let visibilityObserver = null;
    let stopLayoutSync = () => {};
    let hasStarted = false;

    function startLayoutSync() {
      if (hasStarted) {
        return;
      }

      hasStarted = true;

      const sourceCard = root.querySelector("[data-contact-source-card]");
      const sourceHeader = root.querySelector("[data-contact-source-header]");
      const sourceTop = root.querySelector("[data-contact-source-top]");
      const targetTop = root.querySelector("[data-contact-target-top]");
      const targetCard = root.querySelector("[data-contact-target-card]");
      const targetHeader = root.querySelector("[data-contact-target-header]");
      const targetSpacer = root.querySelector("[data-contact-target-spacer]");

      if (
        !sourceCard ||
        !sourceHeader ||
        !sourceTop ||
        !targetTop ||
        !targetCard ||
        !targetHeader ||
        !targetSpacer
      ) {
        return;
      }

      const desktopMediaQuery = window.matchMedia("(min-width: 1024px)");

      let animationFrameId = null;
      let isDisposed = false;

      function clearTargetLayout() {
        clearLockedHeight(targetCard);
        clearLockedHeight(targetHeader);
        setSpacerHeight(targetSpacer, 0);
      }

      function syncLayout() {
        if (isDisposed || animationFrameId !== null) {
          return;
        }

        animationFrameId = window.requestAnimationFrame(() => {
          animationFrameId = null;

          if (isDisposed) {
            return;
          }

          if (!desktopMediaQuery.matches) {
            clearTargetLayout();
            return;
          }

          const sourceCardHeight = Math.ceil(sourceCard.offsetHeight);
          const sourceHeaderHeight = Math.ceil(sourceHeader.offsetHeight);
          const sourceTopHeight = Math.ceil(sourceTop.offsetHeight);
          const targetTopHeight = Math.ceil(targetTop.offsetHeight);

          const targetSpacerHeight = Math.max(
            0,
            sourceTopHeight - targetTopHeight,
          );

          setLockedHeight(targetCard, sourceCardHeight);
          setLockedHeight(targetHeader, sourceHeaderHeight);
          setSpacerHeight(targetSpacer, targetSpacerHeight);
        });
      }

      const resizeObserver =
        "ResizeObserver" in window ? new ResizeObserver(syncLayout) : null;

      if (resizeObserver) {
        resizeObserver.observe(sourceCard);
        resizeObserver.observe(sourceHeader);
        resizeObserver.observe(sourceTop);
        resizeObserver.observe(targetTop);
      }

      function handleMediaChange() {
        syncLayout();
      }

      desktopMediaQuery.addEventListener("change", handleMediaChange);

      window.addEventListener("resize", syncLayout, {
        passive: true,
      });

      if (document.fonts?.ready) {
        document.fonts.ready.then(syncLayout).catch(() => {});
      }

      syncLayout();

      stopLayoutSync = () => {
        isDisposed = true;

        if (animationFrameId !== null) {
          window.cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        resizeObserver?.disconnect();

        desktopMediaQuery.removeEventListener("change", handleMediaChange);
        window.removeEventListener("resize", syncLayout);

        clearTargetLayout();
      };
    }

    if ("IntersectionObserver" in window) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry?.isIntersecting) {
            return;
          }

          visibilityObserver?.disconnect();
          visibilityObserver = null;

          startLayoutSync();
        },
        {
          root: null,
          rootMargin: CONTACT_ROOT_MARGIN,
          threshold: 0.01,
        },
      );

      visibilityObserver.observe(root);
    } else {
      startLayoutSync();
    }

    return () => {
      visibilityObserver?.disconnect();
      stopLayoutSync();
    };
  }, []);

  return null;
}
