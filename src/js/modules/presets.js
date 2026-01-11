// src/js/modules/presets.js

export const presetCategories = {
    'examples': {
        name_en: "Quick Examples",
        name_de: "Schnell-Beispiele",
        presets: {
            einstein: {
                display_name_key: 'ex-btn-einstein',
                'search-query': 'Albert Einstein',
                'exact-phrase': '',
                'without-words': '',
                'any-words': '',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false
            },
            ai: {
                display_name_key: 'ex-btn-ai',
                'search-query': '',
                'exact-phrase': 'preset-example-ai-phrase',
                'without-words': '',
                'any-words': '',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false
            },
            jaguar: {
                display_name_key: 'ex-btn-jaguar',
                'search-query': 'Jaguar',
                'exact-phrase': '',
                'without-words': 'preset-example-jaguar-without',
                'any-words': '',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false
            },
            planets: {
                display_name_key: 'ex-btn-planets',
                'search-query': '',
                'exact-phrase': '',
                'without-words': '',
                'any-words': 'preset-example-planets-any',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false
            },
            physics: {
                display_name_key: 'ex-btn-cat-physics',
                'search-query': '',
                'exact-phrase': '',
                'without-words': '',
                'any-words': '',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false,
                'incategory-value': 'preset-example-physics-cat'
            },
            ww2: {
                display_name_key: 'ex-btn-title-ww2',
                'search-query': '',
                'exact-phrase': '',
                'without-words': '',
                'any-words': '',
                'option-intitle': true,
                'search-query': 'preset-example-ww2-query'
            },
            created_2023: {
                display_name_key: 'ex-btn-created-2023',
                'search-query': '',
                'exact-phrase': '',
                'without-words': '',
                'any-words': '',
                'option-intitle': false,
                'dateafter-value': '2023-01-01',
                'datebefore-value': '2023-12-31'
            },
            complex: {
                display_name_key: 'ex-btn-complex',
                'search-query': 'preset-example-complex-query',
                'exact-phrase': '',
                'without-words': 'preset-example-complex-without',
                'any-words': '',
                'option-intitle': false,
                'insource-value': 'preset-example-complex-insource'
            }
        }
    },
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
                'incategory-value': 'preset-medium-incategory',
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
                'without-words': '',
                'any-words': 'preset-biology-cells-any-words',
                'option-intitle': false,
                'option-wildcard': false,
                'option-fuzzy': false,
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