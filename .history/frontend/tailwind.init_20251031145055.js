// tailwind-init.js
const fs = require("fs");

const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

fs.writeFileSync("tailwind.config.js", tailwindConfig);
fs.writeFileSync("postcss.config.js", postcssConfig);

console.log("Tailwind and PostCSS config files created!");
