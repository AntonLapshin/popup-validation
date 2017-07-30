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
const ValidationClassStyles = `
.{0} {
  border-color: #D10000 !important;
}
.{0}:before {
  opacity: 1;
}
.{0}:after {
  opacity: 1;
}`;

//
// Custom Validation Class
//
let _className = null;

const getMessage = el => {
  return el
    .getAttribute(DATA_VALIDATE)
    .split(",")
    .map(type => {
      return type.trim();
    })
    .filter(type => {
      return !Rules[type].method(el);
    })
    .map(type => {
      return Rules[type].message;
    })
    .join(", ");
};

const onAction = e => {
  const el = e.target;
  if (!el.matches("." + VALIDATE)) {
    return;
  }
  const message = getMessage(el);

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
      popup.classList.toggle(
        "short-version",
        el.clientWidth < popup.clientWidth
      );
    }, 0);
  } else {
    if (el.type === "radio") {
      const name = el.name;
      const rbs = document.querySelectorAll(`input[name="${name}"]`);
      Array.prototype.forEach.call(rbs, el => {
        const popup = el.previousElementSibling;
        if (popup && popup.matches("." + VALIDATE_POPUP)) {
          popup.classList.toggle(ACTIVE, false);
        }
      });
    } else if (popup && popup.matches("." + VALIDATE_POPUP)) {
      popup.classList.toggle(ACTIVE, false);
    }
  }
};

const getEl = (el = "body") =>
  typeof el === "string" ? document.querySelector(el) : el;

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

const onSubmit = e => {
  const isValid = validation.validate(e.target);
  if (isValid) {
    return true;
  }
  e.preventDefault();
  return false;
};

const setupEventHandlers = (el, setup) => {
  el = getEl(el);
  const action = setup ? "addEventListener" : "removeEventListener";
  const els = el.querySelectorAll("." + VALIDATE);
  Array.prototype.forEach.call(els, el => {
    Events.forEach(e => {
      el[action](e, onAction);
    });
  });

  document[action]("click", onClick);

  if (el.nodeName === "FORM") {
    el[action]("submit", onSubmit);
  }
};

const validation = {
  /**
   * Initialize the validation fields
   * 
   * @param {Element|string} Container or specific form
   * @returns {object} validation instance (chain call)
   */
  init: el => {
    setupEventHandlers(el, true);
    return validation;
  },

  /**
   * Deactivate the validation fields
   * 
   * @param {Element|string} Container or specific form
   * @returns {object} validation instance (chain call)
   */
  destroy: el => {
    validation.hide(el);
    setupEventHandlers(el, false);
    return validation;
  },

  /**
   * Hide all opened popups inside of the containers
   * 
   * @param {Element|string} Container or specific form
   * @returns {object} validation instance (chain call)
   */
  hide: el => {
    el = getEl(el);
    const els = el.querySelectorAll("." + VALIDATE_POPUP);
    Array.prototype.forEach.call(els, el => {
      el.classList.toggle(ACTIVE, false);
      const next = el.nextElementSibling;
      if (next.matches("." + VALIDATE)) {
        next.classList.toggle(VALIDATE_ERROR, false);
      }
    });
    return validation;
  },

  /**
   * Show error popups inside of the container
   * 
   * @param {Element} el Container
   * @returns {object} validation instance (chain call)
   */
  highlight: el => {
    el = getEl(el);
    const els = el.querySelectorAll("." + VALIDATE);
    Array.prototype.forEach.call(els, el => {
      const event = document.createEvent("HTMLEvents");
      event.initEvent("blur", true, false);
      el.dispatchEvent(event);
    });
    return validation;
  },

  /**
   * Check if all input fields inside of the container are valid
   * 
   * @param {Element} el Container
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  isValid: el => {
    el = getEl(el);
    const els = el.querySelectorAll("." + VALIDATE);
    let valid = Array.prototype.every.call(els, el => {
      return !getMessage(el);
    });
    if (_className && el.querySelectorAll("." + _className).length > 0) {
      valid = false;
    }
    return valid;
  },

  /**
   * Validate all input fields in the DOM container 
   * 
   * @param {Element} el Container
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  validate: el => {
    validation.highlight(el);
    return validation.isValid(el);
  },

  /**
   * Returns the set of the predefined rules
   * 
   * @returns {object} Rules
   * 
   * ruleName: {
   *   message: "Message when element didn't pass the rule",
   *   method: el => boolean
   * }
   * 
   */
  getRules: () => {
    return Rules;
  },

  /**
   * Add class validation. For external libraries that can 
   * set/remove className of the element
   * 
   * For instance, braintree-hosted-fields-invalid class is 
   * set by braintree client library when iframe with the 
   * input fieldan error detects an error, More info here:
   * https://developers.braintreepayments.com/guides/hosted-fields/styling/javascript/v2
   * 
   * @param {string} className Class name that indicates that the field is invalid
   * @returns {object} validation instance (chain call)
   */
  addClassValidation: className => {
    const styles = ValidationClassStyles.replace(/\{0\}/gi, className);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
    _className = className;
    return validation;
  }
};

return validation;

})));
