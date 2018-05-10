import "./style.scss";
import rules from "./rules";

const _customSelectors = [];
const doc = window.document;
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
    border-color: #D10000;
  }
  {0}:before {
    opacity: 1;
  }
  {0}:after {
    opacity: 1;
  }  
  {0}-ready:before {
    {1};
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

const createPopup = el => (
  el.insertAdjacentHTML("beforebegin", `<div class="${VALIDATE_POPUP}"/>`),
  el.previousElementSibling
);

const classList = {
  add: (el, className) => (el.className += " " + className),
  remove: (el, className) => el.className = el.className.replace(className, "")
};

const forceToggleClass = (
  el,
  className,
  value,
  contains = ~el.className.indexOf(className)
) =>
  ((value && !contains) || (!value && contains)) &&
  classList[value && !contains ? "add" : "remove"](el, className);

const show = (el, message) => {
  el = getEl(el);
  if (el.offsetWidth === 0 && el.offsetHeight === 0) {
    return;
  }

  forceToggleClass(el, VALIDATE_ERROR, true);
  let popup = el.previousElementSibling;

  if (!popup || !popup.matches("." + VALIDATE_POPUP)) {
    popup = createPopup(el);
  }
  popup.innerHTML = message;
  window.setTimeout(() => {
    const left =
      el.clientWidth < popup.clientWidth
        ? ~~(el.offsetLeft + el.offsetWidth / 2 - 14) + 1
        : el.offsetLeft + el.clientWidth - popup.clientWidth + 1;
    popup.style.left = left + "px";
    popup.style.top = el.offsetTop + "px";
    popup.style.marginTop = -(popup.clientHeight + 8) + "px";
    forceToggleClass(popup, ACTIVE, true);
    forceToggleClass(
      popup,
      "short-version",
      el.clientWidth < popup.clientWidth
    );
  }, 0);
};

const hide = el => {
  el = getEl(el);
  forceToggleClass(el, VALIDATE_ERROR, false);
  const popup = el.previousElementSibling;
  popup &&
    popup.matches("." + VALIDATE_POPUP) &&
    forceToggleClass(popup, ACTIVE, false);
};

const toggle = (el, message) => (message ? show(el, message) : hide(el));

const onAction = e => {
  const input = e.target;
  if (!input.matches("." + VALIDATE)) {
    return;
  }
  const message = getMessage(input);

  if (input.type === "radio") {
    const name = input.name;
    const rbs = doc.querySelectorAll(`input[name="${name}"]`);
    [].forEach.call(rbs, rb => toggle(rb, message));
  } else {
    toggle(input, message);
  }
};

const getEl = (el = "body") =>
  typeof el === "string" ? doc.querySelector(el) || doc.body : el;

const getValidateEls = el => el.querySelectorAll("." + VALIDATE);

const onClick = e =>
  e.target.matches("." + VALIDATE_POPUP) && hide(e.target.nextElementSibling);

const onSubmit = e => {
  const isValid = validation.validate(e.target);
  !isValid && e.preventDefault();
  return isValid;
};

const onResize = throttle(
  () =>
    [].forEach.call(doc.querySelectorAll("." + VALIDATE_POPUP), popup =>
      forceToggleClass(popup, ACTIVE, false)
    ),
  1000
);

const setupEventHandlers = (el, setup) => {
  el = getEl(el);
  const action = setup ? "addEventListener" : "removeEventListener";
  const inputs = getValidateEls(el);
  [].forEach.call(inputs, input =>
    OPTIONS.events.forEach(e => input[action](e, onAction))
  );

  el.nodeName === "FORM" && el[action]("submit", onSubmit);
  doc[action]("click", onClick);
  window[action]("resize", onResize);
};

const validation = {
  /**
   * Initialize the validation fields
   *
   * @param {Element|string} el Container (dom element or selector)
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
   * Show a message for an input field
   *
   * @param {Element|string} el dom element or selector
   * @param {string} message Popup message
   * @returns {object} validation instance (chain call)
   */
  show: (el, message) => (show(el, message), validation),

  /**
   * Hide a popup message for an input field
   *
   * @param {Element|string} el dom element or selector
   * @returns {object} validation instance (chain call)
   */
  hide: el => (hide(el), validation),

  /**
   * Deactivate the validation fields
   *
   * @param {Element|string} el Container (dom element or selector)
   * @returns {object} validation instance (chain call)
   */
  destroy: el => (
    validation.hideAll(el), setupEventHandlers(el, false), validation
  ),

  /**
   * Hide all opened popups inside of the container
   *
   * @param {Element|string} el Container (dom element or selector)
   * @returns {object} validation instance (chain call)
   */
  hideAll: el => (
    [].forEach.call(getValidateEls(getEl(el)), input => hide(input)), validation
  ),

  /**
   * Show error popups inside of the container
   *
   * @param {Element|string} el Container (dom element or selector)
   * @returns {object} validation instance (chain call)
   */
  highlight: el => (
    [].forEach.call(getValidateEls(getEl(el)), input =>
      onAction({ target: input })
    ),
    validation
  ),

  /**
   * Check if all input fields inside of the container are valid
   *
   * @param {Element|string} el Container (dom element or selector)
   * @returns {boolean} True if all input fields inside of the container are valid
   */
  isValid: el =>
    getEl(el).querySelectorAll(_customSelectors.join(",")).length === 0 &&
    [].every.call(getValidateEls(getEl(el)), input => !getMessage(input)),

  /**
   * Validate all input fields in the DOM container
   *
   * @param {Element|string} el Container (dom element or selector)
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
   * @param {string} target Selector of the target element
   * @param {string} selector Selector that indicates that the field is invalid
   * @param {string} Optional: message. "Invalid" by default
   * @returns {object} validation instance (chain call)
   */
  addClassValidation: (target, selector, msg = "Invalid") => {
    const styleTag = doc.createElement("style");
    styleTag.innerHTML = selector
      .split(",")
      .map(s =>
        CUSTOM_CLASS_STYLES.replace(/\{0\}/gi, s).replace(
          /\{1\}/gi,
          !msg ? "" : `content: '${msg}'`
        )
      )
      .join("");
    doc.head.appendChild(styleTag);
    _customSelectors.push(selector);
    [].forEach.call(
      doc.querySelectorAll(target),
      el => (el.className += ` validate-class ${selector.substring(1)}-ready`)
    );
    return validation;
  }
};

export default validation;
