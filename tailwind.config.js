/** @type {import('tailwindcss').Config} */
/** npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch **/
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
      success: '#28a745',
    },
    extend: {
      gridTemplateColumns: {
        // Simple 16 column grid
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
        '17': 'repeat(17, minmax(0, 1fr))',
        '18': 'repeat(18, minmax(0, 1fr))',
        '19': 'repeat(19, minmax(0, 1fr))',
        '20': 'repeat(20, minmax(0, 1fr))',
        '21': 'repeat(21, minmax(0, 1fr))',
        '22': 'repeat(22, minmax(0, 1fr))',
        '23': 'repeat(23, minmax(0, 1fr))',
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      zIndex: {
        '100': '100',
        '9000': '9000',
        '9100': '9100',
        '9200': '9200',
        '9300': '9300',
        '9999': '9999',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
  ]
}