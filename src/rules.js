export const RULES = {
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
