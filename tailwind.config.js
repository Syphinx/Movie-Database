const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./src/views/**/*.pug"],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // -theme-COLORNAME
        theme: {
          blue: {
            600: "#051B23",
            500: "#42565E",
            400: "#3E535B",
            300: "#71919C",
            200: "#BBCAC5",
            100: "#D7E2DD",
          },
          cream: {
            400: "#DBAD93",
            300: "#E0C6A3",
            200: "#FFF5E9",
            100: "#C4C4C4",
          },
          orange: "#B27044",
          white: "#E0E0E0",
          gray: "#9CA3AF",
        },
      },
    },
  },
  variants: {
    extend: {
      fill: ["hover"],
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
