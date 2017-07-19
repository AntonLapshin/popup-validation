import resolve from "rollup-plugin-node-resolve";
import scss from "rollup-plugin-scss";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
  entry: "src/index.js",
  format: "umd",
  moduleName: "validation",
  plugins: [
    resolve(),
    scss({
      output: "bin/validation.css"
    }),
    babel({
      babelrc: false,
      presets: [
        [
          "latest",
          {
            es2015: {
              modules: false
            }
          }
        ]
      ],
      plugins: ["external-helpers"],
      exclude: "node_modules/**" // only transpile our source code
    }),
    uglify({
      mangle: true,
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        drop_console: true
      }
    })
  ],
  dest: "bin/validation.min.js"
};
