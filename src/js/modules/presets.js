// src/js/modules/presets.js

export const presetCategories = {
    'space-exploration': {
        name_en: "Space Exploration",
        name_de: "Weltraumforschung",
        presets: {
            easy: {
                display_name_key: 'preset-easy', // NEW
                'search-query': 'preset-easy-search-query', // Translation key
                'exact-phrase': '',
                'without-words': '',
                'any-words': '',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false,
                'incategory-value': '',
                'deepcat-value': '',
                'linkfrom-value': '',
                'prefix-value': '',
                'insource-value': '',
                'hastemplate-value': '',
                'filetype-value': '',
                'filesize-min': '',
                'filesize-max': ''
            },
            medium: {
                display_name_key: 'preset-medium', // NEW
                'search-query': 'preset-medium-search-query', // Translation key
                'exact-phrase': 'preset-medium-exact-phrase', // Translation key
                'without-words': 'preset-medium-without-words', // Translation key
                'any-words': 'preset-medium-any-words', // Translation key
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false,
                'incategory-value': '',
                'deepcat-value': '',
                'linkfrom-value': '',
                'prefix-value': '',
                'insource-value': '',
                'hastemplate-value': '',
                'filetype-value': '',
                'filesize-min': '',
                'filesize-max': ''
            },
        }
    },
    'history': {
        name_en: "History",
        name_de: "Geschichte",
        presets: {
            ancient_rome: {
                display_name_key: 'preset-history-ancient-rome', // NEW
                'search-query': 'preset-history-ancient-rome-query',
                'exact-phrase': 'preset-history-ancient-rome-exact-phrase',
                'without-words': 'preset-history-ancient-rome-without-words',
                'any-words': '',
                'option-intitle': true,
                'option-wildcard': false,
                'option-fuzzy': false,
                'incategory-value': 'preset-history-ancient-rome-incategory',
                'deepcat-value': '',
                'linkfrom-value': '',
                'prefix-value': '',
                'insource-value': '',
                'hastemplate-value': '',
                'filetype-value': '',
                'filesize-min': '',
                'filesize-max': ''
            },
            world_wars: {
                display_name_key: 'preset-history-world-wars', // NEW
                'search-query': 'preset-history-world-wars-query',
                'exact-phrase': '',
                'without-words': 'preset-history-world-wars-without-words',
                'any-words': 'preset-history-world-wars-any-words',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false,
                'incategory-value': 'preset-history-world-wars-incategory',
                'deepcat-value': '',
                'linkfrom-value': '',
                'prefix-value': '',
                'insource-value': '',
                'hastemplate-value': '',
                'filetype-value': '',
                'filesize-min': '',
                'filesize-max': ''
            },
        }
    },
    'biology': {
        name_en: "Biology",
        name_de: "Biologie",
        presets: {
            cells: {
                display_name_key: 'preset-biology-cells', // NEW
                'search-query': 'preset-biology-cells-query',
                'exact-phrase': 'preset-biology-cells-exact-phrase',
                'without-words': '',
                'any-words': 'preset-biology-cells-any-words',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false,
                'incategory-value': 'preset-biology-cells-incategory',
                'deepcat-value': 'preset-biology-cells-deepcat',
                'linkfrom-value': '',
                'prefix-value': '',
                'insource-value': '',
                'hastemplate-value': '',
                'filetype-value': '',
                'filesize-min': '',
                'filesize-max': ''
            },
        }
    }
};
