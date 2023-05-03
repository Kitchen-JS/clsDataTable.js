/** @type {import('tailwindcss').Config} */
/** npx tailwindcss -i ./src/input.css -o ./dist/clsDataTable.css --watch **/
module.exports = {
  content: [
    './src/**/*.{html,js,css}',
    './*.html'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      black: '#000000',
      white: '#fff',
      grey: '#e5e7eb',
      greyLite: '#f8fafc',
      greyDark: '#707070',
      slate: '#708090',
      slateBlue: '#506f96',
      slateBlueLite: '#6f9ad1',
      slateBlueDark: '#3a516e',
      skyBlue: '#d2e4fc',
      altRowBlueLite: '#f0f5fc',
      altRowGreyLite: '#f8fafc',
      success: '#28a745',
    },
    extend: {
      zIndex: {
        '100': '100',
        '9000': '9000',
        '9100': '9100',
        '9200': '9200',
        '9300': '9300',
        '9999': '9999',
      },
    }
  }
}