import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Carousel = ({ children, infinite }) => {
  const [activeIndex, setActiveIndex] = useState(4);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isFirstRender, setIsFirstRender] = useState(true);

  const childrenRef = React.useRef();
  const childrenLength = React.Children.count(children);

  const circularArray = (number, length) => {
    let auxArray = Array.from({ length: length }, (_, i) => i);
    let mid1 = Math.floor(auxArray.length / 2);
    let mid2 = length - mid1 - 1;
    let circularArray = [auxArray[auxArray.indexOf(number)]];
    for (let i = 0; i < mid1; i++) {
      let index = auxArray.indexOf(number) + i + 1;
      if (index > length - 1) {
        index = index - length;
      }
      // push to the end of the array
      circularArray.push(auxArray[index]);
    }
    for (let i = 0; i < mid2; i++) {
      let index = auxArray.indexOf(number) - i - 1;
      if (index < 0) {
        index = length + index;
      }
      // push to the beginning of the array
      circularArray.unshift(auxArray[index]);
    }
    return circularArray;
  };

  const getCircularIndex = () => {
    let circularArrayIndexes = circularArray(activeIndex, childrenLength);
    let previousIndex =
      circularArrayIndexes[circularArrayIndexes.indexOf(activeIndex) - 1];
    let nextIndex =
      circularArrayIndexes[circularArrayIndexes.indexOf(activeIndex) + 1];
    let previousHiddenIndexes = circularArrayIndexes.slice(
      0,
      circularArrayIndexes.indexOf(activeIndex) - 1
    );
    let nextHiddenIndexes = circularArrayIndexes.slice(
      circularArrayIndexes.indexOf(activeIndex) + 2
    );
    return {
      previousIndex,
      nextIndex,
      previousHiddenIndexes,
      nextHiddenIndexes,
    };
  };

  const isPreviousHidden = (index) => {
    if (infinite) {
      const { previousHiddenIndexes } = getCircularIndex();
      return previousHiddenIndexes.includes(index);
    }
    return index < activeIndex - 1;
  };
  const isPrevious = (index) => {
    if (infinite) {
      const { previousIndex } = getCircularIndex();
      return index === previousIndex;
    }
    return index === activeIndex - 1;
  };
  const isCurrent = (index) => {
    return index === activeIndex;
  };
  const isNext = (index) => {
    if (infinite) {
      const { nextIndex } = getCircularIndex();
      return index === nextIndex;
    }
    return index === activeIndex + 1;
  };
  const isNextHidden = (index) => {
    if (infinite) {
      const { nextHiddenIndexes } = getCircularIndex();
      return nextHiddenIndexes.includes(index);
    }
    return index > activeIndex + 1;
  };

  childrenRef.current = React.Children.map(children, (child, index) => {
    return React.cloneElement(child, {
      "data-previous-hidden": isPreviousHidden(index) ? true : false,
      "data-previous": isPrevious(index) ? true : false,
      "data-current": isCurrent(index) ? true : false,
      "data-next": isNext(index) ? true : false,
      "data-next-hidden": isNextHidden(index) ? true : false,
      className:
        isFirstRender && index === activeIndex - 1
          ? child.props.className + " carousel__card_p--animate-in"
          : isFirstRender && index === activeIndex + 1
          ? child.props.className + " carousel__card_n--animate-in"
          : child.props.className,
    });
  });

  useEffect(() => {
    let timer;
    if (isFirstRender && childrenRef.current) {
      timer = setTimeout(() => {
        setIsFirstRender(false);
        setIsAnimating(false);
      }, 1100);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isFirstRender]);

  useEffect(() => {
    document.addEventListener("keydown", handleTabFocus);

    return () => {
      document.removeEventListener("keydown", handleTabFocus);
    };
  }, []);

  const handleTabFocus = (e) => {
    const trapFocusContainer = document.querySelector("[data-trap-focus=true]");
    if (!trapFocusContainer) {
      return;
    }

    const isTabPressed = e.key === "Tab" || e.keyCode === 9;
    if (!isTabPressed) {
      return;
    }

    const focusableElements = trapFocusContainer.querySelectorAll(
      "a[href], button:not([disabled]), textarea:not([disabled]), input[type=text]:not([disabled]), input[type=radio]:not([disabled]), input[type=checkbox]:not([disabled]), select:not([disabled]), [tabindex]:not([disabled]):not([tabindex='-1'])"
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement =
      focusableElements[focusableElements.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus();
        e.preventDefault();
      }
    }
  };

  const isNextAvailable = activeIndex < childrenLength - 1;
  const isPreviousAvailable = activeIndex > 0;

  const handleNext = () => {
    if (isAnimating) {
      return;
    }
    if (activeIndex === childrenLength - 1) {
      setActiveIndex(0);
    } else {
      setActiveIndex(activeIndex + 1);
    }
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const handlePrevious = () => {
    if (isAnimating) {
      return;
    }
    if (activeIndex === 0) {
      setActiveIndex(childrenLength - 1);
    } else {
      setActiveIndex(activeIndex - 1);
    }
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return createPortal(
    <div className="carousel__wrapper">
      <div className="carousel__container" data-trap-focus>
        <div className="carousel__overlay" />
        <div
          className="carousel__cards"
          style={{ gridTemplateColumns: `repeat(${children.length}, 1fr)` }}
        >
          {childrenRef.current}
        </div>
        <div className="carousel__controls">
          <button
            className="carousel__button carousel__button--previous"
            onClick={handlePrevious}
            disabled={!isPreviousAvailable && !infinite}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            className="carousel__button carousel__button--next"
            onClick={handleNext}
            disabled={!isNextAvailable && !infinite}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Carousel;
