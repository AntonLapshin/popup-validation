const regex = {
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};

export default {
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
