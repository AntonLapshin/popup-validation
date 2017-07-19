import resolve from "rollup-plugin-node-resolve";
import scss from "rollup-plugin-scss";

export default {
  entry: "src/index.js",
  format: "umd",
  moduleName: "validation",
  plugins: [
    resolve(),
    scss({
      output: "bin/validation.css"
    })
  ],
  dest: "bin/validation.es6.js"
};
