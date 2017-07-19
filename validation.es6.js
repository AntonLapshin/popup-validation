(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.validation = factory());
}(this, (function () { 'use strict';

const Rules = {
  required: {
    message: "Required",
    method: el => {
      if (el.type === "checkbox") {
        return el.checked;
      } else if (el.type === "radio") {
        const name = el.name;
        return (
          el.parentNode.querySelectorAll(`input[name=${name}]:checked`).length >
          0
        );
      }
      return el.value !== "";
    }
  },
  email: {
    message: "E-mail is wrong",
    method: el => {
      return (
        el.value === "" ||
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          el.value
        )
      );
    }
  }
};

const VALIDATE = "validate";
const VALIDATE_POPUP = "validate-popup";
const DATA_VALIDATE = "data-validate";
const VALIDATE_ERROR = "validate-error";
const ACTIVE = "active";
const Events = ["change", "paste", "blur", "keyup"];

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

var index = {
  init: () => {
    setupEventHandlers(true);
  },

  destroy: () => {
    setupEventHandlers(false);
  },

  getRules: () => {
    return Rules;
  }
};

return index;

})));
