const VALIDATE = "validate";
const VALIDATE_POPUP = "validate-popup";
const DATA_VALIDATE = "data-validate";
const VALIDATE_ERROR = "validate-error";
const ACTIVE = "active";
const Events = ["change", "paste", "blur", "keyup"];

import { Rules } from "./rules";

const onAction = e => {
  const el = e.target;
  if (!el.matches("." + VALIDATE)) {
    return;
  }
  const types = el.getAttribute(DATA_VALIDATE).split(",").map(type => {
    return type.trim();
  });
  const message = types
    .filter(type => {
      return !Rules[type].method(el);
    })
    .map(type => {
      return Rules[type].message;
    })
    .join(", ");

  el.classList.toggle(VALIDATE_ERROR, !!message);
  let popup = el.previousElementSibling;
  if (message) {
    if (!popup || !popup.matches("." + VALIDATE_POPUP)) {
      popup = document.createElement("div");
      popup.classList.add(VALIDATE_POPUP);
      const wrap = document.createElement("div");
      wrap.appendChild(popup.cloneNode(true));
      el.insertAdjacentHTML("beforebegin", wrap.innerHTML);
      popup = el.previousElementSibling;
    }
    popup.innerHTML = message;
    window.setTimeout(() => {
      const left =
        el.clientWidth < popup.clientWidth
          ? el.offsetLeft + el.offsetWidth / 2 - 14
          : el.offsetLeft + el.clientWidth - popup.clientWidth + 1;
      const top = el.offsetTop;
      popup.style.left = left + "px";
      popup.style.top = top + "px";
      popup.style.marginTop = -(popup.clientHeight + 8) + "px";
      popup.classList.toggle(ACTIVE, true);
    }, 0);
  } else {
    popup && popup.classList.toggle(ACTIVE, false);
  }
};

const onClick = e => {
  const el = e.target;
  if (!el.matches("." + VALIDATE_POPUP)) {
    return;
  }
  const next = el.nextElementSibling;
  if (next.matches("." + VALIDATE)) {
    next.classList.toggle(VALIDATE_ERROR, false);
  }
  el.classList.toggle(ACTIVE, false);
};

const setupEventHandlers = setup => {
  const action = setup ? "addEventListener" : "removeEventListener";
  const validateEls = document.querySelectorAll("." + VALIDATE);
  Array.prototype.forEach.call(validateEls, el => {
    Events.forEach(e => {
      el[action](e, onAction);
    });
  });

  document[action]("click", onClick);
};

export default class Validation {
  init() {
    setupEventHandlers(true);
  }

  destroy() {
    setupEventHandlers(false);
  }

  getRules() {
    return Rules;
  }
}
