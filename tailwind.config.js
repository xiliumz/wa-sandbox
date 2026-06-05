/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          bg: '#efeae2',
          green: '#00a884',
          'green-dark': '#008069',
          'bubble-incoming': '#ffffff',
          'bubble-outgoing': '#d9fdd3',
          'interactive-bg': '#ffffff',
          'interactive-button': '#ffffff',
          'interactive-button-text': '#008069',
          'interactive-list-button': '#008069',
          'interactive-list-button-text': '#ffffff',
        }
      },
      backgroundImage: {
        'chat-pattern': "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70e9c6bce.png')",
      }
    },
  },
  plugins: [],
}
