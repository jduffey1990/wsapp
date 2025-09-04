/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader

// Composables
import {createVuetify} from 'vuetify';
import { VVideo } from 'vuetify/labs/VVideo'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
    defaults: {
        global: {
            hideDetails: 'auto',
        },
        VCheckbox: {
            color: 'primary',
            density: 'compact',
            style: {},
        },
        VExpansionPanelTitle: {
            color: 'lightgrey',
        },
        VTextarea: {
            color: 'primary',
        },
        VTextField: {
            color: 'primary',
        },
    },
    icons: {
        defaultSet: 'mdi',
    },
    theme: {
        themes: {
            light: {
                colors: {
                    primary: '#5B9279',
                    secondary: '#12130F',
                    info: '#8FCB9B',
                    warning: '#D64933',
                    success: '#EEF36A',
                    translucent: 'rgba(255,255,255,0.2)'
                },
            },
        },
    },
    components: {
        VVideo,
    }
});
