(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.validation = factory());
}(this, (function () { 'use strict';

const regex = {
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};

const RULES = {
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
    method: el => el.value === "" || regex.email.test(el.value.trim())
  },
  emails: {
    message: "E-mail is wrong",
    method: el =>
      el.value === "" ||
      el.value.split(/;|,/).every(v => regex.email.test(v.trim()))
  }
};

const VALIDATE = "validate";
const VALIDATE_POPUP = "validate-popup";
const DATA_VALIDATE = "data-validate";
const VALIDATE_ERROR = "validate-error";
const ACTIVE = "active";
const OPTIONS = {
  events: ["change", "paste", "blur", "keyup"]
};
const CUSTOM_CLASS_STYLES = `
  {0} {
    border-color: #D10000 !important;
  }
  {0}:before {
    opacity: 1;
  }
  {0}:after {
    opacity: 1;
  }`;
const document = window.document;

let _customSelector = "";

const throttle = (fn, threshhold = 250, scope) => {
  let last, deferTimer;
  return () => {
    const now = +new Date(),
      args = arguments;
    if (last && now < last + threshhold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(scope, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(scope, args);
    }
  };
};

const getMessage = input =>
  input
    .getAttribute(DATA_VALIDATE)
    .split(",")
    .map(type => type.trim())
    .filter(type => !RULES[type].method(input))
    .map(type => RULES[type].message)
    .join(", ");

const createPopup = input => {
  let popup = document.createElement("div");
  popup.classList.add(VALIDATE_POPUP);
  const wrap = document.createElement("div");
  wrap.appendChild(popup.cloneNode(true));
  input.insertAdjacentHTML("beforebegin", wrap.innerHTML);
  popup = input.previousElementSibling;
  return popup;
};

const forceToggleClass = (el, className, force) => {
  if (force && !el.classList.contains(className)) {
    el.classList.add(className);
  } else if (!force && el.classList.contains(className)) {
    el.classList.remove(className);
  }
};

const show = (input, message) => {
  if (input.offsetWidth === 0 && input.offsetHeight === 0) {
    return;
  }

  forceToggleClass(input, VALIDATE_ERROR, true);
  let popup = input.previousElementSibling;

  if (!popup || !popup.matches("." + VALIDATE_POPUP)) {
    //
    // Create popup if it doesn't exist
    //
    popup = createPopup(input);
  }
  popup.innerHTML = message;
  window.setTimeout(() => {
    const left =
      input.clientWidth < popup.clientWidth
        ? ~~(input.offsetLeft + input.offsetWidth / 2 - 14) + 1
        : input.offsetLeft + input.clientWidth - popup.clientWidth + 1;
    const top = input.offsetTop;
    popup.style.left = left + "px";
    popup.style.top = top + "px";
    popup.style.marginTop = -(popup.clientHeight + 8) + "px";
    forceToggleClass(popup, ACTIVE, true);
    forceToggleClass(
      popup,
      "short-version",
      input.clientWidth < popup.clientWidth
    );
  }, 0);
};

const hide = input => {
  forceToggleClass(input, VALIDATE_ERROR, false);
  const popup = input.previousElementSibling;
  if (popup && popup.matches("." + VALIDATE_POPUP)) {
    forceToggleClass(popup, ACTIVE, false);
  }
};

const toggle = (input, message) => {
  if (message) {
    show(input, message);
  } else {
    hide(input);
  }
};

const onAction = e => {
  const input = e.target;
  if (!input.matches("." + VALIDATE)) {
    return;
  }
  const message = getMessage(input);

  if (input.type === "radio") {
    const name = input.name;
    const rbs = document.querySelectorAll(`input[name="${name}"]`);
    [].forEach.call(rbs, rb => toggle(rb, message));
  } else {
    toggle(input, message);
  }
};

const getEl = (el = "body") =>
  typeof el === "string" ? document.querySelector(el) || document.body : el;

const getInputs = el => el.querySelectorAll("." + VALIDATE);

const onClick = e => {
  const popup = e.target;
  if (!popup.matches("." + VALIDATE_POPUP)) {
    return;
  }
  const input = popup.nextElementSibling;
  if (input.matches("." + VALIDATE)) {
    hide(input);
  }
};

const onSubmit = e => {
  const isValid = validation.validate(e.target);
  if (isValid) {
    return true;
  }
  e.preventDefault();
  return false;
};

const onResize = throttle(() => {
  [].forEach.call(document.querySelectorAll("." + VALIDATE_POPUP), popup =>
    forceToggleClass(popup, ACTIVE, false)
  );
}, 1000);

const setupEventHandlers = (el, setup) => {
  el = getEl(el);
  const action = setup ? "addEventListener" : "removeEventListener";
  const inputs = getInputs(el);
  [].forEach.call(inputs, input =>
    OPTIONS.events.forEach(e => input[action](e, onAction))
  );

  document[action]("click", onClick);

  if (el.nodeName === "FORM") {
    el[action]("submit", onSubmit);
  }

  window[action]("resize", onResize);
};

const validation = {
  /**
   * Initialize the validation fields
   * 
   * @param {Element|string} el Container or specific form
   * @param {object} options [Optional] Set of the properties
   *  - events: [string]
   * @returns {object} validation instance (chain call)
   */
  init: (el, options) => {
    Object.assign(OPTIONS, options);
    setupEventHandlers(el, true);
    return validation;
  },

  /**
   * Predefined set of the Rules
   */
  rules: RULES,

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
    const inputs = getInputs(el);
    [].forEach.call(inputs, input => hide(input));
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
    const inputs = getInputs(el);
    [].forEach.call(inputs, input => onAction({ target: input }));
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
    const inputs = getInputs(el);
    let valid = [].every.call(inputs, input => !getMessage(input));
    if (_customSelector && el.querySelectorAll(_customSelector).length > 0) {
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
   * Add class validation. For external libraries that can 
   * set/remove className of the element
   * 
   * For instance, braintree-hosted-fields-invalid class is 
   * set by braintree client library when iframe with the 
   * input fieldan error detects an error, More info here:
   * https://developers.braintreepayments.com/guides/hosted-fields/styling/javascript/v2
   * 
   * @param {string} selector Selector that indicates that the field is invalid
   * @returns {object} validation instance (chain call)
   */
  addClassValidation: selector => {
    const styles = selector
      .split(",")
      .map(s => CUSTOM_CLASS_STYLES.replace(/\{0\}/gi, s))
      .join("");
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
    _customSelector =
      _customSelector + (_customSelector === "" ? "" : ",") + selector;
    return validation;
  }
};

return validation;

})));
