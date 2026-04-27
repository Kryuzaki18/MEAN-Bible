import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const preset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      primary: {
        50: '#f5f0eb',
        100: '#e8ddd2',
        200: '#d4bca4',
        300: '#b89278',
        400: '#9c6e52',
        500: '#7a5038',
        600: '#5e3a28',
        700: '#3d2b1a',
        800: '#2c1f0e',
        900: '#1a1208',
        950: '#0c0905',
      },
      light: {
        surface: {
          50: '#f5f0eb',
          100: '#e8ddd2',
          200: '#d4bca4',
          300: '#b89278',
          400: '#9c6e52',
          500: '#7a5038',
          600: '#5e3a28',
          700: '#3d2b1a',
          800: '#2c1f0e',
          900: '#1a1208',
          950: '#0c0905',
        },
      },
      dark: {
        surface: {
          50: '#f5f0eb',
          100: '#e8ddd2',
          200: '#d4bca4',
          300: '#b89278',
          400: '#9c6e52',
          500: '#7a5038',
          600: '#5e3a28',
          700: '#3d2b1a',
          800: '#2c1f0e',
          900: '#1a1208',
          950: '#0c0905',
        },
      },
    },
  },
});

export default preset;
