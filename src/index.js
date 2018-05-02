import "./style.scss";
import rule from "./rules";

const document = window.document;
const VALIDATE = "validate";
const VALIDATE_POPUP = "validate-popup";
const DATA_VALIDATE = "data-validate";
const VALIDATE_ERROR = "validate-error";
const ACTIVE = "active";
const _customSelectors = [];
const OPTIONS = {
  events: ["change", "paste", "blur", "keyup"]
};
const CUSTOM_CLASS_STYLES = `
  {0} {
    border-color: #D10000 !important;
  }
  {0}:before {
    opacity: 1 !important;
    {1}
  }
  {0}:after {
    opacity: 1 !important;
  }`;

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
    .filter(type => !rules[type].method(input))
    .map(type => rules[type].message)
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

const forceToggleClass = (
  el,
  className,
  value,
  contains = el.classList.contains(className)
) =>
  ((value && !contains) || (!value && contains)) &&
  el.classList[value && !contains ? "add" : "remove"](className);

const show = (input, message) => {
  if (input.offsetWidth === 0 && input.offsetHeight === 0) {
    return;
  }

  forceToggleClass(input, VALIDATE_ERROR, true);
  let popup = input.previousElementSibling;

  if (!popup || !popup.matches("." + VALIDATE_POPUP)) {
    popup = createPopup(input);
  }
  popup.innerHTML = message;
  window.setTimeout(() => {
    const left =
      input.clientWidth < popup.clientWidth
        ? ~~(input.offsetLeft + input.offsetWidth / 2 - 14) + 1
        : input.offsetLeft + input.clientWidth - popup.clientWidth + 1;
    popup.style.left = left + "px";
    popup.style.top = input.offsetTop + "px";
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
  popup &&
    popup.matches("." + VALIDATE_POPUP) &&
    forceToggleClass(popup, ACTIVE, false);
};

const toggle = (input, message) =>
  message ? show(input, message) : hide(input);

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

const onClick = e =>
  e.target.matches("." + VALIDATE_POPUP) &&
  e.target.nextElementSibling.matches("." + VALIDATE) &&
  hide(e.target.nextElementSibling);

const onSubmit = e => {
  const isValid = validation.validate(e.target);
  !isValid && e.preventDefault();
  return isValid;
};

const onResize = throttle(
  () =>
    [].forEach.call(document.querySelectorAll("." + VALIDATE_POPUP), popup =>
      forceToggleClass(popup, ACTIVE, false)
    ),
  1000
);

const setupEventHandlers = (el, setup) => {
  el = getEl(el);
  const action = setup ? "addEventListener" : "removeEventListener";
  const inputs = getInputs(el);
  [].forEach.call(inputs, input =>
    OPTIONS.events.forEach(e => input[action](e, onAction))
  );

  el.nodeName === "FORM" && el[action]("submit", onSubmit);
  document[action]("click", onClick);
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
  init: (el, options) => (
    Object.assign(OPTIONS, options), setupEventHandlers(el, true), validation
  ),
  /**
   * Predefined set of the rules
   */
  rules,

  /**
   * Deactivate the validation fields
   *
   * @param {Element|string} Container or specific form
   * @returns {object} validation instance (chain call)
   */
  destroy: el => (
    validation.hideAll(el), setupEventHandlers(el, false), validation
  ),
  /**
   * Hide all opened popups inside of the container
   *
   * @param {Element|string} Container or specific form
   * @returns {object} validation instance (chain call)
   */
  hideAll: el => (
    [].forEach.call(getInputs(getEl(el)), input => hide(input)), validation
  ),
  /**
   * Show error popups inside of the container
   *
   * @param {Element} el Container
   * @returns {object} validation instance (chain call)
   */
  highlight: el => (
    [].forEach.call(getInputs(getEl(el)), input => onAction({ target: input })),
    validation
  ),
  /**
   * Check if all input fields inside of the container are valid
   *
   * @param {Element} el Container
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  isValid: el =>
    el.querySelectorAll(_customSelectors.join(",")).length === 0 &&
    [].every.call(getInputs(getEl(el)), input => !getMessage(input)),

  /**
   * Validate all input fields in the DOM container
   *
   * @param {Element} el Container
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  validate: el => (validation.highlight(el), validation.isValid(el)),

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
   * @param {string} Optional: message. "Invalid" by default
   * @returns {object} validation instance (chain call)
   */
  addClassValidation: (selector, msg = "Invalid") => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = selector
      .split(",")
      .map(s =>
        CUSTOM_CLASS_STYLES.replace(/\{0\}/gi, s).replace(
          /\{1\}/gi,
          !msg ? "" : `content: '${msg}' !important;`
        )
      )
      .join("");
    document.head.appendChild(styleTag);
    _customSelectors.push(selector);
    return validation;
  },

  /**
   * Show a message for an input field
   *
   * @param {Element} input Input Dom Element
   * @param {string} message Popup message
   * @returns {object} validation instance (chain call)
   */
  show: (input, message) => (show(input, message), validation),

  /**
   * Hide a popup message for an input field
   *
   * @param {Element} input Input Dom Element
   * @returns {object} validation instance (chain call)
   */
  hide: input => (hide(input), validation)
};

export default validation;
