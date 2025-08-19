console.log("PiCarX")

const ArgumentType = require('../../extension-support/argument-type');
const ScratchBlocksConstants = require('../../engine/scratch-blocks-constants');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const Cast = require('../../util/cast');
const WS = require('../../io/webSocket');
const Color = require('../../util/color');

const DATA_SEND_INTERVAL = 5;

const PIPER_MODELS = {
  "Arabic Jordan": {
    "Kareem": {
      "Low": "ar_JO-kareem-low",
      "Medium": "ar_JO-kareem-medium"
    }
  },
  "Catalan Spain": {
    "Upc Ona": {
      "X Low": "ca_ES-upc_ona-x_low",
      "Medium": "ca_ES-upc_ona-medium"
    },
    "Upc Pau": {
      "X Low": "ca_ES-upc_pau-x_low"
    }
  },
  "Czech Czech Republic": {
    "Jirka": {
      "Low": "cs_CZ-jirka-low",
      "Medium": "cs_CZ-jirka-medium"
    }
  },
  "Welsh United Kingdom": {
    "Bu Tts": {
      "Medium": "cy_GB-bu_tts-medium"
    },
    "Gwryw Gogleddol": {
      "Medium": "cy_GB-gwryw_gogleddol-medium"
    }
  },
  "Danish Denmark": {
    "Talesyntese": {
      "Medium": "da_DK-talesyntese-medium"
    }
  },
  "German Germany": {
    "Eva K": {
      "X Low": "de_DE-eva_k-x_low"
    },
    "Karlsson": {
      "Low": "de_DE-karlsson-low"
    },
    "Kerstin": {
      "Low": "de_DE-kerstin-low"
    },
    "Mls": {
      "Medium": "de_DE-mls-medium"
    },
    "Pavoque": {
      "Low": "de_DE-pavoque-low"
    },
    "Ramona": {
      "Low": "de_DE-ramona-low"
    },
    "Thorsten": {
      "Low": "de_DE-thorsten-low",
      "Medium": "de_DE-thorsten-medium",
      "High": "de_DE-thorsten-high"
    },
    "Thorsten Emotional": {
      "Medium": "de_DE-thorsten_emotional-medium"
    }
  },
  "Greek Greece": {
    "Rapunzelina": {
      "Low": "el_GR-rapunzelina-low"
    }
  },
  "English United Kingdom": {
    "Alan": {
      "Low": "en_GB-alan-low",
      "Medium": "en_GB-alan-medium"
    },
    "Alba": {
      "Medium": "en_GB-alba-medium"
    },
    "Aru": {
      "Medium": "en_GB-aru-medium"
    },
    "Cori": {
      "Medium": "en_GB-cori-medium",
      "High": "en_GB-cori-high"
    },
    "Jenny Dioco": {
      "Medium": "en_GB-jenny_dioco-medium"
    },
    "Northern English Male": {
      "Medium": "en_GB-northern_english_male-medium"
    },
    "Semaine": {
      "Medium": "en_GB-semaine-medium"
    },
    "Southern English Female": {
      "Low": "en_GB-southern_english_female-low"
    },
    "Vctk": {
      "Medium": "en_GB-vctk-medium"
    }
  },
  "English United States": {
    "Amy": {
      "Low": "en_US-amy-low",
      "Medium": "en_US-amy-medium"
    },
    "Arctic": {
      "Medium": "en_US-arctic-medium"
    },
    "Bryce": {
      "Medium": "en_US-bryce-medium"
    },
    "Danny": {
      "Low": "en_US-danny-low"
    },
    "Hfc Female": {
      "Medium": "en_US-hfc_female-medium"
    },
    "Hfc Male": {
      "Medium": "en_US-hfc_male-medium"
    },
    "Joe": {
      "Medium": "en_US-joe-medium"
    },
    "John": {
      "Medium": "en_US-john-medium"
    },
    "Kathleen": {
      "Low": "en_US-kathleen-low"
    },
    "Kristin": {
      "Medium": "en_US-kristin-medium"
    },
    "Kusal": {
      "Medium": "en_US-kusal-medium"
    },
    "L2arctic": {
      "Medium": "en_US-l2arctic-medium"
    },
    "Lessac": {
      "Low": "en_US-lessac-low",
      "Medium": "en_US-lessac-medium",
      "High": "en_US-lessac-high"
    },
    "Libritts": {
      "High": "en_US-libritts-high"
    },
    "Libritts R": {
      "Medium": "en_US-libritts_r-medium"
    },
    "Ljspeech": {
      "Medium": "en_US-ljspeech-medium",
      "High": "en_US-ljspeech-high"
    },
    "Norman": {
      "Medium": "en_US-norman-medium"
    },
    "Reza Ibrahim": {
      "Medium": "en_US-reza_ibrahim-medium"
    },
    "Ryan": {
      "Low": "en_US-ryan-low",
      "Medium": "en_US-ryan-medium",
      "High": "en_US-ryan-high"
    },
    "Sam": {
      "Medium": "en_US-sam-medium"
    }
  },
  "Spanish Spain": {
    "Carlfm": {
      "X Low": "es_ES-carlfm-x_low"
    },
    "Davefx": {
      "Medium": "es_ES-davefx-medium"
    },
    "Mls 10246": {
      "Low": "es_ES-mls_10246-low"
    },
    "Mls 9972": {
      "Low": "es_ES-mls_9972-low"
    },
    "Sharvard": {
      "Medium": "es_ES-sharvard-medium"
    }
  },
  "Spanish Mexico": {
    "Ald": {
      "Medium": "es_MX-ald-medium"
    },
    "Claude": {
      "High": "es_MX-claude-high"
    }
  },
  "Farsi Iran": {
    "Amir": {
      "Medium": "fa_IR-amir-medium"
    },
    "Ganji": {
      "Medium": "fa_IR-ganji-medium"
    },
    "Ganji Adabi": {
      "Medium": "fa_IR-ganji_adabi-medium"
    },
    "Gyro": {
      "Medium": "fa_IR-gyro-medium"
    },
    "Reza Ibrahim": {
      "Medium": "fa_IR-reza_ibrahim-medium"
    }
  },
  "Finnish Finland": {
    "Harri": {
      "Low": "fi_FI-harri-low",
      "Medium": "fi_FI-harri-medium"
    }
  },
  "French France": {
    "Gilles": {
      "Low": "fr_FR-gilles-low"
    },
    "Mls": {
      "Medium": "fr_FR-mls-medium"
    },
    "Mls 1840": {
      "Low": "fr_FR-mls_1840-low"
    },
    "Siwis": {
      "Low": "fr_FR-siwis-low",
      "Medium": "fr_FR-siwis-medium"
    },
    "Tom": {
      "Medium": "fr_FR-tom-medium"
    },
    "Upmc": {
      "Medium": "fr_FR-upmc-medium"
    }
  },
  "Hungarian Hungary": {
    "Anna": {
      "Medium": "hu_HU-anna-medium"
    },
    "Berta": {
      "Medium": "hu_HU-berta-medium"
    },
    "Imre": {
      "Medium": "hu_HU-imre-medium"
    }
  },
  "Icelandic Iceland": {
    "Bui": {
      "Medium": "is_IS-bui-medium"
    },
    "Salka": {
      "Medium": "is_IS-salka-medium"
    },
    "Steinn": {
      "Medium": "is_IS-steinn-medium"
    },
    "Ugla": {
      "Medium": "is_IS-ugla-medium"
    }
  },
  "Italian Italy": {
    "Paola": {
      "Medium": "it_IT-paola-medium"
    },
    "Riccardo": {
      "X Low": "it_IT-riccardo-x_low"
    }
  },
  "Georgian Georgia": {
    "Natia": {
      "Medium": "ka_GE-natia-medium"
    }
  },
  "Kazakh Kazakhstan": {
    "Iseke": {
      "X Low": "kk_KZ-iseke-x_low"
    },
    "Issai": {
      "High": "kk_KZ-issai-high"
    },
    "Raya": {
      "X Low": "kk_KZ-raya-x_low"
    }
  },
  "Luxembourgish Luxembourg": {
    "Marylux": {
      "Medium": "lb_LU-marylux-medium"
    }
  },
  "Latvian Latvia": {
    "Aivars": {
      "Medium": "lv_LV-aivars-medium"
    }
  },
  "Malayalam India": {
    "Arjun": {
      "Medium": "ml_IN-arjun-medium"
    },
    "Meera": {
      "Medium": "ml_IN-meera-medium"
    }
  },
  "Nepali Nepal": {
    "Google": {
      "X Low": "ne_NP-google-x_low",
      "Medium": "ne_NP-google-medium"
    }
  },
  "Dutch Belgium": {
    "Nathalie": {
      "X Low": "nl_BE-nathalie-x_low",
      "Medium": "nl_BE-nathalie-medium"
    },
    "Rdh": {
      "X Low": "nl_BE-rdh-x_low",
      "Medium": "nl_BE-rdh-medium"
    }
  },
  "Dutch Netherlands": {
    "Mls": {
      "Medium": "nl_NL-mls-medium"
    },
    "Mls 5809": {
      "Low": "nl_NL-mls_5809-low"
    },
    "Mls 7432": {
      "Low": "nl_NL-mls_7432-low"
    },
    "Pim": {
      "Medium": "nl_NL-pim-medium"
    },
    "Ronnie": {
      "Medium": "nl_NL-ronnie-medium"
    }
  },
  "Norwegian Norway": {
    "Talesyntese": {
      "Medium": "no_NO-talesyntese-medium"
    }
  },
  "Polish Poland": {
    "Darkman": {
      "Medium": "pl_PL-darkman-medium"
    },
    "Gosia": {
      "Medium": "pl_PL-gosia-medium"
    },
    "Mc Speech": {
      "Medium": "pl_PL-mc_speech-medium"
    },
    "Mls 6892": {
      "Low": "pl_PL-mls_6892-low"
    }
  },
  "Portuguese Brazil": {
    "Cadu": {
      "Medium": "pt_BR-cadu-medium"
    },
    "Edresson": {
      "Low": "pt_BR-edresson-low"
    },
    "Faber": {
      "Medium": "pt_BR-faber-medium"
    },
    "Jeff": {
      "Medium": "pt_BR-jeff-medium"
    }
  },
  "Portuguese Portugal": {
    "Tugão": {
      "Medium": "pt_PT-tugão-medium"
    }
  },
  "Romanian Romania": {
    "Mihai": {
      "Medium": "ro_RO-mihai-medium"
    }
  },
  "Russian Russia": {
    "Denis": {
      "Medium": "ru_RU-denis-medium"
    },
    "Dmitri": {
      "Medium": "ru_RU-dmitri-medium"
    },
    "Irina": {
      "Medium": "ru_RU-irina-medium"
    },
    "Ruslan": {
      "Medium": "ru_RU-ruslan-medium"
    }
  },
  "Slovak Slovakia": {
    "Lili": {
      "Medium": "sk_SK-lili-medium"
    }
  },
  "Slovenian Slovenia": {
    "Artur": {
      "Medium": "sl_SI-artur-medium"
    }
  },
  "Serbian Serbia": {
    "Serbski Institut": {
      "Medium": "sr_RS-serbski_institut-medium"
    }
  },
  "Swedish Sweden": {
    "Lisa": {
      "Medium": "sv_SE-lisa-medium"
    },
    "Nst": {
      "Medium": "sv_SE-nst-medium"
    }
  },
  "Swahili Democratic Republic of the Congo": {
    "Lanfrica": {
      "Medium": "sw_CD-lanfrica-medium"
    }
  },
  "Turkish Turkey": {
    "Dfki": {
      "Medium": "tr_TR-dfki-medium"
    },
    "Fahrettin": {
      "Medium": "tr_TR-fahrettin-medium"
    },
    "Fettah": {
      "Medium": "tr_TR-fettah-medium"
    }
  },
  "Ukrainian Ukraine": {
    "Lada": {
      "X Low": "uk_UA-lada-x_low"
    },
    "Ukrainian Tts": {
      "Medium": "uk_UA-ukrainian_tts-medium"
    }
  },
  "Vietnamese Vietnam": {
    "25hours Single": {
      "Low": "vi_VN-25hours_single-low"
    },
    "Vais1000": {
      "Medium": "vi_VN-vais1000-medium"
    },
    "Vivos": {
      "X Low": "vi_VN-vivos-x_low"
    }
  },
  "Chinese China": {
    "Huayan": {
      "X Low": "zh_CN-huayan-x_low",
      "Medium": "zh_CN-huayan-medium"
    }
  }
}


/**
 * PiCarX的图标
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuWbvuWxgl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgNDAgNDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQwIDQwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzhDOEI4Qjt9Cgkuc3Qxe2ZpbGw6I0UzRTJFMjt9Cgkuc3Qye2ZpbGw6IzlCOUI5Qjt9Cgkuc3Qze2ZpbGw6I0JDQkNCQzt9Cgkuc3Q0e2ZpbGw6I0VBRUFFQTt9Cgkuc3Q1e2ZpbGw6I0UzRTJFMjtzdHJva2U6IzlCOUI5QjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3Q2e2ZpbGw6IzA0MDAwMDt9Cgkuc3Q3e2ZpbGw6IzFEMkQyRDt9Cgkuc3Q4e2ZpbGw6IzRFNjM2NTt9Cgkuc3Q5e2ZpbGw6I0YyRjJGMjt9Cgkuc3QxMHtmaWxsOiNCQUJBQjk7fQoJLnN0MTF7ZmlsbDojRkZGRkZGO30KCS5zdDEye2ZpbGw6IzQyQTZBRDt9Cgkuc3QxM3tmaWxsOiM3NkM2RDQ7fQoJLnN0MTR7ZmlsbDojOTNEMkREO30KCS5zdDE1e2ZpbGw6I0M2RTRFOTt9Cjwvc3R5bGU+CjxnPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE3LjgsMTUuN2MtMy44LDAtNi45LDMuMS02LjksNi45czMuMSw2LjksNi45LDYuOWMzLjgsMCw2LjktMy4xLDYuOS02LjlTMjEuNiwxNS43LDE3LjgsMTUuN3ogTTE3LjgsMjguMgoJCQljLTMuMSwwLTUuNi0yLjUtNS42LTUuNnMyLjUtNS42LDUuNi01LjZjMy4xLDAsNS42LDIuNSw1LjYsNS42UzIwLjksMjguMiwxNy44LDI4LjJ6Ii8+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTExLjIsMjAuNWMtMS4yLDMuNiwwLjgsNy41LDQuNCw4LjdjMy42LDEuMiw3LjUtMC44LDguNy00LjRjMS4yLTMuNi0wLjgtNy41LTQuNC04LjcKCQkJQzE2LjMsMTQuOSwxMi40LDE2LjksMTEuMiwyMC41eiBNMjMuMSwyNC40Yy0xLDIuOS00LjEsNC41LTcuMSwzLjZjLTIuOS0xLTQuNS00LjEtMy42LTcuMWMxLTIuOSw0LjEtNC41LDcuMS0zLjYKCQkJQzIyLjUsMTguMywyNC4xLDIxLjQsMjMuMSwyNC40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMy43LDI4LjJjMy4xLDIuMiw3LjQsMS42LDkuNi0xLjVzMS42LTcuNC0xLjUtOS42Yy0zLjEtMi4yLTcuNC0xLjYtOS42LDEuNVMxMC43LDI2LDEzLjcsMjguMnogTTIxLjEsMTguMQoJCQljMi41LDEuOCwzLjEsNS4zLDEuMiw3LjhjLTEuOCwyLjUtNS4zLDMuMS03LjgsMS4yYy0yLjUtMS44LTMuMS01LjMtMS4yLTcuOFMxOC42LDE2LjMsMjEuMSwxOC4xeiIvPgoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yMS44LDI4LjJjMy4xLTIuMiwzLjgtNi41LDEuNS05LjZzLTYuNS0zLjgtOS42LTEuNWMtMy4xLDIuMi0zLjgsNi41LTEuNSw5LjZTMTguOCwzMC40LDIxLjgsMjguMnoKCQkJIE0xNC41LDE4LjFjMi41LTEuOCw2LTEuMyw3LjgsMS4yYzEuOCwyLjUsMS4zLDYtMS4yLDcuOHMtNiwxLjMtNy44LTEuMlMxMiwxOS45LDE0LjUsMTguMXoiLz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTcuOCwxNi42Yy0zLjMsMC02LDIuNy02LDZzMi43LDYsNiw2YzMuMywwLDYtMi43LDYtNlMyMS4xLDE2LjYsMTcuOCwxNi42eiBNMTguNSwxNy42CgkJCWMxLjcsMC4yLDMuMSwxLjMsMy44LDIuOGMtMC41LDAuMi0yLjUsMC4xLTIuOC0wLjFDMTkuMiwyMCwxOC40LDE4LjIsMTguNSwxNy42eiBNMTcuMSwxNy42YzAuMSwwLjUtMC43LDIuNC0xLDIuNgoJCQljLTAuMywwLjItMi4zLDAuNC0yLjgsMC4xQzE0LDE4LjksMTUuNSwxNy45LDE3LjEsMTcuNnogTTE0LjMsMjYuMmMtMS4yLTEuMi0xLjctMi45LTEuNS00LjVjMC41LDAuMSwyLjEsMS40LDIuMiwxLjgKCQkJQzE1LjIsMjMuOSwxNC43LDI1LjgsMTQuMywyNi4yeiBNMTUuNCwyN2MwLjItMC41LDEuOS0xLjUsMi40LTEuNWMwLjQsMCwyLjEsMS4xLDIuNCwxLjVDMTguNywyNy44LDE2LjksMjcuOCwxNS40LDI3egoJCQkgTTIxLjMsMjYuMmMtMC40LTAuNC0wLjktMi4zLTAuNy0yLjdjMC4xLTAuNCwxLjctMS43LDIuMi0xLjhDMjMsMjMuNCwyMi41LDI1LjEsMjEuMywyNi4yeiIvPgoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNC40LDIwLjVjLTEuMi0zLjYtNS4xLTUuNi04LjctNC40Yy0zLjYsMS4yLTUuNiw1LjEtNC40LDguN2MxLjIsMy42LDUuMSw1LjYsOC43LDQuNAoJCQlDMjMuNSwyOCwyNS41LDI0LjEsMjQuNCwyMC41eiBNMTIuNSwyNC40Yy0xLTIuOSwwLjctNi4xLDMuNi03LjFjMi45LTEsNi4xLDAuNyw3LjEsMy42YzEsMi45LTAuNyw2LjEtMy42LDcuMQoJCQlDMTYuNiwyOC45LDEzLjQsMjcuMywxMi41LDI0LjR6Ii8+CgkJPGNpcmNsZSBjbGFzcz0ic3QwIiBjeD0iMTcuOCIgY3k9IjIyLjYiIHI9IjEuOSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTMyLDE1LjdjLTMuOCwwLTYuOSwzLjEtNi45LDYuOXMzLjEsNi45LDYuOSw2LjljMy44LDAsNi45LTMuMSw2LjktNi45UzM1LjgsMTUuNywzMiwxNS43eiBNMzIsMjguMgoJCQljLTMuMSwwLTUuNi0yLjUtNS42LTUuNlMyOC45LDE3LDMyLDE3YzMuMSwwLDUuNiwyLjUsNS42LDUuNlMzNS4xLDI4LjIsMzIsMjguMnoiLz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjUuNCwyMC41Yy0xLjIsMy42LDAuOCw3LjUsNC40LDguN2MzLjYsMS4yLDcuNS0wLjgsOC43LTQuNGMxLjItMy42LTAuOC03LjUtNC40LTguNwoJCQlDMzAuNSwxNC45LDI2LjYsMTYuOSwyNS40LDIwLjV6IE0zNy4zLDI0LjRjLTEsMi45LTQuMSw0LjUtNy4xLDMuNmMtMi45LTEtNC41LTQuMS0zLjYtNy4xYzEtMi45LDQuMS00LjUsNy4xLTMuNgoJCQlDMzYuNywxOC4zLDM4LjMsMjEuNCwzNy4zLDI0LjR6Ii8+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTI3LjksMjguMmMzLjEsMi4yLDcuNCwxLjYsOS42LTEuNWMyLjItMy4xLDEuNi03LjQtMS41LTkuNmMtMy4xLTIuMi03LjQtMS42LTkuNiwxLjVTMjQuOSwyNiwyNy45LDI4LjJ6CgkJCSBNMzUuMywxOC4xYzIuNSwxLjgsMy4xLDUuMywxLjIsNy44cy01LjMsMy4xLTcuOCwxLjJjLTIuNS0xLjgtMy4xLTUuMy0xLjItNy44UzMyLjgsMTYuMywzNS4zLDE4LjF6Ii8+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTM2LjEsMjguMmMzLjEtMi4yLDMuOC02LjUsMS41LTkuNmMtMi4yLTMuMS02LjUtMy44LTkuNi0xLjVjLTMuMSwyLjItMy44LDYuNS0xLjUsOS42UzMzLDMwLjQsMzYuMSwyOC4yegoJCQkgTTI4LjcsMTguMWMyLjUtMS44LDYtMS4zLDcuOCwxLjJzMS4zLDYtMS4yLDcuOHMtNiwxLjMtNy44LTEuMlMyNi4yLDE5LjksMjguNywxOC4xeiIvPgoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zMiwxNi42Yy0zLjMsMC02LDIuNy02LDZzMi43LDYsNiw2YzMuMywwLDYtMi43LDYtNlMzNS4zLDE2LjYsMzIsMTYuNnogTTMyLjcsMTcuNmMxLjcsMC4yLDMuMSwxLjMsMy44LDIuOAoJCQljLTAuNSwwLjItMi41LDAuMS0yLjgtMC4xQzMzLjQsMjAsMzIuNiwxOC4yLDMyLjcsMTcuNnogTTMxLjMsMTcuNmMwLjEsMC41LTAuNywyLjQtMSwyLjZjLTAuMywwLjItMi4zLDAuNC0yLjgsMC4xCgkJCUMyOC4yLDE4LjksMjkuNywxNy45LDMxLjMsMTcuNnogTTI4LjUsMjYuMmMtMS4yLTEuMi0xLjctMi45LTEuNS00LjVjMC41LDAuMSwyLjEsMS40LDIuMiwxLjhDMjkuNCwyMy45LDI4LjksMjUuOCwyOC41LDI2LjJ6CgkJCSBNMjkuNiwyN2MwLjItMC41LDEuOS0xLjUsMi40LTEuNWMwLjQsMCwyLjEsMS4xLDIuNCwxLjVDMzIuOSwyNy44LDMxLjEsMjcuOCwyOS42LDI3eiBNMzUuNSwyNi4yYy0wLjQtMC40LTAuOS0yLjMtMC43LTIuNwoJCQljMC4xLTAuNCwxLjctMS43LDIuMi0xLjhDMzcuMiwyMy40LDM2LjcsMjUuMSwzNS41LDI2LjJ6Ii8+CgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTM4LjYsMjAuNWMtMS4yLTMuNi01LjEtNS42LTguNy00LjRjLTMuNiwxLjItNS42LDUuMS00LjQsOC43YzEuMiwzLjYsNS4xLDUuNiw4LjcsNC40CgkJCUMzNy44LDI4LDM5LjcsMjQuMSwzOC42LDIwLjV6IE0yNi43LDI0LjRjLTEtMi45LDAuNy02LjEsMy42LTcuMWMyLjktMSw2LjEsMC43LDcuMSwzLjZjMSwyLjktMC43LDYuMS0zLjYsNy4xCgkJCUMzMC44LDI4LjksMjcuNiwyNy4zLDI2LjcsMjQuNHoiLz4KCQk8Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSIzMiIgY3k9IjIyLjYiIHI9IjEuOSIvPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTM0LjQsMjYuMWw0LjgtMC41YzAuMSwwLDAuMiwwLjYsMC4yLDAuOGMwLDAuMi0wLjEsMC42LTAuOCwxLjNjLTEuOCwxLjUtMi42LDEuNC0yLjksMS40TDMwLDI5LjEKCQkJYy0xLjcsMC4xLTEuNC0wLjMtMC40LTEuMUMzMC4zLDI3LjQsMzMuNCwyNi4xLDM0LjQsMjYuMSIvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0yOS42LDI5LjNjLTAuNiwwLTAuOC0wLjEtMC45LTAuM2MtMC4xLTAuMywwLjItMC42LDAuOC0xLjFjMC44LTAuNiwzLjktMiw1LTJsNC44LTAuNQoJCQljMC4zLDAsMC4zLDAuMywwLjQsMC44YzAsMC4xLDAsMC4xLDAsMC4xYzAuMSwwLjQtMC4yLDAuOS0wLjksMS40Yy0xLjcsMS41LTIuNiwxLjQtMywxLjRsLTAuMSwwTDMwLDI5LjMKCQkJQzI5LjgsMjkuMywyOS43LDI5LjMsMjkuNiwyOS4zeiBNMjksMjguOGMwLjEsMCwwLjMsMC4xLDEsMGw1LjctMC4xbDAuMSwwYzAuMywwLDEuMSwwLDIuNy0xLjNjMC42LTAuNSwwLjgtMC45LDAuOC0xLjEKCQkJYzAsMCwwLTAuMSwwLTAuMmMwLTAuMSwwLTAuMy0wLjEtMC40bC00LjcsMC41Yy0xLDAtNCwxLjMtNC43LDEuOUMyOS4zLDI4LjUsMjkuMSwyOC43LDI5LDI4Ljh6Ii8+Cgk8L2c+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTYuNiwyMUw2LjYsMjFjMCwwLjIsMC4xLDAuMywwLjMsMC4zaDAuMmMwLjEsMCwwLjMtMC4xLDAuMy0wLjNWMjFjMC0wLjEtMC4xLTAuMy0wLjMtMC4zSDYuOQoJCQkJQzYuNywyMC44LDYuNiwyMC45LDYuNiwyMXoiLz4KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTcuMSwyMS42SDYuOWMtMC4zLDAtMC41LTAuMi0wLjUtMC41VjIxYzAtMC4yLDAuMi0wLjQsMC40LTAuNWwwLDBoMC4yYzAuMywwLDAuNSwwLjIsMC41LDAuNXYwLjEKCQkJCUM3LjUsMjEuNCw3LjMsMjEuNiw3LjEsMjEuNnogTTYuOCwyMS4xTDYuOCwyMS4xYzAsMC4xLDAsMC4xLDAuMSwwLjFoMC4yYzAsMCwwLjEsMCwwLjEtMC4xVjIxYzAsMCwwLTAuMS0wLjEtMC4xTDYuOCwyMS4xCgkJCQlDNi44LDIxLDYuOCwyMSw2LjgsMjEuMXoiLz4KCQk8L2c+CgkJPGc+CgkJCTxyZWN0IHg9IjguNSIgeT0iMTguNSIgY2xhc3M9InN0MyIgd2lkdGg9IjQuMSIgaGVpZ2h0PSI1Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xMi45LDIzLjdIOC4zdi01LjRoNC42VjIzLjd6IE04LjcsMjMuM2gzLjd2LTQuNkg4LjdWMjMuM3oiLz4KCQk8L2c+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDQiIGQ9Ik02LjksMjAuMnYwLjl2MWMwLDEsMC40LDEuNSwxLjEsMS41aDAuNHYtNUg4QzcuNCwxOC41LDYuOSwxOSw2LjksMjAuMnoiLz4KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTguNywyMy43SDhjLTAuNSwwLTEuNC0wLjItMS40LTEuN3YtMS45YzAtMS43LDAuOC0xLjksMS40LTEuOWgwLjZWMjMuN3ogTTgsMTguN2MtMC42LDAtMC45LDAuNS0wLjksMS41CgkJCQl2MS45YzAsMS4zLDAuNywxLjMsMC45LDEuM2gwLjJ2LTQuNkg4eiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMC45LDIzLjZMMC45LDIzLjZjMCwwLjIsMC4xLDAuMywwLjMsMC4zaDAuMmMwLjEsMCwwLjMtMC4xLDAuMy0wLjN2LTAuMWMwLTAuMS0wLjEtMC4zLTAuMy0wLjNIMS4xCgkJCQlDMSwyMy40LDAuOSwyMy41LDAuOSwyMy42eiIvPgoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMS40LDI0LjJIMS4xYy0wLjMsMC0wLjUtMC4yLTAuNS0wLjV2LTAuMWMwLTAuMiwwLjItMC40LDAuNC0wLjVsMCwwaDAuMmMwLjMsMCwwLjUsMC4yLDAuNSwwLjV2MC4xCgkJCQlDMS44LDIzLjksMS42LDI0LjIsMS40LDI0LjJ6IE0xLjEsMjMuNkwxLjEsMjMuNmMwLDAuMSwwLDAuMSwwLjEsMC4xaDAuMmMwLDAsMC4xLDAsMC4xLTAuMXYtMC4xYzAsMCwwLTAuMS0wLjEtMC4xTDEuMSwyMy42CgkJCQlDMS4xLDIzLjYsMS4xLDIzLjYsMS4xLDIzLjZ6Ii8+CgkJPC9nPgoJCTxnPgoJCQk8cmVjdCB4PSIyLjgiIHk9IjIxLjEiIGNsYXNzPSJzdDMiIHdpZHRoPSI0LjEiIGhlaWdodD0iNSIvPgoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNy4yLDI2LjNIMi42di01LjRoNC42VjI2LjN6IE0zLDI1LjloMy43di00LjZIM1YyNS45eiIvPgoJCTwvZz4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0NCIgZD0iTTEuMiwyMi44djAuOXYxYzAsMSwwLjQsMS41LDEuMSwxLjVoMC40di01SDIuM0MxLjcsMjEuMSwxLjIsMjEuNSwxLjIsMjIuOHoiLz4KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTMsMjYuM0gyLjNjLTAuNSwwLTEuNC0wLjItMS40LTEuN3YtMS45YzAtMS43LDAuOC0xLjksMS40LTEuOUgzVjI2LjN6IE0yLjMsMjEuM2MtMC42LDAtMC45LDAuNS0wLjksMS41CgkJCQl2MS45YzAsMS4zLDAuNywxLjMsMC45LDEuM2gwLjJ2LTQuNkgyLjN6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTM0LjMsMjUuMmw0LjcsMC4xYzAuMywwLDAuNywwLjQtMC42LDEuNWMtMS44LDEuNS0yLjYsMS40LTIuOSwxLjRsLTUuNiwwLjFjLTEuNywwLjEtMS40LTAuMy0wLjQtMS4xCgkJCUMzMC4yLDI2LjUsMzMuMywyNS4yLDM0LjMsMjUuMiIvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0yOS41LDI4LjRjLTAuNiwwLTAuOC0wLjEtMC45LTAuM2MtMC4xLTAuMywwLjItMC42LDAuOC0xLjFjMC44LTAuNiwzLjktMiw1LTJoMEwzOSwyNQoJCQljMC4yLDAsMC40LDAuMSwwLjUsMC4zYzAuMSwwLjMsMCwwLjgtMC45LDEuNWMtMS43LDEuNS0yLjYsMS40LTMsMS40bC0wLjEsMGwtNS42LDAuMUMyOS43LDI4LjQsMjkuNiwyOC40LDI5LjUsMjguNHogTTI4LjksMjgKCQkJYzAuMSwwLDAuMywwLjEsMSwwbDUuNy0wLjFsMC4xLDBjMC4zLDAsMS4xLDAsMi43LTEuM2MwLjktMC43LDAuOC0xLjEsMC44LTEuMWMwLDAtMC4xLTAuMS0wLjEtMC4xbC00LjctMC4xYy0xLDAtNCwxLjMtNC43LDEuOQoJCQlDMjkuMiwyNy42LDI5LDI3LjgsMjguOSwyOHoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik00LDIxLjFoMTAuNnYyLjhjMCwxLjctMSwzLTIuMywzSDYuNGMtMS4zLDAtMi4zLTEuMy0yLjMtM0w0LDIxLjFMNCwyMS4xeiIvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xMi4zLDI3LjJINi40Yy0xLjQsMC0yLjUtMS40LTIuNS0zLjJ2LTIuOEg0di0wLjJoMTAuOHYzQzE0LjgsMjUuNywxMy43LDI3LjIsMTIuMywyNy4yeiBNNC4yLDIxLjN2Mi42CgkJCWMwLDEuNiwxLDIuOCwyLjEsMi44aDUuOWMxLjIsMCwyLjEtMS4zLDIuMS0yLjh2LTIuNkg0LjJ6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTguNiwyMS4xaDEwLjZ2Mi44YzAsMS43LTEsMy0yLjMsM2gtNS45Yy0xLjMsMC0yLjMtMS4zLTIuMy0zTDE4LjYsMjEuMUwxOC42LDIxLjF6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTI2LjgsMjcuMmgtNS45Yy0xLjQsMC0yLjUtMS40LTIuNS0zLjJ2LTIuOGgwLjJ2LTAuMmgxMC44djNDMjkuNCwyNS43LDI4LjMsMjcuMiwyNi44LDI3LjJ6IE0xOC44LDIxLjN2Mi42CgkJCWMwLDEuNiwxLDIuOCwyLjEsMi44aDUuOWMxLjIsMCwyLjEtMS4zLDIuMS0yLjh2LTIuNkgxOC44eiIvPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTMxLjUsMjAuOWwtMjItMC4zYy0xLjcsMC4xLTQuMiwwLjMtMy4yLTAuNWMwLjUtMC40LDItMS4zLDQtMS44YzEuMS0wLjIsMy4xLTAuMSwzLjUtMC4xaDRsMC4yLDAuNUwzMywxOC45CgkJCWMxLjctMC4xLDEuNiwxLjEsMi4xLDEuMmMxLjQsMC4zLDIuMS0xLjYsMi4xLDIuNnYyLjZjMCwwLTAuNiwwLjctMi41LDEuNmMtMS45LDAuOS00LDEuNi00LDEuNmwtMC4zLTUuOUwzMS41LDIwLjl6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTMwLjUsMjguNmwtMC4zLTYuMmwwLjgtMS4yTDkuNSwyMC45bC0wLjQsMEM3LDIxLDYsMjEsNS45LDIwLjZjLTAuMS0wLjIsMC0wLjQsMC4yLTAuNgoJCQljMC4yLTAuMSwxLjctMS4zLDQuMS0xLjhjMC45LTAuMiwyLjQtMC4xLDMuMi0wLjFjMC4yLDAsMC4zLDAsMC40LDBoNC4xbDAuMiwwLjVsMTUsMC4xYzEuMywwLDEuNywwLjYsMS45LDAuOQoJCQljMC4xLDAuMSwwLjEsMC4yLDAuMiwwLjJjMC4zLDAuMSwwLjYsMCwwLjktMC4xYzAuMy0wLjEsMC42LTAuMiwwLjksMGMwLjMsMC4yLDAuNSwwLjgsMC41LDIuOHYyLjZsLTAuMSwwLjFjMCwwLTAuNiwwLjctMi42LDEuNgoJCQljLTEuOSwwLjktNCwxLjYtNCwxLjZMMzAuNSwyOC42eiBNMzAuNywyMi41bDAuMiw1LjVjMC42LTAuMiwyLjItMC43LDMuNy0xLjVjMS42LTAuNywyLjItMS4zLDIuNC0xLjV2LTIuNWMwLTAuNiwwLTIuMy0wLjMtMi41CgkJCWMtMC4xLTAuMS0wLjMsMC0wLjUsMC4xYy0wLjMsMC4xLTAuNywwLjItMS4xLDAuMWMtMC4yLDAtMC40LTAuMi0wLjUtMC40Yy0wLjItMC4zLTAuNS0wLjgtMS42LTAuN0wxNy44LDE5bC0wLjItMC41aC0zLjgKCQkJYy0wLjEsMC0wLjIsMC0wLjQsMGMtMC43LDAtMi4yLTAuMS0zLjEsMC4xQzguNCwxOSw3LDE5LjksNi40LDIwLjRjLTAuMSwwLTAuMSwwLjEtMC4xLDAuMWMwLjMsMC4yLDEuOSwwLjEsMi44LDBsMC40LDBsMjIuNCwwLjMKCQkJTDMwLjcsMjIuNXoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0zMC4zLDIwLjNsLTEzLjItMC4xbC0wLjksMC42bC05LjYtMC4xYy0xLjQsMC0xLjEsMC42LTEuMSwwLjZzMi4yLDAuMiwzLjEsMC4yaDcuNmwxLjEtMC42bDkuNCwwLjIKCQkJYzMuNiwwLDQuNCwwLDQsMC40Yy0wLjMsMC4zLTEuMiwwLjgtMS4yLDAuOHY2aDEuMXYtMy45YzAtMS41LDAtMS44LDAtMS44bDEuNS0wLjlDMzIuMywyMS42LDMyLjgsMjAuMywzMC4zLDIwLjN6Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTMxLDI4LjVoLTEuNXYtNi40bDAuMS0wLjFjMC4yLTAuMSwwLjktMC41LDEuMS0wLjdjLTAuNS0wLjEtMi4xLTAuMS0zLjgtMC4xTDE3LjUsMjFsLTEuMSwwLjZIOC43CgkJCWMtMC45LDAtMy4xLTAuMi0zLjItMC4ybC0wLjEsMGwtMC4xLTAuMWMwLDAtMC4xLTAuMiwwLTAuNWMwLjItMC4zLDAuNi0wLjQsMS4zLTAuNGw5LjYsMC4xbDAuOS0wLjZsMTMuMiwwLjEKCQkJYzEuMSwwLDEuOCwwLjIsMi4xLDAuN2MwLjMsMC40LDAuMSwwLjgsMC4xLDAuOWwwLDAuMUwzMSwyMi43YzAsMC4yLDAsMC43LDAsMS43VjI4LjV6IE0yOS45LDI4LjFoMC43di0zLjdjMC0xLjUsMC0xLjgsMC0xLjgKCQkJbDAtMC4xbDEuNS0wLjljMC0wLjEsMC0wLjMtMC4xLTAuNGMtMC4yLTAuMi0wLjYtMC41LTEuNy0wLjVoMGwtMTMuMS0wLjFMMTYuMywyMWwtOS43LTAuMWMtMC43LDAtMC44LDAuMS0wLjksMC4yCgkJCWMwLjUsMCwyLjIsMC4yLDMsMC4yaDcuNWwxLjEtMC42bDAuMSwwbDkuNCwwLjJjMCwwLDAsMCwwLDBjMy42LDAsNC4xLDAsNC4yLDAuNGMwLjEsMC4xLDAsMC4zLTAuMSwwLjRjLTAuMiwwLjItMC45LDAuNi0xLjEsMC44CgkJCVYyOC4xeiIvPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0NSIgZD0iTTMwLjgsMjguMyIvPgoJPC9nPgoJPGc+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDMiIGQ9Ik0zNi40LDIxLjdjMCwwLTEuMSwwLjItMS40LDAuM2MtMC43LDAuNC0wLjcsMS45LDAuMSwyLjVjMSwwLDEuNSwwLDEuNSwwTDM2LjQsMjEuN3oiLz4KCQkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTM2LjcsMjQuNkwzNi43LDI0LjZjMCwwLTAuNiwwLTEuNiwwbDAsMGwwLDBjLTAuNC0wLjMtMC43LTAuOS0wLjctMS41YzAtMC41LDAuMi0wLjksMC42LTEKCQkJCWMwLjMtMC4xLDEuNC0wLjMsMS40LTAuM2wwLDBsMCwwTDM2LjcsMjQuNnogTTM1LjEsMjQuNWMwLjgsMCwxLjMsMCwxLjUsMGwtMC4yLTIuOGMtMC4yLDAtMS4xLDAuMi0xLjQsMC4zCgkJCQljLTAuMywwLjEtMC41LDAuNS0wLjUsMUMzNC41LDIzLjcsMzQuNywyNC4yLDM1LjEsMjQuNXoiLz4KCQk8L2c+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0zNi41LDI0LjZjLTAuNiwwLTEtMC42LTEtMS40YzAtMC44LDAuNS0xLjQsMS0xLjRzMSwwLjYsMSwxLjRDMzcuNiwyMy45LDM3LjEsMjQuNiwzNi41LDI0LjZ6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0zNi41LDI0LjZjLTAuNiwwLTEuMS0wLjYtMS4xLTEuNWMwLTAuOCwwLjUtMS41LDEuMS0xLjVjMC42LDAsMS4xLDAuNywxLjEsMS41YzAsMC41LTAuMSwwLjktMC40LDEuMgoJCQkJQzM3LDI0LjUsMzYuNywyNC42LDM2LjUsMjQuNnogTTM2LjUsMjEuN2MtMC41LDAtMSwwLjctMSwxLjRjMCwwLjgsMC40LDEuNCwxLDEuNGMwLjIsMCwwLjQtMC4xLDAuNi0wLjMKCQkJCWMwLjMtMC4zLDAuNC0wLjcsMC40LTEuMUMzNy41LDIyLjMsMzcsMjEuNywzNi41LDIxLjd6Ii8+CgkJPC9nPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMzYuNSwyNC4zYy0wLjUsMC0wLjktMC42LTAuOS0xLjJjMC0wLjcsMC40LTEuMiwwLjktMS4yczAuOSwwLjYsMC45LDEuMkMzNy40LDIzLjgsMzcsMjQuMywzNi41LDI0LjN6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0zNi41LDI0LjRjLTAuNSwwLTEtMC42LTEtMS4zYzAtMC43LDAuNC0xLjMsMS0xLjNjMC41LDAsMSwwLjYsMSwxLjNDMzcuNCwyMy44LDM3LDI0LjQsMzYuNSwyNC40egoJCQkJIE0zNi41LDIxLjljLTAuNSwwLTAuOSwwLjUtMC45LDEuMmMwLDAuNywwLjQsMS4yLDAuOSwxLjJjMC41LDAsMC45LTAuNSwwLjktMS4yQzM3LjQsMjIuNSwzNywyMS45LDM2LjUsMjEuOXoiLz4KCQk8L2c+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDciIGQ9Ik0zNi40LDI0LjNjLTAuNCwwLTAuNy0wLjUtMC43LTEuMmMwLTAuNywwLjMtMS4yLDAuNy0xLjJjMC40LDAsMC43LDAuNSwwLjcsMS4yCgkJCQlDMzcuMSwyMy44LDM2LjgsMjQuMywzNi40LDI0LjN6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDgiIGQ9Ik0zNi4zLDI0LjNjLTAuNCwwLTAuNy0wLjUtMC43LTEuMmMwLTAuNywwLjMtMS4yLDAuNy0xLjJzMC43LDAuNSwwLjcsMS4yQzM3LjEsMjMuOCwzNi43LDI0LjMsMzYuMywyNC4zeiIKCQkJCS8+CgkJPC9nPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMzYuNCwyNC40Yy0wLjUsMC0wLjktMC42LTAuOS0xLjNjMC0wLjcsMC40LTEuMywwLjktMS4zYzAuNSwwLDAuOSwwLjYsMC45LDEuMwoJCQkJQzM3LjIsMjMuOCwzNi45LDI0LjQsMzYuNCwyNC40eiBNMzYuNCwyMS45Yy0wLjQsMC0wLjgsMC41LTAuOCwxLjJjMCwwLjYsMC40LDEuMiwwLjgsMS4yYzAuNCwwLDAuOC0wLjUsMC44LTEuMgoJCQkJQzM3LjEsMjIuNSwzNi44LDIxLjksMzYuNCwyMS45eiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QzIiBkPSJNMzMuOCwyMi44YzAsMC0xLjEsMC4yLTEuNCwwLjNjLTAuNywwLjQtMC43LDEuOSwwLjEsMi41YzEsMCwxLjUsMCwxLjUsMEwzMy44LDIyLjh6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0zNC4xLDI1LjdMMzQuMSwyNS43YzAsMC0wLjYsMC0xLjYsMGwwLDBsMCwwYy0wLjQtMC4zLTAuNy0wLjktMC43LTEuNWMwLTAuNSwwLjItMC45LDAuNi0xCgkJCQljMC4zLTAuMSwxLjQtMC4zLDEuNC0wLjNsMCwwbDAsMEwzNC4xLDI1Ljd6IE0zMi41LDI1LjZjMC44LDAsMS4zLDAsMS41LDBsLTAuMi0yLjhjLTAuMiwwLTEuMSwwLjItMS40LDAuMwoJCQkJYy0wLjMsMC4xLTAuNSwwLjUtMC41LDFDMzEuOSwyNC43LDMyLjEsMjUuMywzMi41LDI1LjZ6Ii8+CgkJPC9nPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzMuOSwyNS42Yy0wLjYsMC0xLTAuNi0xLTEuNHMwLjUtMS40LDEtMS40YzAuNiwwLDEsMC42LDEsMS40UzM0LjUsMjUuNiwzMy45LDI1LjZ6Ii8+CgkJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0zMy45LDI1LjdjLTAuNiwwLTEuMS0wLjYtMS4xLTEuNWMwLTAuOCwwLjUtMS41LDEuMS0xLjVjMC42LDAsMS4xLDAuNiwxLjEsMS41UzM0LjUsMjUuNywzMy45LDI1Ljd6CgkJCQkgTTMzLjksMjIuOGMtMC41LDAtMSwwLjYtMSwxLjRjMCwwLjgsMC40LDEuNCwxLDEuNGMwLjYsMCwxLTAuNiwxLTEuNFMzNC41LDIyLjgsMzMuOSwyMi44eiIvPgoJCTwvZz4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTMzLjksMjUuNWMtMC41LDAtMC45LTAuNi0wLjktMS4yYzAtMC43LDAuNC0xLjIsMC45LTEuMnMwLjksMC42LDAuOSwxLjJDMzQuOCwyNC45LDM0LjQsMjUuNSwzMy45LDI1LjV6IgoJCQkJLz4KCQkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTMzLjksMjUuNWMtMC41LDAtMS0wLjYtMS0xLjNjMC0wLjcsMC40LTEuMywxLTEuM2MwLjUsMCwxLDAuNiwxLDEuM0MzNC45LDI0LjksMzQuNCwyNS41LDMzLjksMjUuNXoKCQkJCSBNMzMuOSwyM2MtMC41LDAtMC45LDAuNS0wLjksMS4yczAuNCwxLjIsMC45LDEuMmMwLjUsMCwwLjktMC41LDAuOS0xLjJTMzQuNCwyMywzMy45LDIzeiIvPgoJCTwvZz4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0NyIgZD0iTTMzLjgsMjUuNGMtMC40LDAtMC43LTAuNS0wLjctMS4yYzAtMC43LDAuMy0xLjIsMC43LTEuMnMwLjcsMC41LDAuNywxLjJDMzQuNiwyNC45LDM0LjIsMjUuNCwzMy44LDI1LjR6IgoJCQkJLz4KCQkJPHBhdGggY2xhc3M9InN0OCIgZD0iTTMzLjcsMjUuNGMtMC40LDAtMC43LTAuNS0wLjctMS4yYzAtMC43LDAuMy0xLjIsMC43LTEuMmMwLjQsMCwwLjcsMC41LDAuNywxLjIKCQkJCUMzNC41LDI0LjksMzQuMSwyNS40LDMzLjcsMjUuNHoiLz4KCQk8L2c+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0zMy44LDI1LjVjLTAuNSwwLTAuOS0wLjYtMC45LTEuM2MwLTAuNywwLjQtMS4zLDAuOS0xLjNjMC41LDAsMC45LDAuNiwwLjksMS4zCgkJCQlDMzQuNiwyNC45LDM0LjIsMjUuNSwzMy44LDI1LjV6IE0zMy44LDIzYy0wLjQsMC0wLjgsMC41LTAuOCwxLjJjMCwwLjYsMC40LDEuMiwwLjgsMS4yYzAuNCwwLDAuOC0wLjUsMC44LTEuMgoJCQkJQzM0LjYsMjMuNiwzNC4yLDIzLDMzLjgsMjN6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPHJlY3QgeD0iMTMuOSIgeT0iMTUuMyIgY2xhc3M9InN0MSIgd2lkdGg9IjEiIGhlaWdodD0iNC44Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE1LjEsMjAuNGgtMS40di01LjJoMS40VjIwLjR6IE0xNC4xLDIwaDAuNnYtNC40aC0wLjZWMjB6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cmVjdCB4PSI4LjUiIHk9IjE1LjIiIGNsYXNzPSJzdDEiIHdpZHRoPSIxIiBoZWlnaHQ9IjUiLz4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNOS43LDIwLjRIOC4zVjE1aDEuNFYyMC40eiBNOC43LDIwaDAuNnYtNC41SDguN1YyMHoiLz4KCTwvZz4KCTxnPgoJCTxyZWN0IHg9IjEwLjkiIHk9IjE0LjIiIGNsYXNzPSJzdDkiIHdpZHRoPSIxIiBoZWlnaHQ9IjQuNCIvPgoJCTxwYXRoIGNsYXNzPSJzdDEwIiBkPSJNMTIuMSwxOC44aC0xLjRWMTRoMS40VjE4Ljh6IE0xMS4xLDE4LjRoMC42di00aC0wLjZWMTguNHoiLz4KCTwvZz4KCTxnPgoJCTxyZWN0IHg9IjE2LjEiIHk9IjEzLjkiIGNsYXNzPSJzdDkiIHdpZHRoPSIxIiBoZWlnaHQ9IjQuOCIvPgoJCTxwYXRoIGNsYXNzPSJzdDEwIiBkPSJNMTcuMywxOC44aC0xLjR2LTUuMmgxLjRWMTguOHogTTE2LjMsMTguNGgwLjZ2LTQuM2gtMC42VjE4LjR6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNC4zLDE2LjhoMTEuOGMwLjMsMCwwLjctMC4xLDEtMC4ybDQuOS0yLjdjMC4yLTAuMiwwLjItMC4yLTAuMS0wLjJIMTAuMWMtMC4zLDAtMC43LDAuMS0xLDAuMmwtNC44LDIuNwoJCQlDNCwxNi43LDQsMTYuOCw0LjMsMTYuOHoiLz4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMTYuMiwxN0g0LjNjLTAuMywwLTAuNC0wLjEtMC41LTAuMmMwLTAuMiwwLjEtMC4zLDAuMy0wLjRMOSwxMy43YzAuMy0wLjEsMC44LTAuMywxLjEtMC4zSDIyCgkJCWMwLjEsMCwwLjQsMCwwLjUsMC4yYzAuMSwwLjItMC4yLDAuMy0wLjIsMC40bC00LjksMi43QzE3LDE2LjksMTYuNSwxNywxNi4yLDE3eiBNNC42LDE2LjZoMTEuNmMwLjMsMCwwLjctMC4xLDAuOS0wLjJsNC42LTIuNgoJCQlIMTAuMWMtMC4zLDAtMC43LDAuMS0wLjksMC4yTDQuNiwxNi42eiIvPgoJPC9nPgoJPGc+CgkJPHJlY3QgeD0iMTMuOSIgeT0iMTEuNiIgY2xhc3M9InN0MSIgd2lkdGg9IjEiIGhlaWdodD0iNC44Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTE1LjEsMTYuNmgtMS40di01LjJoMS40VjE2LjZ6IE0xNC4xLDE2LjJoMC42di00LjRoLTAuNlYxNi4yeiIvPgoJPC9nPgoJPGc+CgkJPHJlY3QgeD0iOC41IiB5PSIxMS40IiBjbGFzcz0ic3QxIiB3aWR0aD0iMSIgaGVpZ2h0PSI1Ii8+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTkuNywxNi42SDguM3YtNS40aDEuNFYxNi42eiBNOC43LDE2LjJoMC42di00LjVIOC43VjE2LjJ6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cmVjdCB4PSIxMC45IiB5PSIxMiIgY2xhc3M9InN0OSIgd2lkdGg9IjEiIGhlaWdodD0iMyIvPgoJCTxwYXRoIGNsYXNzPSJzdDEwIiBkPSJNMTIuMSwxNS4yaC0xLjR2LTMuNGgxLjRWMTUuMnogTTExLjEsMTQuOGgwLjZ2LTIuNmgtMC42VjE0Ljh6Ii8+Cgk8L2c+Cgk8Zz4KCQk8cmVjdCB4PSIxNi4xIiB5PSIxMS40IiBjbGFzcz0ic3Q5IiB3aWR0aD0iMSIgaGVpZ2h0PSIzLjYiLz4KCQk8cGF0aCBjbGFzcz0ic3QxMCIgZD0iTTE3LjMsMTUuM2gtMS40di00aDEuNFYxNS4zeiBNMTYuMywxNC45aDAuNnYtMy4yaC0wLjZWMTQuOXoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik00LjMsMTMuOWgxMS44YzAuMywwLDAuNy0wLjEsMS0wLjJsNC45LTIuN2MwLjItMC4yLDAuMi0wLjItMC4xLTAuMkgxMC4xYy0wLjMsMC0wLjcsMC4xLTEsMC4ybC00LjgsMi43CgkJCUM0LDEzLjgsNCwxMy45LDQuMywxMy45eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNi4yLDE0LjFINC4zYy0wLjMsMC0wLjQtMC4xLTAuNS0wLjJjMC0wLjIsMC4xLTAuMywwLjMtMC40TDksMTAuOGMwLjMtMC4xLDAuOC0wLjMsMS4xLTAuM0gyMgoJCQljMC4xLDAsMC40LDAsMC41LDAuMmMwLjEsMC4yLTAuMiwwLjMtMC4yLDAuNGwtNC45LDIuN0MxNywxNCwxNi41LDE0LjEsMTYuMiwxNC4xeiBNNC42LDEzLjdoMTEuNmMwLjMsMCwwLjctMC4xLDAuOS0wLjJsNC42LTIuNgoJCQlIMTAuMWMtMC4zLDAtMC43LDAuMS0wLjksMC4yTDQuNiwxMy43eiIvPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MSIgZD0iTTMyLjQsMTQuN2MwLDAuOSwwLDEuOSwwLDIuOWMwLDAuNSwwLDEuMSwwLDEuNmMtMC40LDAuMi0wLjgsMC40LTEuMiwwLjVjLTAuNCwwLjEtMC43LDAuMi0xLDAuMwoJCQljMCwwLDAsMCwwLDBjMCwwLTAuMSwwLTAuMSwwYy0wLjEsMC0wLjEtMi0wLjEtM2MwLTAuNy0wLjEtMS4yLTAuMS0xLjVjMC4zLTAuMywwLjctMC42LDEuMi0wLjhDMzEuNiwxNC40LDMyLjEsMTQuNSwzMi40LDE0Ljd6IgoJCQkvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0zMCwyMC4xbC0wLjEsMGMtMC4yLTAuMS0wLjItMC4xLTAuMi0yYzAtMC40LDAtMC45LDAtMS4yYzAtMC42LTAuMS0xLTAuMS0xLjRsMC0wLjJsMC4xLTAuMQoJCQljMC4yLTAuMiwwLjctMC43LDEuMy0wLjhjMC41LTAuMSwxLTAuMSwxLjYsMC4xbDAuMSwwLjFsMCwwLjJjMCwwLjksMCwxLjksMCwyLjljMCwwLjMsMCwwLjYsMCwwLjhjMCwwLjMsMCwwLjUsMCwwLjd2MC4xCgkJCWwtMC40LDAuMmMtMC4zLDAuMS0wLjYsMC4zLTEsMC40QzMwLjgsMTkuOSwzMC41LDIwLDMwLDIwLjFMMzAsMjAuMXogTTI5LjksMTUuNEwyOS45LDE1LjRjMCwwLjQsMC4xLDAuOSwwLjEsMS41CgkJCWMwLDAuMywwLDAuOCwwLDEuMmMwLDAuNSwwLDEuMywwLDEuNmMwLjMtMC4xLDAuNi0wLjEsMC45LTAuM2MwLjMtMC4xLDAuNy0wLjIsMC45LTAuNGwwLjEtMC4xYzAtMC4yLDAtMC40LDAtMC42CgkJCWMwLTAuMywwLTAuNSwwLTAuOGMwLTEsMC0xLjksMC0yLjhjLTAuNC0wLjEtMC44LTAuMS0xLjIsMEMzMC41LDE0LjksMzAuMiwxNS4yLDI5LjksMTUuNHoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yOSwxNS4xYzAuNywwLjEsMS4yLDAuNSwxLjUsMC43Yy0wLjEsMC4zLTAuMiwwLjgtMC4yLDEuNGMwLDAuOSwwLDIuNy0wLjEsMi43YzAsMCwwLDAtMC4xLDBjMCwwLDAsMC0wLjEsMAoJCQljLTAuNCwwLTAuOS0wLjEtMS4zLTAuMmMtMC42LTAuMS0xLjEtMC4zLTEuNS0wLjRjMC0wLjQsMC0wLjksMC0xLjRjMC0wLjksMC0xLjgtMC4xLTIuNkMyNy41LDE1LjEsMjguMiwxNSwyOSwxNS4xeiIvPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0zMC4xLDIwLjFMMzAuMSwyMC4xYy0wLjUtMC4xLTEtMC4xLTEuNC0wLjNjLTAuNC0wLjEtMC44LTAuMi0xLjItMC4zTDI3LDE5LjR2LTAuMmMwLTAuMiwwLTAuNCwwLTAuNwoJCQljMC0wLjIsMC0wLjUsMC0wLjdjMC0wLjksMC0xLjgtMC4xLTIuNmwwLTAuMmwwLjIsMGMwLjYtMC4yLDEuMy0wLjIsMS45LTAuMWwwLDBjMC44LDAuMiwxLjMsMC41LDEuNiwwLjdsMC4xLDAuMWwwLDAuMgoJCQljLTAuMSwwLjMtMC4xLDAuNy0wLjIsMS4yYzAsMC4zLDAsMC43LDAsMS4xYzAsMS42LDAsMS43LTAuMywxLjhMMzAuMSwyMC4xeiBNMjcuNCwxOS4xbDAuMiwwLjFjMC40LDAuMSwwLjgsMC4yLDEuMiwwLjMKCQkJYzAuNSwwLjEsMC44LDAuMiwxLjMsMC4yYzAtMC4zLDAtMC45LDAtMS40YzAtMC40LDAtMC44LDAtMS4xYzAtMC41LDAuMS0xLDAuMi0xLjNjLTAuMy0wLjItMC43LTAuNS0xLjMtMC42CgkJCWMtMC41LTAuMS0xLTAuMS0xLjYsMGMwLDAuOCwwLDEuNiwwLDIuNWMwLDAuMywwLDAuNSwwLDAuN0MyNy40LDE4LjcsMjcuNCwxOC45LDI3LjQsMTkuMXoiLz4KCTwvZz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik05LjMsMTljLTMuOCwwLTYuOSwzLjEtNi45LDYuOXMzLjEsNi45LDYuOSw2LjljMy44LDAsNi45LTMuMSw2LjktNi45UzEzLjEsMTksOS4zLDE5eiBNOS4zLDMxLjUKCQkJYy0zLjEsMC01LjYtMi41LTUuNi01LjZzMi41LTUuNiw1LjYtNS42YzMuMSwwLDUuNiwyLjUsNS42LDUuNlMxMi40LDMxLjUsOS4zLDMxLjV6Ii8+CgkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTIuNywyMy44Yy0xLjIsMy42LDAuOCw3LjUsNC40LDguN3M3LjUtMC44LDguNy00LjRjMS4yLTMuNi0wLjgtNy41LTQuNC04LjdDNy44LDE4LjIsMy45LDIwLjIsMi43LDIzLjh6CgkJCSBNMTQuNiwyNy43Yy0xLDIuOS00LjEsNC41LTcuMSwzLjZjLTIuOS0xLTQuNS00LjEtMy42LTcuMWMxLTIuOSw0LjEtNC41LDcuMS0zLjZTMTUuNiwyNC43LDE0LjYsMjcuN3oiLz4KCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNNS4yLDMxLjVjMy4xLDIuMiw3LjQsMS42LDkuNi0xLjVzMS42LTcuNC0xLjUtOS42Yy0zLjEtMi4yLTcuNC0xLjYtOS42LDEuNVMyLjIsMjkuMyw1LjIsMzEuNXogTTEyLjYsMjEuNAoJCQljMi41LDEuOCwzLjEsNS4zLDEuMiw3LjhTOC41LDMyLjMsNiwzMC41Yy0yLjUtMS44LTMuMS01LjMtMS4yLTcuOFMxMC4xLDE5LjYsMTIuNiwyMS40eiIvPgoJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0xMy40LDMxLjVjMy4xLTIuMiwzLjgtNi41LDEuNS05LjZzLTYuNS0zLjgtOS42LTEuNWMtMy4xLDIuMi0zLjgsNi41LTEuNSw5LjZTMTAuMywzMy44LDEzLjQsMzEuNXogTTYsMjEuNAoJCQljMi41LTEuOCw2LTEuMyw3LjgsMS4yczEuMyw2LTEuMiw3LjhjLTIuNSwxLjgtNiwxLjMtNy44LTEuMlMzLjUsMjMuMiw2LDIxLjR6Ii8+CgkJPGc+CgkJCTxwYXRoIGNsYXNzPSJzdDExIiBkPSJNOS4zLDE5LjljLTMuMywwLTYsMi43LTYsNnMyLjcsNiw2LDZjMy4zLDAsNi0yLjcsNi02UzEyLjYsMTkuOSw5LjMsMTkuOXogTTEwLDIxYzEuNywwLjIsMy4xLDEuMywzLjgsMi44CgkJCQljLTAuNSwwLjItMi41LDAuMS0yLjgtMC4xQzEwLjcsMjMuMyw5LjksMjEuNSwxMCwyMXogTTguNiwyMWMwLjEsMC41LTAuNywyLjQtMSwyLjZjLTAuMywwLjItMi4zLDAuNC0yLjgsMC4xCgkJCQlDNS41LDIyLjIsNywyMS4yLDguNiwyMXogTTUuOCwyOS41Yy0xLjItMS4yLTEuNy0yLjktMS41LTQuNWMwLjUsMC4xLDIuMSwxLjQsMi4yLDEuOEM2LjcsMjcuMiw2LjIsMjkuMiw1LjgsMjkuNXogTTYuOSwzMC4zCgkJCQljMC4yLTAuNSwxLjktMS41LDIuNC0xLjVjMC40LDAsMi4xLDEuMSwyLjQsMS41QzEwLjIsMzEuMSw4LjQsMzEuMSw2LjksMzAuM3ogTTEyLjgsMjkuNWMtMC40LTAuNC0wLjktMi4zLTAuNy0yLjcKCQkJCWMwLjEtMC40LDEuNy0xLjcsMi4yLTEuOEMxNC41LDI2LjcsMTQsMjguNCwxMi44LDI5LjV6Ii8+CgkJCTxwYXRoIGQ9Ik05LjMsMzIuMmMtMy40LDAtNi4yLTIuOC02LjItNi4yYzAtMy40LDIuOC02LjIsNi4yLTYuMnM2LjIsMi44LDYuMiw2LjJDMTUuNSwyOS40LDEyLjcsMzIuMiw5LjMsMzIuMnogTTkuMywyMC4xCgkJCQljLTMuMiwwLTUuOCwyLjYtNS44LDUuOHMyLjYsNS44LDUuOCw1LjhzNS44LTIuNiw1LjgtNS44UzEyLjUsMjAuMSw5LjMsMjAuMXogTTkuMywzMS4xYy0wLjgsMC0xLjctMC4yLTIuNS0wLjZsLTAuMi0wLjEKCQkJCWwwLjEtMC4yYzAuMy0wLjUsMi0xLjYsMi41LTEuNmMwLDAsMCwwLDAsMGMwLjUsMCwyLjMsMS4yLDIuNSwxLjZsMC4xLDAuMmwtMC4yLDAuMUMxMSwzMC45LDEwLjEsMzEuMSw5LjMsMzEuMXogTTcuMywzMC4zCgkJCQljMS4zLDAuNiwyLjgsMC42LDQuMSwwYy0wLjUtMC41LTEuOC0xLjMtMi0xLjNjMCwwLDAsMCwwLDBDOSwyOSw3LjcsMjkuOCw3LjMsMzAuM3ogTTEyLjgsMjkuOGwtMC4xLTAuMQoJCQkJYy0wLjQtMC40LTAuOS0yLjQtMC44LTIuOWMwLjItMC41LDEuOC0xLjgsMi4zLTEuOWwwLjIsMGwwLDAuMmMwLjMsMS43LTAuMywzLjUtMS41LDQuN0wxMi44LDI5Ljh6IE0xNC4xLDI1LjMKCQkJCWMtMC42LDAuMy0xLjcsMS4zLTEuOCwxLjVjLTAuMSwwLjMsMC4zLDEuNywwLjYsMi4zQzEzLjgsMjguMiwxNC4yLDI2LjcsMTQuMSwyNS4zeiBNNS44LDI5LjhsLTAuMS0wLjEKCQkJCWMtMS4yLTEuMi0xLjgtMi45LTEuNS00LjdsMC0wLjJsMC4yLDBjMC42LDAuMSwyLjIsMS40LDIuMywxLjljMC4xLDAuNS0wLjQsMi41LTAuOCwyLjlMNS44LDI5Ljh6IE00LjUsMjUuMwoJCQkJYy0wLjIsMS40LDAuMywyLjgsMS4zLDMuOWMwLjMtMC42LDAuNi0yLjEsMC42LTIuM0M2LjMsMjYuNiw1LjEsMjUuNiw0LjUsMjUuM3ogTTEyLjgsMjRjLTAuOCwwLTEuNy0wLjEtMS45LTAuMwoJCQkJYy0wLjQtMC4zLTEuMi0yLjMtMS4xLTIuOGwwLTAuMmwwLjIsMGMxLjcsMC4yLDMuMiwxLjMsNCwyLjlsMC4xLDAuMmwtMC4yLDAuMUMxMy43LDI0LDEzLjMsMjQsMTIuOCwyNHogTTEwLjIsMjEuMgoJCQkJYzAuMSwwLjYsMC43LDIuMSwwLjksMi4yYzAuMiwwLjIsMS43LDAuMywyLjQsMC4yQzEyLjgsMjIuMywxMS42LDIxLjUsMTAuMiwyMS4yeiBNNS44LDI0Yy0wLjUsMC0wLjksMC0xLjEtMC4xbC0wLjItMC4xCgkJCQlsMC4xLTAuMmMwLjgtMS42LDIuMi0yLjYsNC0yLjlsMC4yLDBsMCwwLjJjMC4xLDAuNi0wLjcsMi41LTEuMSwyLjhDNy41LDIzLjksNi41LDI0LDUuOCwyNHogTTUuMSwyMy42YzAuNiwwLjEsMi4yLDAsMi40LTAuMgoJCQkJYzAuMi0wLjIsMC44LTEuNiwwLjktMi4yQzcsMjEuNSw1LjgsMjIuMyw1LjEsMjMuNnoiLz4KCQk8L2c+CgkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTE1LjksMjMuOGMtMS4yLTMuNi01LjEtNS42LTguNy00LjRjLTMuNiwxLjItNS42LDUuMS00LjQsOC43YzEuMiwzLjYsNS4xLDUuNiw4LjcsNC40UzE3LDI3LjQsMTUuOSwyMy44egoJCQkgTTQsMjcuN2MtMS0yLjksMC43LTYuMSwzLjYtNy4xczYuMSwwLjcsNy4xLDMuNmMxLDIuOS0wLjcsNi4xLTMuNiw3LjFDOC4xLDMyLjIsNC45LDMwLjYsNCwyNy43eiIvPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNOS4zLDI4LjNjLTEuMywwLTIuMy0xLTIuMy0yLjNjMC0xLjMsMS0yLjMsMi4zLTIuM2MxLjMsMCwyLjMsMSwyLjMsMi4zQzExLjYsMjcuMiwxMC42LDI4LjMsOS4zLDI4LjN6CgkJCQkgTTkuMywyNC40Yy0wLjgsMC0xLjUsMC43LTEuNSwxLjVzMC43LDEuNSwxLjUsMS41YzAuOCwwLDEuNS0wLjcsMS41LTEuNVMxMC4xLDI0LjQsOS4zLDI0LjR6Ii8+CgkJPC9nPgoJPC9nPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTI5LjUsMjIuM2MtMi4xLTMuMi02LjMtNC4xLTkuNS0yLjFzLTQuMSw2LjMtMi4xLDkuNWMyLjEsMy4yLDYuMyw0LjEsOS41LDIuMVMzMS41LDI1LjUsMjkuNSwyMi4zegoJCQkgTTE5LDI5LjFjLTEuNy0yLjYtMC45LTYuMSwxLjctNy43YzIuNi0xLjcsNi4xLTAuOSw3LjcsMS43YzEuNywyLjYsMC45LDYuMS0xLjcsNy43QzI0LjEsMzIuNCwyMC43LDMxLjcsMTksMjkuMXoiLz4KCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMjEuOSwxOS40Yy0zLjcsMS01LjksNC44LTQuOSw4LjRzNC44LDUuOSw4LjQsNC45YzMuNy0xLDUuOS00LjgsNC45LTguNFMyNS42LDE4LjQsMjEuOSwxOS40eiBNMjUuMSwzMS40CgkJCWMtMywwLjgtNi4xLTEtNi44LTRzMS02LjEsNC02LjhjMy0wLjgsNi4xLDEsNi44LDRDMjkuOSwyNy42LDI4LjEsMzAuNywyNS4xLDMxLjR6Ii8+CgkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTE2LjgsMjUuN2MtMC4yLDMuOCwyLjcsNy4xLDYuNSw3LjNzNy4xLTIuNyw3LjMtNi41YzAuMi0zLjgtMi43LTcuMS02LjUtNy4zUzE3LDIxLjksMTYuOCwyNS43eiBNMjkuMywyNi4zCgkJCWMtMC4yLDMuMS0yLjgsNS40LTUuOSw1LjNjLTMuMS0wLjItNS40LTIuOC01LjMtNS45YzAuMi0zLjEsMi44LTUuNCw1LjktNS4zUzI5LjQsMjMuMywyOS4zLDI2LjN6Ii8+CgkJPHBhdGggY2xhc3M9InN0NiIgZD0iTTIxLjIsMzIuNWMzLjYsMS40LDcuNS0wLjQsOC45LTMuOWMxLjQtMy42LTAuNC03LjUtMy45LTguOXMtNy41LDAuNC04LjksMy45QzE1LjksMjcuMSwxNy43LDMxLjEsMjEuMiwzMi41CgkJCXogTTI1LjcsMjAuOGMyLjksMS4xLDQuMyw0LjQsMy4yLDcuMnMtNC40LDQuMy03LjIsMy4ycy00LjMtNC40LTMuMi03LjJTMjIuOCwxOS43LDI1LjcsMjAuOHoiLz4KCQk8Zz4KCQkJPHBhdGggY2xhc3M9InN0MTEiIGQ9Ik0yOC43LDIyLjhjLTEuOC0yLjgtNS41LTMuNi04LjMtMS44cy0zLjYsNS41LTEuOCw4LjNjMS44LDIuOCw1LjUsMy42LDguMywxLjgKCQkJCUMyOS43LDI5LjMsMzAuNSwyNS42LDI4LjcsMjIuOHogTTI4LjMsMjMuOWMwLjcsMS41LDAuNiwzLjMtMC4zLDQuN2MtMC40LTAuMy0xLjQtMi0xLjQtMi40QzI2LjYsMjUuOCwyNy44LDI0LjEsMjguMywyMy45egoJCQkJIE0yNy41LDIyLjdjLTAuNCwwLjMtMi40LDAuNy0yLjcsMC42Yy0wLjQtMC4xLTEuNi0xLjgtMS42LTIuM0MyNC44LDIwLjgsMjYuNCwyMS41LDI3LjUsMjIuN3ogTTE4LjgsMjUuMWMwLjMtMS43LDEuNS0zLDMtMy43CgkJCQljMC4yLDAuNSwwLDIuNS0wLjMsMi44QzIxLjIsMjQuNSwxOS4zLDI1LjIsMTguOCwyNS4xeiBNMTguNywyNi40YzAuNSwwLDIuMywwLjgsMi42LDEuMWMwLjIsMC4zLDAuMiwyLjQsMCwyLjgKCQkJCUMxOS44LDI5LjYsMTguOSwyOC4xLDE4LjcsMjYuNHogTTIyLjYsMzAuOWMwLjEtMC41LDEuNS0yLDEuOS0yLjFjMC40LTAuMSwyLjMsMC41LDIuNywwLjlDMjUuOSwzMC45LDI0LjIsMzEuMywyMi42LDMwLjl6Ii8+CgkJCTxwYXRoIGQ9Ik0yMy43LDMyLjJjLTIsMC00LTEtNS4yLTIuOGMtMS45LTIuOS0xLTYuNywxLjgtOC42YzEuNC0wLjksMy4xLTEuMiw0LjctMC45YzEuNiwwLjMsMywxLjMsMy45LDIuNwoJCQkJYzEuOSwyLjksMSw2LjctMS44LDguNkMyNiwzMS45LDI0LjksMzIuMiwyMy43LDMyLjJ6IE0yMy43LDIwLjJjLTEuMSwwLTIuMiwwLjMtMy4xLDAuOWMtMi43LDEuNy0zLjUsNS4zLTEuNyw4CgkJCQljMS43LDIuNyw1LjMsMy41LDgsMS43YzIuNy0xLjcsMy41LTUuMywxLjctOGwwLDBjLTAuOC0xLjMtMi4xLTIuMi0zLjctMi41QzI0LjUsMjAuMywyNC4xLDIwLjIsMjMuNywyMC4yeiBNMjMuNywzMS4yCgkJCQljLTAuNCwwLTAuOCwwLTEuMi0wLjFsLTAuMiwwbDAtMC4yYzAuMS0wLjYsMS41LTIuMSwyLTIuMmMwLjUtMC4xLDIuNSwwLjUsMi45LDAuOWwwLjEsMC4ybC0wLjIsMC4xCgkJCQlDMjYuMywzMC44LDI1LDMxLjIsMjMuNywzMS4yeiBNMjIuOSwzMC44YzEuNCwwLjMsMi44LTAuMSwzLjktMWMtMC42LTAuMy0yLTAuOC0yLjMtMC43QzI0LjIsMjkuMSwyMy4yLDMwLjIsMjIuOSwzMC44egoJCQkJIE0yMS4zLDMwLjdsLTAuMi0wLjFjLTEuNS0wLjgtMi41LTIuNC0yLjctNC4xbDAtMC4ybDAuMiwwYzAuNiwwLDIuNSwwLjgsMi44LDEuMmMwLjMsMC40LDAuMywyLjUsMCwzTDIxLjMsMzAuN3ogTTE4LjksMjYuNwoJCQkJYzAuMiwxLjQsMSwyLjcsMi4yLDMuNGMwLjEtMC42LDAuMS0yLjIsMC0yLjRDMjEsMjcuNSwxOS42LDI2LjgsMTguOSwyNi43eiBNMjguMSwyOC45bC0wLjItMC4xYy0wLjUtMC4zLTEuNS0yLjEtMS41LTIuNgoJCQkJYzAtMC41LDEuMy0yLjIsMS44LTIuNGwwLjItMC4xbDAuMSwwLjJjMC43LDEuNiwwLjYsMy40LTAuMyw0LjlMMjguMSwyOC45eiBNMjguMiwyNC4yYy0wLjUsMC40LTEuMywxLjctMS40LDIKCQkJCWMwLDAuMywwLjcsMS42LDEuMSwyLjFDMjguNiwyNywyOC43LDI1LjUsMjguMiwyNC4yeiBNMTguOSwyNS4zYy0wLjEsMC0wLjEsMC0wLjEsMGwtMC4yLDBsMC0wLjJjMC4zLTEuNywxLjUtMy4xLDMuMS0zLjgKCQkJCWwwLjItMC4xbDAuMSwwLjJjMC4yLDAuNSwwLDIuNi0wLjMsM0MyMS4zLDI0LjcsMTkuNiwyNS4zLDE4LjksMjUuM3ogTTIxLjYsMjEuN2MtMS4zLDAuNi0yLjIsMS44LTIuNiwzLjIKCQkJCWMwLjYtMC4xLDIuMS0wLjYsMi4zLTAuOEMyMS41LDIzLjksMjEuNywyMi4zLDIxLjYsMjEuN3ogTTI1LDIzLjZjLTAuMiwwLTAuMywwLTAuNCwwYy0wLjUtMC4yLTEuNy0xLjktMS44LTIuNGwwLTAuMmwwLjIsMAoJCQkJYzEuNy0wLjIsMy40LDAuNSw0LjYsMS44bDAuMSwwLjJsLTAuMiwwLjFDMjcuMywyMy4yLDI1LjgsMjMuNiwyNSwyMy42eiBNMjMuNCwyMS4yYzAuMywwLjYsMS4yLDEuOCwxLjQsMS45CgkJCQljMC4zLDAuMSwxLjgtMC4yLDIuNC0wLjRDMjYuMiwyMS43LDI0LjgsMjEuMSwyMy40LDIxLjJ6Ii8+CgkJPC9nPgoJCTxwYXRoIGNsYXNzPSJzdDYiIGQ9Ik0yOSwzMC40YzIuNC0zLDItNy4zLTEtOS43cy03LjMtMi05LjcsMWMtMi40LDMtMiw3LjMsMSw5LjdTMjYuNiwzMy4zLDI5LDMwLjR6IE0xOS4zLDIyLjUKCQkJYzItMi40LDUuNS0yLjgsNy45LTAuOHMyLjgsNS41LDAuOCw3LjljLTIsMi40LTUuNSwyLjgtNy45LDAuOFMxNy40LDI0LjksMTkuMywyMi41eiIvPgoJCTxnPgoJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMjMuNywyOC40Yy0wLjgsMC0xLjUtMC40LTItMS4xYy0wLjctMS4xLTAuNC0yLjUsMC43LTMuMmMxLjEtMC43LDIuNS0wLjQsMy4yLDAuN2MwLjMsMC41LDAuNSwxLjEsMC4zLDEuOAoJCQkJYy0wLjEsMC42LTAuNSwxLjEtMSwxLjVDMjQuNiwyOC4yLDI0LjEsMjguNCwyMy43LDI4LjR6IE0yMy43LDI0LjVjLTAuMywwLTAuNiwwLjEtMC44LDAuMmMtMC43LDAuNS0wLjksMS40LTAuNCwyLjEKCQkJCWMwLjUsMC43LDEuNCwwLjksMi4xLDAuNGgwYzAuNy0wLjUsMC45LTEuNCwwLjQtMi4xQzI0LjcsMjQuOCwyNC4yLDI0LjUsMjMuNywyNC41eiIvPgoJCTwvZz4KCTwvZz4KCTxnPgoJCTxnPgoJCQk8Zz4KCQkJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yNi44LDE3LjVjLTAuNC0wLjEtMC43LTAuMi0xLjEtMC40Yy0wLjktMC40LTEuOC0wLjgtMi0xLjVjLTEuMS00LjItMS04LjMtMC43LTguMwoJCQkJCWMwLjgtMC4xLDMuNSwwLjIsMy42LDAuNGMwLjEsMC4yLDMuNCw4LjQsMS44LDkuN0MyOC4xLDE3LjUsMjcuNiwxNy42LDI2LjgsMTcuNXoiLz4KCQkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0yNy40LDE3LjdjLTAuMiwwLTAuNCwwLTAuNy0wLjFsMCwwbDAuMS0wLjJsLTAuMSwwLjJjLTAuNC0wLjEtMC43LTAuMi0xLjItMC40Yy0wLjktMC40LTEuOS0wLjgtMi4xLTEuNwoJCQkJCWMtMS0zLjktMS04LTAuNy04LjRMMjIuOCw3bDAuMSwwYzAuNy0wLjEsMy42LDAuMiwzLjgsMC40YzAuMSwwLjEsMy42LDguNiwxLjgsMTBDMjguMywxNy42LDI4LDE3LjcsMjcuNCwxNy43eiBNMjYuOCwxNy4zCgkJCQkJYzAuOCwwLjIsMS4yLDAsMS40LTAuMWMxLjMtMS0xLjQtOC40LTEuOC05LjRDMjYsNy42LDIzLjksNy40LDIzLDcuNGMtMC4yLDAuNi0wLjIsNC4yLDAuOCw4YzAuMiwwLjcsMSwxLjEsMS45LDEuNAoJCQkJCUMyNi4xLDE3LDI2LjUsMTcuMiwyNi44LDE3LjN6Ii8+CgkJCTwvZz4KCQkJPGc+CgkJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzQuMywxNmMtMC40LTAuMS0wLjctMC4yLTEuMS0wLjRjLTAuOS0wLjQtMS44LTAuOC0yLTEuNWMtMS4xLTQuMi0xLTguMy0wLjctOC4zYzAuOC0wLjEsMy41LDAuMiwzLjYsMC40CgkJCQkJYzAsMC4xLDAuNSwxLjEsMC45LDIuNGMtMC4yLDIuNy0wLjIsNi4yLDAsNy41QzM0LjgsMTYuMSwzNC42LDE2LjEsMzQuMywxNnoiLz4KCQkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0zNSwxNi4zYy0wLjIsMC0wLjQsMC0wLjctMC4xbDAsMGMtMC40LTAuMS0wLjctMC4yLTEuMi0wLjRjLTAuOS0wLjQtMS45LTAuOC0yLjEtMS43Yy0xLTMuOS0xLTgtMC43LTguNAoJCQkJCWwwLjEtMC4xbDAuMSwwQzMxLjEsNS41LDM0LDUuOCwzNC4yLDZjMC4xLDAuMSwwLjUsMS4zLDEsMi41bDAsMGwwLDBjLTAuMywyLjctMC4yLDYuMiwwLDcuNWwwLDAuMkwzNSwxNi4zCgkJCQkJQzM1LDE2LjMsMzUsMTYuMywzNSwxNi4zeiBNMzQuNCwxNS44YzAuMSwwLDAuMywwLDAuNCwwLjFjLTAuMS0xLjUtMC4yLTQuNywwLTcuM2MtMC40LTEuMi0wLjgtMi4xLTAuOS0yLjMKCQkJCQljLTAuNC0wLjEtMi41LTAuNC0zLjMtMC4zYy0wLjIsMC42LTAuMiw0LjIsMC44LDhjMC4yLDAuNywxLDEuMSwxLjksMS40QzMzLjYsMTUuNiwzNCwxNS43LDM0LjQsMTUuOHoiLz4KCQkJPC9nPgoJCQk8Zz4KCQkJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0zNS4xLDguNEMzNSwxMCwzNSwxMS43LDM1LDEzLjVjMCwxLDAuMSwxLjksMC4xLDIuN2MtMS4xLDAuMy0yLjQsMC42LTMuNywwLjhjLTEuMSwwLjItMi4yLDAuNC0zLjIsMC41CgkJCQkJYy0wLjEsMC0wLjEsMC0wLjEsMGMtMC4xLDAtMC4yLDAtMC4yLDBjLTAuMy0wLjEtMC4yLTMuNC0wLjMtNS4yYy0wLjEtMS4xLTAuMS0yLjItMC4yLTIuOGMwLjktMC4zLDItMC40LDMuNi0wLjcKCQkJCQlDMzIuOCw4LjUsMzQuMSw4LjMsMzUuMSw4LjR6Ii8+CgkJCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMjgsMTcuN2gtMC4yYy0wLjMtMC4xLTAuNC0wLjUtMC40LTMuMWMwLTAuOCwwLTEuNy0wLjEtMi4zbDAtMC40YzAtMS0wLjEtMS44LTAuMi0yLjNsMC0wLjJsMC4yLTAuMQoJCQkJCWMwLjctMC4yLDEuNS0wLjMsMi41LTAuNWMwLjMtMC4xLDAuNy0wLjEsMS4xLTAuMmMxLjktMC4zLDMuMi0wLjUsNC4yLTAuNGwwLjIsMGwwLDAuMmMtMC4xLDEuNi0wLjEsMy4zLTAuMSw1LjEKCQkJCQljMCwwLjUsMCwxLDAsMS40YzAsMC40LDAsMC45LDAsMS4zdjAuMmwtMC4yLDBjLTEuMSwwLjMtMi40LDAuNi0zLjcsMC44Yy0xLjEsMC4yLTIuMiwwLjQtMy4yLDAuNUwyOCwxNy43eiBNMjcuNSw5LjYKCQkJCQljMC4xLDAuNSwwLjEsMS4zLDAuMiwyLjJsMCwwLjRjMCwwLjcsMC4xLDEuNSwwLjEsMi4zYzAsMSwwLDIuNCwwLjEsMi43bDAuMywwYzEtMC4xLDItMC4yLDMuMi0wLjVjMS4zLTAuMiwyLjQtMC41LDMuNS0wLjgKCQkJCQljMC0wLjQsMC0wLjcsMC0xLjFjMC0wLjUsMC0xLDAtMS41YzAtMS43LDAtMy40LDAuMS00LjljLTAuOSwwLTIuMiwwLjEtMy45LDAuNGMtMC40LDAuMS0wLjgsMC4xLTEuMSwwLjIKCQkJCQlDMjguOSw5LjMsMjguMSw5LjUsMjcuNSw5LjZ6Ii8+CgkJCTwvZz4KCQk8L2c+CgkJPGc+CgkJCTxnPgoJCQkJPGVsbGlwc2UgY2xhc3M9InN0MiIgY3g9IjMxLjUiIGN5PSIxMy40IiByeD0iMi4xIiByeT0iMi43Ii8+CgkJCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMzEuNSwxNi4xYy0xLjIsMC0yLjItMS4yLTIuMi0yLjhzMS0yLjgsMi4yLTIuOGMxLjIsMCwyLjIsMS4yLDIuMiwyLjhTMzIuNywxNi4xLDMxLjUsMTYuMXogTTMxLjUsMTAuNwoJCQkJCWMtMS4xLDAtMi4xLDEuMi0yLjEsMi43YzAsMS41LDAuOSwyLjcsMi4xLDIuN2MxLjEsMCwyLjEtMS4yLDIuMS0yLjdDMzMuNiwxMS45LDMyLjcsMTAuNywzMS41LDEwLjd6Ii8+CgkJCTwvZz4KCQkJPGc+CgkJCQk8ZWxsaXBzZSBjbGFzcz0ic3QxIiBjeD0iMzEuNyIgY3k9IjEzLjQiIHJ4PSIyIiByeT0iMi43Ii8+CgkJCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMzEuNywxNi4xYy0xLjEsMC0yLTEuMi0yLTIuOHMwLjktMi44LDItMi44YzEuMSwwLDIsMS4yLDIsMi44UzMyLjgsMTYuMSwzMS43LDE2LjF6IE0zMS43LDEwLjcKCQkJCQljLTEuMSwwLTEuOSwxLjItMS45LDIuN2MwLDEuNSwwLjksMi43LDEuOSwyLjdjMS4xLDAsMS45LTEuMiwxLjktMi43QzMzLjYsMTEuOSwzMi43LDEwLjcsMzEuNywxMC43eiIvPgoJCQk8L2c+CgkJCTxnPgoJCQkJPGVsbGlwc2UgY2xhc3M9InN0MiIgY3g9IjMxLjciIGN5PSIxMy40IiByeD0iMS43IiByeT0iMi4zIi8+CgkJCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMzEuNywxNS43Yy0xLDAtMS44LTEuMS0xLjgtMi40YzAtMS4zLDAuOC0yLjQsMS44LTIuNHMxLjgsMS4xLDEuOCwyLjRDMzMuNCwxNC43LDMyLjYsMTUuNywzMS43LDE1Ljd6CgkJCQkJIE0zMS43LDExLjFjLTAuOSwwLTEuNywxLTEuNywyLjNjMCwxLjMsMC44LDIuMywxLjcsMi4zczEuNy0xLDEuNy0yLjNDMzMuMywxMi4xLDMyLjYsMTEuMSwzMS43LDExLjF6Ii8+CgkJCTwvZz4KCQkJPGc+CgkJCQk8ZWxsaXBzZSBjbGFzcz0ic3QxMiIgY3g9IjMxLjUiIGN5PSIxMy40IiByeD0iMS40IiByeT0iMi4zIi8+CgkJCQk8ZWxsaXBzZSBjbGFzcz0ic3QxMyIgY3g9IjMxLjQiIGN5PSIxMy40IiByeD0iMS40IiByeT0iMi4zIi8+CgkJCQk8ZWxsaXBzZSBjbGFzcz0ic3QxNCIgY3g9IjMxLjciIGN5PSIxMy43IiByeD0iMC45IiByeT0iMS41Ii8+CgkJCQk8ZWxsaXBzZSBjbGFzcz0ic3QxNSIgY3g9IjMxLjkiIGN5PSIxMy45IiByeD0iMC40IiByeT0iMC43Ii8+CgkJCTwvZz4KCQkJPGc+CgkJCQk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMzEuNSwxNS43Yy0wLjksMC0xLjYtMS4xLTEuNi0yLjRjMC0xLjMsMC43LTIuNCwxLjYtMi40UzMzLDEyLDMzLDEzLjRDMzMsMTQuNywzMi4zLDE1LjcsMzEuNSwxNS43egoJCQkJCSBNMzEuNSwxMS4xYy0wLjgsMC0xLjUsMS0xLjUsMi4zYzAsMS4zLDAuNywyLjMsMS41LDIuM3MxLjUtMSwxLjUtMi4zQzMyLjksMTIuMSwzMi4zLDExLjEsMzEuNSwxMS4xeiIvPgoJCQk8L2c+CgkJPC9nPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=`


/**
 * 控制卡卡设备的链接和设备控制的类
 */
class PiCarX {
  constructor(runtime, extensionId) {
    /**
     * Scratch 3.0 的运行环境
     * @type {Runtime}
     * @private
     */
    this._runtime = runtime;
    // 项目停止时，停止所有设备
    this._runtime.on('PROJECT_STOP_ALL', this.stopAll.bind(this));

    /**
     * 扩展的ID
     */
    this._extensionId = extensionId;

    /**
     * webSocket链接的实例
     * @type {WS}
     * @private
     */
    this._ws = null;
    // WS.onSend = this.onSend;
    WS.onReceived = this.onReceived;
    this._runtime.registerPeripheralExtension(extensionId, this);

    this.onReceive = this.onReceive.bind(this);
    this.stopAll = this.stopAll.bind(this);
    this.speed = 80;
    this.sendBuffer = {};
    this.receiveBuffer = {};
    this.brightness = 80;
    this.ai_think_result = "";
    this.ai_listen_result = "";
  }

  dataConverter() {
    // 获取 sendBuffer 数据
    const sendBuffer = this.sendBuffer;
    this.sendBuffer = {};
    return sendBuffer;
  }

  onReceive(data) {
    // console.log("receiveBuffer:", data.grayscale_value);
    const mapping = {
      ultrasonic_distance: "distance",
      grayscale_data_raw: "grayscale3Channel",  //原始灰度值
      grayscale_data: "grayscale3ChannelData",  //已校准的灰度值
      grayscale_cliff_threshold: "grayscale3ChannelThreshold", //灰度悬崖阈值
      grayscale_calibration: "grayscale3ChannelCalibration",
      grayscale_status: "grayscale3ChannelStatus",
      grayscale_calibration_data: "grayscale3ChannelCalibrateData",
      line_position: "linePosition",
      is_on_line: "isOnLine",
      is_on_cliff: "isOnCliff",
      battery_voltage: "batteryVoltage",
      color_detection: "colorRecognition",
      face_detection: "faceRecognition",
      traffic_sign_detection: "trafficRecognition",
      qr_code_detection: "QRCodeRecognition",
      sound_status: "soundPlayStatus",
      music_status: "soundPlayBackgroundStatus",
      music_length: "musicDuration",
      action_status: "actionStatus",
      music_position: "musicProgress",
      steering_offset: "steeringCalibration",
      camera_pan_offset: "cameraCalibrationX",
      camera_tilt_offset: "cameraCalibrationY",
      motor_reverse: "motorCalibration",
      ai_listen_result: "listening",
      ai_think_result: "thinking",
      ai_status: "aiState",
      alert: "errorMessage",
      user_button_pressed: "usrButtonPressed",
      reset_button_pressed: "rstButtonPressed",
      piper_saying: "piperSaying",
      piper_model: "piperModel",
      steering_angle: "steeringAngle",
      camera_pan_angle: "cameraPanAngle",
      camera_tilt_angle: "cameraTiltAngle",
      volume: "volume",
      vosk_listen_result: "voskListening",
      // vosk_status: "voskStatus",
      // vosk_language: "voskLanguage",
      vosk_listening: "isVoskListening",
      vosk_language_setting: "voskLanguage",
    };
    let receiveBuffer = {};
    // 遍历映射关系
    for (const [key, alias] of Object.entries(mapping)) {
      if (key in data) {
        if (key === "battery_voltage" || key === "camera_pan_offset" || key === "camera_tilt_offset" || key === "steering_offset") {
          receiveBuffer[alias] = parseFloat(data[key]).toFixed(1);
        } else {
          receiveBuffer[alias] = data[key];
        }
      }
    };
    if (data.ai_think_result && data.ai_think_result !== "") {
      this.ai_think_result = data.ai_think_result;
    } else {
      receiveBuffer.thinking = this.ai_think_result;
    }

    if (data.ai_listen_result && data.ai_listen_result !== "") {
      this.ai_listen_result = data.ai_listen_result;
    } else {
      receiveBuffer.listening = this.ai_listen_result;
    }
    if (data.ultrasonic_distance > 450) {
      receiveBuffer.distance = 450;
    } else if (data.ultrasonic_distance < 2) {
      receiveBuffer.distance = 2;
    }
    this.receiveBuffer = receiveBuffer;
    // console.log("grayscale3Channel:", grayscale3Channel)
    if (receiveBuffer.errorMessage) {
      // console.log("receiveBuffer.errorMessage:", receiveBuffer.errorMessage)
      let alertData = {
        alertId: "alert",  // alertId 自定义
        alertType: "STANDARD",
        closeButton: false,
        // iconSpinner: false,
        // iconURI: successImage,
        level: receiveBuffer.errorMessage[0],  //success, warn, info
        // showDownload: false,
        // showSaveNow: false,
        content: receiveBuffer.errorMessage[1],
        maxDisplaySecs: 5,
      };
      this.handleAiError(alertData);
    }
  }

  // 发送数据，webSocket发送数据都需要经过这个函数，否则保持上一次的值
  sendDataWS() {
    if (this._ws) {
      let data = this.dataConverter();
      this._ws.setSendPayload(data);
    }
  }


  // 电机控制
  motorControl(direction, speed) {
    if (speed === undefined) speed = this.speed;
    else speed = MathUtil.clamp(Math.abs(speed), 0, 100);
    if (direction === "forward") {
      speed = speed;
    } else {
      speed = -speed;
    }
    // let speedlist = [speed, speed];
    let speedlist = speed;
    this.sendBuffer["motor"] = speedlist;
    this.sendDataWS();
  }

  updateServoAngle(type, angle) {
    // if (!["servoAngle", "cameraAngleX", "cameraAngleY"].includes(type)) {
    //   console.warn(`Invalid servo type: ${type}`);
    //   return;
    // }
    if (type === "camera_tilt" || type === "steering") {
      this.sendBuffer[type] = MathUtil.clamp(angle, -30, 30);
    } else {
      this.sendBuffer[type] = MathUtil.clamp(angle, -90, 90);
    }
    this.sendDataWS();
  }

  // 通用开关函数
  updateSendBuffer(key, data) {
    if (!this.isConnected) return;
    this.sendBuffer[key] = data;
    this.sendDataWS();
  }


  // 停止移动
  stopMotor() {
    // console.log(this.receiveBuffer)
    // 移动
    const speedlist = 0;
    this.sendBuffer["motor"] = speedlist;
    this.sendDataWS();
  }

  // 

  /**
   * 获取设备的名称
   * @return {string} 设备名称.
   */
  getPeripheralName() {
    if (!this._ws) return '';
    return this._ws.getPeripheralName();
  }

  /**
   * 给设备重命名
   * @param {string} name 设备的新名称
   */
  rename(name) {
    let data = { "name": name };
    let apSsid = { "apSsid": name };
    if (this._ws) {
      this._ws.setDeviceWifi(data);
      this._ws.setDeviceWifi(apSsid);
    }
  }

  /**
   * 给设备设置WiFi
   * @param {obj} data wifi名称和密码
   */
  settingWifi(extensionId, data) {
    if (this._ws) {
      this._ws.setDeviceWifi(data);
    }
  }

  /**
   * 控制是否发送数据到设备
   * @param {obj} state 是否发送数据到设备
   */
  setSendDataState(extensionId, state) {
    if (this._ws) {
      this._ws.setSendDataState(state);
    }
  }

  // 设置发送的数据
  setSendData(extensionId, type, data) {
    // if (this._ws) {
    this.sendBuffer[type] = data;
    console.log(this.sendBuffer)
    this.sendDataWS();
  }


  /**
   * 获取设备连接的WiFi信息
   * @param {obj} data wifi名称
   */
  getDevicesWifiInfo() {
    let info = null;
    if (this._ws) {
      info = this._ws.getDeviceWifiIp();
    }
    return info;
  }

  /**
   * 关闭所有设备
   */
  stopAll() {
    console.log("stopAll")
    if (!this.isConnected()) return;
    // 移动
    const speedlist = 0;
    this.sendBuffer["motor"] = speedlist;
    // 摄像头和音乐关闭
    this._runtime.ioDevices.mjpg.stop();
    this.sendBuffer["camera-enable"] = 0;
    this.sendBuffer["color_detection"] = 0;
    this.sendBuffer["face_detection"] = 0;
    this.sendBuffer["traffic_sign_detection"] = 0;
    this.sendBuffer["qr_code_detection"] = 0;
    this.sendBuffer["music_control"] = 0;
    this.sendBuffer["led"] = 0;
    this.sendBuffer["ai_think"] = "[STOP]";
    this.sendBuffer["ai_think_with_image"] = "[STOP]";
    this.sendBuffer["ai_say"] = "[STOP]";
    this.sendBuffer["do_action"] = "[STOP]";
    this.sendBuffer["vosk_set_language"] = "[STOP]";
    this.sendDataWS();
  }

  /**
   * 扫描周围的设备
   */
  scan() {
    this._ws = new WS(this._runtime, this._extensionId, this.onReceive, DATA_SEND_INTERVAL);
  }

  /**
   * 连接设备
   * @param {number} ip 设备的ip
   */
  connect(ip) {
    if (this._ws) {
      // let ip = this.getDeviceInfo();
      // ip = `ws://${ip.ip}:30102`
      this._ws.connectToDevice(ip);
      console.log(this.sendBuffer)
      if (Object.keys(this.sendBuffer).length > 0) {
        this.sendDataWS();
      }
      this._ws.setClearAfterSend(true);
    }
  }
  // connect(ip) {
  //   if (this._ws) {
  //     ip = `ws://${ip}:30102`
  //     this._ws.connectToDevice(ip);
  //     console.log(this.sendBuffer)
  //     if (Object.keys(this.sendBuffer).length > 0) {
  //       this.sendDataWS();
  //     }
  //     this._ws.setClearAfterSend(true);
  //   }
  // }

  /**
   * 断开连接
   */
  disconnect() {
    if (this._ws) {
      this._ws.disconnect();
      this._ws.stopScanAndCloseSockets();
    }
  }

  /**
   * 获取设备的连接后的信息
   * @return {object} 
   */
  getDeviceInfo() {
    if (this._ws) {
      return this._ws.getDeviceInfo();
    }
  }

  /**
   * 获取webSocket 所有数据
   * @return {object}
   */
  getWebSocketData() {
    if (this._ws) {
      return this._ws.getWebSocketData();
    }
  }
  /**
   * 获取设备的连接状态
   * @return {boolean}
   */
  isConnected() {
    let connected = false;
    if (this._ws) {
      connected = this._ws.isConnected();
    }
    return connected;
  }
  /**
    * 获取 receiveBuffer 所有数据
     * @return {object}
     */
  getReceiveBuffer() {
    if (this._ws) {
      return this.receiveBuffer;
    } else {
      return null;
    }
  }

  /**
    * 设置 receiveBuffer 数据
     * @return {object}
     */
  setReceiveBuffer(key, data) {
    this.receiveBuffer[key] = data;
    this.ai_think_result = "";
    this.ai_listen_result = "";
  }
  // clearAIData() {
  //   this.ai_think_result = "";
  //   this.ai_listen_result = "";
  // }

  // 转换坐标
  transformCoordinates(imageData, x, y) {
    const originWidth = imageData[0];
    const originHeight = imageData[1];
    const targetWidth = 480;
    const targetHeight = 360;

    // 平移坐标，使中心为原点
    const centeredX = x - originWidth / 2;
    const centeredY = y - originHeight / 2;

    //  缩放
    const scaleX = targetWidth / originWidth;
    const scaleY = targetHeight / originHeight;

    // Y轴翻转
    const displayX = centeredX * scaleX;
    const displayY = -centeredY * scaleY;

    return [displayX, displayY];
  }


  /**
   * 发送数据
   * @param {number} uuid 需要发送到的服务UUID
   * @param {Array} message 需要发送的数据
   * @param {boolean} [useLimiter=true] 是否使用限制器，默认使用
   * @return {Promise} 发送数据的Promise
   */
  send() {
    console.log('send======', this.sendBuffer)
  }

  get receiveData() {
    return this.receiveBuffer;
  }

  /**
  *  
  * 详情请看 C:\Users\new\Desktop\workspace\mc\scratch-gui\src\reducers\alerts.js
    let alertData = {
    alertId: "aiError",  // alertId 自定义
    alertType: "STANDARD",
    closeButton: false,
    iconSpinner: false,
    iconURI: successImage, 图片无法显示，可能是地址问题
    level: "success",  //success, warn, info
    showDownload: false,
    showSaveNow: false,
    content: "初始化成功",
    maxDisplaySecs: 5,
    };
  */
  handleAiError(alertData) {
    this._runtime.emit(this._runtime.constructor.BLOCKALERT, alertData);
  }
}

/**
 * Scratch 3.0 blocks to interact with a Mammoth PiCarX peripheral.
 */
class PiCarXBlocks {

  /**
   * @return {string} - the ID of this extension.
   */
  static get EXTENSION_ID() {
    return 'piCarX';
  }

  /**
   * Construct a set of PiCarX blocks.
   * @param {Runtime} runtime - the Scratch 3.0 runtime.
   */
  constructor(runtime) {
    /**
     * The Scratch 3.0 runtime.
     * @type {Runtime}
     */
    this.runtime = runtime;

    // Create a new PiCarX peripheral instance
    this._peripheral = new PiCarX(this.runtime,
      PiCarXBlocks.EXTENSION_ID);

    // 是否第一次加载
    this.firstInstall = true;
    this.languages = {
      "auto": "auto",
      "Afrikaans": "af",
      "Arabic": "ar",
      "Armenian": "hy",
      "Azerbaijani": "az",
      "Belarusian": "be",
      "Bosnian": "bs",
      "Bulgarian": "bg",
      "Catalan": "ca",
      "Chinese": "zh",
      "Croatian": "hr",
      "Czech": "cs",
      "Danish": "da",
      "Dutch": "nl",
      "English": "en",
      "Estonian": "et",
      "Finnish": "fi",
      "French": "fr",
      "Galician": "gl",
      "German": "de",
      "Greek": "el",
      "Hebrew": "he",
      "Hindi": "hi",
      "Hungarian": "hu",
      "Icelandic": "is",
      "Indonesian": "id",
      "Italian": "it",
      "Japanese": "ja",
      "Kannada": "kn",
      "Kazakh": "kk",
      "Korean": "ko",
      "Latvian": "lv",
      "Lithuanian": "lt",
      "Macedonian": "mk",
      "Malay": "ms",
      "Marathi": "mr",
      "Maori": "mi",
      "Nepali": "ne",
      "Norwegian": "no",
      "Persian": "fa",
      "Polish": "pl",
      "Portuguese": "pt",
      "Romanian": "ro",
      "Russian": "ru",
      "Serbian": "sr",
      "Slovak": "sk",
      "Slovenian": "sl",
      "Spanish": "es",
      "Swahili": "sw",
      "Swedish": "sv",
      "Tagalog": "tl",
      "Tamil": "ta",
      "Thai": "th",
      "Turkish": "tr",
      "Ukrainian": "uk",
      "Urdu": "ur",
      "Vietnamese": "vi",
      "Welsh": "cy"
    };
    this.vosk_language = {
      "العربية": "ar",
      "العربية (تونس)": "ar-tn",
      "Català": "ca",
      "中文": "cn",
      "Čeština": "cs",
      "Deutsch": "de",
      "English (UK)": "en-gb",
      "English (India)": "en-in",
      "English (US)": "en-us",
      "Esperanto": "eo",
      "Español": "es",
      "فارسی": "fa",
      "Français": "fr",
      "ગુજરાતી": "gu",
      "हिन्दी": "hi",
      "Italiano": "it",
      "日本語": "ja",
      "한국어": "ko",
      "Қазақша": "kz",
      "Nederlands": "nl",
      "Polski": "pl",
      "Português": "pt",
      "Русский": "ru",
      "Svenska": "sv",
      "తెలుగు": "te",
      "Тоҷикӣ": "tg",
      "Türkçe": "tr",
      "Українська": "ua",
      "Oʻzbekcha": "uz",
      "Tiếng Việt": "vn"
    }
    this.doAction = ["shake head", "nod", "wave hands", "resist", "act cute", "rub hands", "think", "twist body", "celebrate", "depressed"];
    // 说的国家模型

  }

  // 保存透明度
  get globalVideoTransparency() {
    const stage = this.runtime.getTargetForStage();
    if (stage) {
      return stage.videoTransparency;
    }
    return 0;
  }

  set globalVideoState(state) {
    const stage = this.runtime.getTargetForStage();
    if (stage) {
      stage.videoState = state;
    }
    return state;
  }
  // 视频更新
  updateVideoDisplay() {
    this.setVideoTransparency({
      TRANSPARENCY: this.globalVideoTransparency
    });
  }

  /**
   * @returns {object} metadata for this extension and its blocks.
   */
  getInfo() {
    if (this.firstInstall) {
      this.globalVideoState = 'on';
      this.globalVideoTransparency = 0;
      this.updateVideoDisplay();
      this.firstInstall = false;
    }
    return {
      id: PiCarXBlocks.EXTENSION_ID,
      name: 'PiCar-X',
      blockIconURI: iconURI,
      showStatusButton: true,
      blocks: [
        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.movement',
            default: "Movement",
            description: ''
          }),
        },
        // 前进秒
        {
          opcode: 'moveAtFor',
          text: formatMessage({
            id: 'piCarX.moveAtFor',
            default: '[DIRECTION] at [VALUE] % speed for [DURATION] secs',
            description: 'Move in the specified direction for a set number of seconds'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            DIRECTION: {
              type: ArgumentType.STRING,
              menu: 'directions',
              defaultValue: "forward"
            },
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 80
            },
            DURATION: {
              type: ArgumentType.NUMBER,
              defaultValue: 1
            }
          },
        },
        // 前进
        {
          opcode: 'moveAt',
          text: formatMessage({
            id: 'piCarX.moveAt',
            default: '[DIRECTION] at [VALUE] % speed',
            description: 'Move in the specified direction'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            DIRECTION: {
              type: ArgumentType.STRING,
              menu: 'directions',
              defaultValue: "forward"
            },
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 80
            },
          },
        },
        // stopMoving
        {
          opcode: 'stopMoving',
          text: formatMessage({
            id: 'piCarX.stopMoving',
            default: 'stop moving',
            description: 'stopMoving'
          }),
          blockType: BlockType.COMMAND,
        },
        // 设置预设动作
        {
          opcode: 'setPresetAction',
          text: formatMessage({
            id: 'piCarX.setPresetAction',
            default: 'perform [ACTION]',
            description: 'preset action.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ACTION: {
              type: ArgumentType.STRING,
              menu: 'aiAction',
            }
          }
        },
        // Setting the direction motor angle
        {
          opcode: 'settingDirectionAngle',
          text: formatMessage({
            id: 'piCarX.rudder.angle',
            default: 'set steering angle to [VALUE] °',
            description: 'Setting the direction angle'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 0
            },
          },
        },
        // 增加方向电机角度
        {
          opcode: 'addDirectionAngle',
          text: formatMessage({
            id: 'piCarX.rudder.add',
            default: 'change steering angle by [VALUE] °',
            description: 'add direction angle'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 10
            }
          }
        },

        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.cameraServos',
            default: "Camera Servos",
            description: ''
          }),
        },
        // Setting the camera direction motor angle X
        {
          opcode: 'settingcameraAngleX',
          text: formatMessage({
            id: 'piCarX.cameraRudder.angle.X',
            default: 'set camera pan angle to [VALUE] °',
            description: 'Setting the camera direction motor angle X'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 0
            },
          },
        },
        // Setting the camera direction motor angle Y
        {
          opcode: 'settingcameraAngleY',
          text: formatMessage({
            id: 'piCarX.cameraRudder.angle.Y',
            default: 'set camera tilt angle to [VALUE] °',
            description: 'Setting the camera direction motor angle Y'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 0
            },
          },
        },
        // 摄像头平移角度增加
        {
          opcode: 'addcameraAngleX',
          text: formatMessage({
            id: 'piCarX.cameraRudder.add.X',
            default: 'change camera pan angle by [VALUE] °',
            description: 'add camera pan angle'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 10
            },
          },
        },
        // 摄像头倾斜角度增加
        {
          opcode: 'addcameraAngleY',
          text: formatMessage({
            id: 'piCarX.cameraRudder.add.Y',
            default: 'change camera tilt angle by [VALUE] °',
            description: 'add camera pan angle'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 10
            },
          },
        },

        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.sensors',
            default: "Sensors",
            description: ''
          }),
        },
        // Wait for the ultrasonic distance to reach
        {
          opcode: 'whenDistance',
          text: formatMessage({
            id: 'piCarX.settingUltrasonic.distance',
            default: 'when distance [OP] [LEVEL] cm',
            description: 'When the ultrasonic distance is less than, greater than, or equal to a specific value'
          }),
          blockType: BlockType.HAT,
          arguments: {
            OP: {
              type: ArgumentType.STRING,
              menu: 'distanceOps',
              defaultValue: '<'
            },
            LEVEL: {
              type: ArgumentType.NUMBER,
              defaultValue: 15
            },
          },
        },
        // Waiting for ultrasonic distance comparison
        {
          opcode: 'waitUtilDistance',
          text: formatMessage({
            id: 'piCarX.settingUltrasonic.wait',
            default: 'wait until distance [OP] [LEVEL] cm',
            description: 'play a certain note for miliseconds'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            OP: {
              type: ArgumentType.STRING,
              menu: 'distanceOps',
              defaultValue: '>'
            },
            LEVEL: {
              type: ArgumentType.NUMBER,
              defaultValue: 15
            },
          },
        },
        // Compare ultrasonic distance
        {
          opcode: 'isDistance',
          text: formatMessage({
            id: 'piCarX.settingUltrasonic.dimension',
            default: 'distance [OP] [LEVEL] cm ?',
            description: 'If the distance is greater than or less than a specific value'
          }),
          blockType: BlockType.BOOLEAN,
          arguments: {
            OP: {
              type: ArgumentType.STRING,
              menu: 'distanceOps',
              defaultValue: '<'
            },
            LEVEL: {
              type: ArgumentType.NUMBER,
              defaultValue: 15
            },
          },
        },
        // distance
        {
          opcode: 'distance',
          text: formatMessage({
            id: 'piCarX.settingUltrasonic.sum',
            default: 'distance in cm',
            description: 'distance in cm'
          }),
          blockType: BlockType.REPORTER,
        },
        // 3路灰度模块值
        {
          opcode: 'grayData',
          text: formatMessage({
            id: 'piCarX.grayData',
            default: 'gray data [DATAPOSITION]',
            description: 'gray data'
          }),
          blockType: BlockType.REPORTER,
          arguments: {
            DATAPOSITION: {
              type: ArgumentType.STRING,
              menu: 'dataPosition',
              defaultValue: "0"
            }
          }
        },
        // 线路位置
        {
          opcode: 'linePosition',
          text: formatMessage({
            id: 'piCarX.linePosition',
            default: 'line position',
            description: 'line position'
          }),
          blockType: BlockType.REPORTER,
        },
        // 是否在线上
        {
          opcode: 'isOnLine',
          text: formatMessage({
            id: 'piCarX.isOnLine',
            default: 'on line?',
            description: 'line isOnLine'
          }),
          blockType: BlockType.BOOLEAN,
        },
        // 是否是悬崖
        {
          opcode: 'isOnCliff',
          text: formatMessage({
            id: 'piCarX.isOnCliff',
            default: 'on cliff?',
            description: 'line isOnCliff'
          }),
          blockType: BlockType.BOOLEAN,
        },

        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.camera',
            default: "Camera",
            description: ''
          }),
        },
        // Turn on the camera.
        {
          opcode: 'videoToggle',
          text: formatMessage({
            id: 'piCarX.videoToggle',
            default: 'turn camera [ONOFF]',
            description: 'Turn on the camera.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ONOFF: {
              type: ArgumentType.STRING,
              menu: 'onOff',
              defaultValue: "1"
            }
          }
        },
        // 设置摄像头画面
        {
          opcode: 'setRotation',
          text: formatMessage({
            id: 'piCarX.setRotation',
            default: 'set orientation to [ROTATION]',
            description: 'set orientation.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ROTATION: {
              type: ArgumentType.STRING,
              menu: 'rotations',
              default: 'normal'
            }
          }
        },
        // 设置画面透明度
        {
          opcode: 'setVideoTransparency',
          text: formatMessage({
            id: 'piCarX.setVideoTransparency',
            default: 'set video opacity to [TRANSPARENCY] %',
            description: 'Controls transparency of the video preview layer'
          }),
          arguments: {
            TRANSPARENCY: {
              type: ArgumentType.NUMBER,
              defaultValue: 100
            }
          }
        },
        // Camera Color Recognition
        {
          opcode: 'cameraColorRecognition',
          text: formatMessage({
            id: 'piCarX.cameraColorRecognition',
            default: 'set color recognition to [COLORLIST]',
            description: 'Camera Color Recognition.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            COLORLIST: {
              type: ArgumentType.STRING,
              menu: 'color',
              defaultValue: "0"
            }
          }
        },
        //  摄像头颜色识别数据
        {
          opcode: 'cameraColorData',
          text: formatMessage({
            id: 'piCarX.cameraColorData',
            default: 'get color [COLORID]',
            description: 'camera color'
          }),
          blockType: BlockType.REPORTER,
          arguments: {
            COLORID: {
              type: ArgumentType.STRING,
              menu: 'colorID',
              defaultValue: "0"
            }
          }
        },
        // camera Traffic Signs Recognition
        {
          opcode: 'cameraTrafficSignsRecognition',
          text: formatMessage({
            id: 'piCarX.cameraTrafficSignsRecognition',
            default: 'set traffic recognition to [ONOFF]',
            description: 'camera Traffic Signs Recognition.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ONOFF: {
              type: ArgumentType.STRING,
              menu: 'onOff',
              defaultValue: "0"
            }
          }
        },
        // 摄像头交通标志识别数据
        {
          opcode: 'cameraTrafficData',
          text: formatMessage({
            id: 'piCarX.cameraTrafficData',
            default: 'get traffic sign [TRAFFICID]',
            description: 'traffic data'
          }),
          blockType: BlockType.REPORTER,
          arguments: {
            TRAFFICID: {
              type: ArgumentType.STRING,
              menu: 'trafficID',
              defaultValue: "0"
            }
          }
        },

        // camera QR Code Recognition
        {
          opcode: 'cameraQRCodeRecognition',
          text: formatMessage({
            id: 'piCarX.cameraQRCodeRecognition',
            default: 'set QR code recognition to [ONOFF]',
            description: 'camera QR Code Recognition.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ONOFF: {
              type: ArgumentType.STRING,
              menu: 'onOff',
              defaultValue: "0"
            }
          }
        },
        // 摄像头二维码识别数据
        {
          opcode: 'cameraQRCodeData',
          text: formatMessage({
            id: 'piCarX.cameraQRCodeData',
            default: 'get QR code [QRID]',
            description: 'QR data'
          }),
          blockType: BlockType.REPORTER,
          arguments: {
            QRID: {
              type: ArgumentType.STRING,
              menu: 'qrID',
              defaultValue: "0"
            }
          }
        },
        // camera face recognition
        {
          opcode: 'cameraFaceRecognition',
          text: formatMessage({
            id: 'piCarX.cameraFaceRecognition',
            default: 'set face detection to [ONOFF]',
            description: 'Camera Face Recognition.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ONOFF: {
              type: ArgumentType.STRING,
              menu: 'onOff',
              defaultValue: "0"
            }
          }
        },
        // 摄像头人脸识别数据
        {
          opcode: 'cameraFaceData',
          text: formatMessage({
            id: 'piCarX.cameraFaceData',
            default: 'get face [COLORID]',
            description: 'camera face'
          }),
          blockType: BlockType.REPORTER,
          arguments: {
            COLORID: {
              type: ArgumentType.STRING,
              menu: 'colorID',
              defaultValue: "0"
            }
          }
        },

        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.speaker',
            default: "Speaker",
            description: ''
          }),
        },


        // 前台音效
        {
          opcode: 'frontSoundList',
          text: formatMessage({
            id: 'piCarX.frontSoundList',
            default: 'play sound [FRONTSOUND]',
            description: 'frontSound.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            FRONTSOUND: {
              type: ArgumentType.STRING,
              menu: 'frontSound',
              defaultValue: "0"
            }
          }
        },
        // 背景音乐播放
        {
          opcode: 'backSoundList',
          text: formatMessage({
            id: 'piCarX.backSoundList',
            default: 'play background music [BACKSOUND]',
            description: 'backSoundList.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            BACKSOUND: {
              type: ArgumentType.STRING,
              menu: 'backSound',
              defaultValue: "0"
            }
          }
        },

        // 后台音效播放控制
        {
          opcode: 'backSoundPlayControl',
          text: formatMessage({
            id: 'piCarX.backSoundPlayControl',
            default: 'backSound music [SOUNDPLAYCONTROL]',
            description: 'backSoundPlay.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            SOUNDPLAYCONTROL: {
              type: ArgumentType.STRING,
              menu: 'soundPlayControl',
              defaultValue: "0"
            }
          }
        },


        // 增加音量
        {
          opcode: 'addBackSoundVolume',
          text: formatMessage({
            id: 'piCarX.addBackSoundVolume',
            default: 'change volume by [VALUE] %',
            description: 'addBackSoundVolume.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 90
            },
          },
        },
        // 后台音量
        {
          opcode: 'backSoundVolume',
          text: formatMessage({
            id: 'piCarX.backSoundVolume',
            default: 'set volume to [VALUE] %',
            description: 'backSoundVolume.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 90
            },
          },
        },

        // 本地语言模型
        // {
        //   opcode: 'piperModels',
        //   text: formatMessage({
        //     id: 'piCarX.piperModels',
        //     default: 'set voice model to [MODEL]',
        //     description: 'piperModels'
        //   }),
        //   arguments: {
        //     MODEL: {
        //       type: ArgumentType.STRING,
        //       menu: "piperModels"
        //     },
        //   }
        // },

        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.aiAssistant',
            default: "AI Assistant",
            description: ''
          }),
        },


        // AIAssistantID
        // {
        //   opcode: 'AIAssistantID',
        //   text: formatMessage({
        //     id: 'piCarX.AIAssistantID',
        //     default: 'AI assistant ID [VALUE]',
        //     description: 'AIAssistantID.'
        //   }),
        //   blockType: BlockType.COMMAND,
        //   arguments: {
        //     VALUE: {
        //       type: ArgumentType.STRING,
        //       defaultValue: " "
        //     },
        //   },
        // },
        // // AI 初始化
        // {
        //   opcode: 'aiInit',
        //   text: formatMessage({
        //     id: 'piCarX.aiInit',
        //     default: 'initialize AI assistant',
        //     description: 'aiInit'
        //   }),
        //   blockType: BlockType.COMMAND,
        // },
        // 听并等待
        // {
        //   opcode: 'listenAndWait',
        //   text: formatMessage({
        //     id: 'piCarX.listenAndWait',
        //     default: 'listen and wait',
        //     description: 'listenAndWait'
        //   }),
        //   blockType: BlockType.COMMAND,
        // },
        // 听并等待
        {
          opcode: 'voskListenWait',
          text: formatMessage({
            id: 'piCarX.listenAndWait',
            default: 'listen and wait',
            description: 'listenAndWait'
          }),
          blockType: BlockType.COMMAND,
        },
        // 思考内容
        {
          opcode: 'reflections',
          text: formatMessage({
            id: 'piCarX.reflections',
            default: 'ask AI [THINK] with [THINKING]',
            description: 'reflections'
          }),
          arguments: {
            THINKING: {
              type: ArgumentType.STRING,
              menu: 'thinking',
              defaultValue: "0"
            },
            THINK: {
              type: ArgumentType.STRING,
              defaultValue: " "
            }
          }
        },
        // AI的状态
        // {
        //   opcode: 'aiState',
        //   text: formatMessage({
        //     id: 'piCarX.aiState',
        //     default: 'AI state',
        //     description: 'aiState'
        //   }),
        //   blockType: BlockType.REPORTER,
        // },
        // AI说
        {
          opcode: 'say',
          text: formatMessage({
            id: 'piCarX.say',
            default: 'say [SAY]',
            description: 'say'
          }),
          arguments: {
            SAY: {
              type: ArgumentType.STRING,
              defaultValue: " "
            }
          }
        },
        // AI声音模型
        {
          opcode: 'setVoiceModel',
          text: formatMessage({
            id: 'piCarX.setVoiceModel',
            default: 'set voice model to [VOICE]',
            description: 'voice model.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VOICE: {
              type: ArgumentType.STRING,
              menu: 'aiVoice',
            }
          }
        },
        // 输入语言
        // {
        //   opcode: 'setInputLanguage',
        //   text: formatMessage({
        //     id: 'piCarX.setInputLanguage',
        //     default: 'set listen language to [LANGUAGE]',
        //     description: 'input language.'
        //   }),
        //   blockType: BlockType.COMMAND,
        //   arguments: {
        //     LANGUAGE: {
        //       type: ArgumentType.STRING,
        //       menu: 'aiSayLanguage',
        //     }
        //   }
        // },

        // 最近听到的语句
        // {
        //   opcode: 'lastHeard',
        //   text: formatMessage({
        //     id: 'piCarX.lastHeard',
        //     default: 'last heard phrase',
        //     description: 'lastHeard'
        //   }),
        //   blockType: BlockType.REPORTER,
        // },

        {
          opcode: 'setVoskLanguage',
          text: formatMessage({
            id: 'piCarX.setInputLanguage',
            default: 'set listen language to [LANGUAGE]',
            description: 'input language.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            LANGUAGE: {
              type: ArgumentType.STRING,
              menu: 'aiVoskSayLanguage',
              defaultValue: "English (US)"
            }
          },
        },
        {
          opcode: 'voskListenResult',
          text: formatMessage({
            id: 'piCarX.lastHeard',
            default: 'last heard phrase',
            description: 'lastHeard'
          }),
          blockType: BlockType.REPORTER,
        },
        // AI 回答
        {
          opcode: 'aiAnswer',
          text: formatMessage({
            id: 'piCarX.aiAnswer',
            default: 'AI answer',
            description: 'aiAnswer'
          }),
          blockType: BlockType.REPORTER,
        },

        {
          opcode: 'dummyFunction',
          blockType: 'label',
          text: formatMessage({
            id: 'piCarX.others',
            default: "Others",
            description: ''
          }),
        },

        // battery
        {
          opcode: 'battery',
          text: formatMessage({
            id: 'piCarX.battery',
            default: 'battery level',
            description: 'battery level'
          }),
          blockType: BlockType.REPORTER,
        },

        // 等待按钮按下
        // {
        //   opcode: 'waitButtonPress',
        //   text: formatMessage({
        //     id: 'piCarX.waitButtonPress',
        //     default: 'wait until [BUTTON] button is pressed',
        //     description: 'wait for button press'
        //   }),
        //   blockType: BlockType.COMMAND,
        //   arguments: {
        //     BUTTON: {
        //       type: ArgumentType.STRING,
        //       menu: 'buttonPressed',
        //       defaultValue: "0"
        //     }
        //   }
        // },
        {
          opcode: 'waitButtonPress',
          text: formatMessage({
            id: 'piCarX.waitButtonPress',
            default: 'wait until USR button is pressed',
            description: 'wait for button press'
          }),
          blockType: BlockType.COMMAND,
        },

        // 当按钮按下
        // {
        //   opcode: 'whenButtonPress',
        //   text: formatMessage({
        //     id: 'piCarX.whenButtonPress',
        //     default: 'when [BUTTON] button is pressed',
        //     description: 'when button press'
        //   }),
        //   blockType: BlockType.HAT,
        //   arguments: {
        //     BUTTON: {
        //       type: ArgumentType.STRING,
        //       menu: 'buttonPressed',
        //       defaultValue: "0"
        //     }
        //   }
        // },
        {
          opcode: 'whenButtonPress',
          text: formatMessage({
            id: 'piCarX.whenButtonPress',
            default: 'when USR button is pressed',
            description: 'when button press'
          }),
          blockType: BlockType.HAT,
        },

        // 按钮按下
        // {
        //   opcode: 'isButtonPress',
        //   text: formatMessage({
        //     id: 'piCarX.isButtonPress',
        //     default: '[BUTTON] button is pressed?',
        //     description: 'is button press '
        //   }),
        //   blockType: BlockType.BOOLEAN,
        //   arguments: {
        //     BUTTON: {
        //       type: ArgumentType.STRING,
        //       menu: 'buttonPressed',
        //       defaultValue: "0"
        //     }
        //   }

        // },
        {
          opcode: 'isButtonPress',
          text: formatMessage({
            id: 'piCarX.isButtonPress',
            default: 'USR button is pressed?',
            description: 'is button press '
          }),
          blockType: BlockType.BOOLEAN,
        },

        // 控制Led
        {
          opcode: 'setLedSwitch',
          text: formatMessage({
            id: 'piCarX.setLedSwitch',
            default: 'turn robot HAT LED [ONOFF]',
            description: 'set led'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ONOFF: {
              type: ArgumentType.STRING,
              menu: 'onOff',
              defaultValue: "0"
            }
          }
        },
      ],
      menus: {
        distanceOps: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.soundLevelOps.gt',
                default: '>',
                description: 'greater than'
              }),
              value: '>'
            },
            {
              text: formatMessage({
                id: 'piCarX.soundLevelOps.lt',
                default: '<',
                description: 'Distance less than'
              }),
              value: '<'
            },
          ]
        },
        directions: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.directions.forward',
                default: 'forward',
                description: 'forward'
              }),
              value: "forward"
            },
            {
              text: formatMessage({
                id: 'piCarX.directions.backward',
                default: 'backward',
                description: 'backward'
              }),
              value: "backward"
            },
          ]
        },
        onOff: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.onOff.on',
                default: 'ON',
                description: 'Logic on off, on'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.onOff.off',
                default: 'OFF',
                description: 'Logic on off, off'
              }), value: "0"
            },
          ]
        },
        infraredObstacleAvoidance: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.avoidanceDirection.left',
                default: 'left',
                description: 'left'
              }),
              value: 'left'
            },
            {
              text: formatMessage({
                id: 'piCarX.avoidanceDirection.right',
                default: 'right',
                description: 'right'
              }),
              value: 'right'
            },
          ]
        },
        isNot: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.isNot.is',
                default: 'is',
                description: 'is'
              }),
              value: 'is'
            },
            {
              text: formatMessage({
                id: 'piCarX.isNot.no',
                default: 'is not',
                description: 'is not'
              }),
              value: 'is not'
            },
          ]
        },
        rotations: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.rotations.normal',
                default: 'normal',
                description: 'rotation normal'
              }), value: "normal"
            },
            {
              text: formatMessage({
                id: 'piCarX.rotations.inverted',
                default: 'inverted',
                description: 'rotation inverted'
              }), value: "inverted"
            },
          ]
        },
        frontSound: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.frontSound.one',
                default: 'horn1',
                description: 'frontSoundList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.frontSound.tow',
                default: 'start engine',
                description: 'frontSoundList'
              }), value: "1"
            },
          ]
        },
        soundPlayControl: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.soundPlay.play',
                default: 'play',
                description: 'soundPlay'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.soundPlay.pause',
                default: 'pause',
                description: 'soundPause'
              }), value: "2"
            },
            {
              text: formatMessage({
                id: 'piCarX.soundPlay.stop',
                default: 'stop',
                description: 'soundStop'
              }), value: "0"
            },
          ]
        },
        backSound: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.backSound.one',
                default: 'spry',
                description: 'backSoundList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.backSound.tow',
                default: 'peace',
                description: 'backSoundList'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.backSound.three',
                default: 'slow trail',
                description: 'backSoundList'
              }), value: "2"
            },

          ]
        },
        color: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.color.off',
                default: 'off',
                description: 'colorList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.color.red',
                default: 'red',
                description: 'colorList'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.color.orange',
                default: 'orange',
                description: 'colorList'
              }), value: "2"
            },
            {
              text: formatMessage({
                id: 'piCarX.color.yellow',
                default: 'yellow',
                description: 'colorList'
              }), value: "3"
            },
            {
              text: formatMessage({
                id: 'piCarX.color.green',
                default: 'green',
                description: 'colorList'
              }), value: "4"
            },
            {
              text: formatMessage({
                id: 'piCarX.color.blue',
                default: 'blue',
                description: 'colorList'
              }), value: "5"
            },
            {
              text: formatMessage({
                id: 'piCarX.color.purple',
                default: 'purple',
                description: 'colorList'
              }), value: "6"
            },

          ]
        },
        colorID: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.colorID.numbuer',
                default: 'number',
                description: 'colorIDList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.X',
                default: 'X',
                description: 'colorIDList'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.Y',
                default: 'Y',
                description: 'colorIDList'
              }), value: "2"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.width',
                default: 'width',
                description: 'colorIDList'
              }), value: "3"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.height',
                default: 'height',
                description: 'colorIDList'
              }), value: "4"
            }
          ]
        },
        trafficID: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.colorID.sign',
                default: 'sign',
                description: 'colorIDList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.X',
                default: 'X',
                description: 'colorIDList'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.Y',
                default: 'Y',
                description: 'colorIDList'
              }), value: "2"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.width',
                default: 'width',
                description: 'colorIDList'
              }), value: "3"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.height',
                default: 'height',
                description: 'colorIDList'
              }), value: "4"
            }
          ]
        },
        qrID: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.colorID.text',
                default: 'text',
                description: 'colorIDList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.X',
                default: 'X',
                description: 'colorIDList'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.Y',
                default: 'Y',
                description: 'colorIDList'
              }), value: "2"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.width',
                default: 'width',
                description: 'colorIDList'
              }), value: "3"
            },
            {
              text: formatMessage({
                id: 'piCarX.colorID.height',
                default: 'height',
                description: 'colorIDList'
              }), value: "4"
            }
          ]
        },
        dataPosition: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.directions.left',
                default: 'left',
                description: 'dataPositionList'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.directions.center',
                default: 'center',
                description: 'dataPositionList'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'piCarX.directions.right',
                default: 'right',
                description: 'dataPositionList'
              }), value: "2"
            }
          ]
        },
        thinking: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.thinking',
                default: 'thinking',
                description: 'frontSoundList'
              }),
              value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.imageThinking',
                default: 'imageThinking',
                description: 'frontSoundList'
              }), value: "1"
            },
          ]
        },
        aiVoice: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.aiAlloy',
                default: 'alloy',
                description: 'alloy'
              }), value: "alloy"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiAsh',
                default: 'ash',
                description: 'ash'
              }), value: "ash"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiCoral',
                default: 'coral',
                description: 'coral'
              }), value: "coral"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiEcho',
                default: 'echo',
                description: 'echo'
              }), value: "echo"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiFable',
                default: 'fable',
                description: 'fable'
              }), value: "fable"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiNova',
                default: 'nova',
                description: 'nova'
              }), value: "nova"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiOnyx',
                default: 'onyx',
                description: 'onyx'
              }), value: "onyx"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiSage',
                default: 'sage',
                description: 'sage'
              }), value: "sage"
            },
            {
              text: formatMessage({
                id: 'piCarX.aiShimmer',
                default: 'shimmer',
                description: 'shimmer'
              }), value: "shimmer"
            },
          ]
        },
        aiSayLanguage: {
          acceptReporters: true,
          // 58种语言
          items: Object.entries(this.languages).map(([name, code], index) => ({
            text: formatMessage({
              id: `piCarX.aiSayLanguage.${index}`,
              default: name,
              description: 'aiSayLanguage'
            }),
            value: code
          }))
        },
        aiVoskSayLanguage: {
          acceptReporters: true,
          // 58种语言
          items: Object.entries(this.vosk_language).map(([name, code], index) => ({
            text: formatMessage({
              id: `piCarX.aiVoskSayLanguage.${index}`,
              default: name,
              description: 'aiVoskSayLanguage'
            }),
            value: code
          }))
        },
        aiAction: {
          acceptReporters: true,
          items: this.doAction.map(name => ({
            text: formatMessage({
              id: `piCarX.aiAction.${name}`,
              default: name,
              description: 'aiAction'
            }),
            value: name
          }))
        },
        buttonPressed: {
          acceptReporters: true,
          items: [
            {
              text: formatMessage({
                id: 'piCarX.buttonPressed',
                default: 'USR',
                description: 'USR'
              }), value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.buttonReleased',
                default: 'RST',
                description: 'RST'
              }), value: "1"
            }
          ]
        },
        piperModels: {
          items: "getPiperModels"
        },
        sayNations: {
          items: Object.keys(PIPER_MODELS).map(key => ({
            text: formatMessage({
              id: `piCarX.aiAction.${key}`,
              default: key,
              description: 'aiAction'
            }),
            value: key
          }))
        },
      },
    };
  }

  getPiperModels() {
    let list = [];
    for (country in PIPER_MODELS) {
      let voices = PIPER_MODELS[country];
      for (voice in voices) {
        let sizes = voices[voice];
        for (size in sizes) {
          let model = sizes[size];
          list.push({
            text: `${country} - ${voice} - ${size}`,
            value: model
          })
        }
      }
    }
    return list;
  }

  moveAtFor(args) {
    let speed = Math.round(Cast.toNumber(args.VALUE));
    let time = Math.round(Cast.toNumber(args.DURATION));
    let direction = args.DIRECTION;
    this._peripheral.motorControl(direction, speed);
    return new Promise(resolve => {
      setTimeout(() => {
        this._peripheral.stopMotor();
        resolve();
      }, time * 1000);
    })
  }
  // 移动方向
  moveAt(args) {
    let speed = Math.round(Cast.toNumber(args.VALUE));
    let direction = args.DIRECTION;
    this._peripheral.motorControl(direction, speed);
    return Promise.resolve();
  }

  stopMoving() {
    console.log("stopMoving");
    this._peripheral.stopMotor();
    return Promise.resolve();
  }

  // 当距离判断
  whenDistance(args) {
    let distance = this._peripheral.receiveBuffer.distance;
    let level = Cast.toNumber(args.LEVEL);
    level = Number(level.toFixed(1));
    if (args.OP === ">") {
      return distance > level;
    } else {
      return distance < level;
    }
  }

  // 等待距离判断
  waitUtilDistance(args) {
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let level = Cast.toNumber(args.LEVEL);
        level = Math.round(level * 10) / 10;
        let distance = this._peripheral.receiveBuffer.distance;
        if (args.OP === ">") {
          if (distance > level) resolve();
        } else {
          if (distance < level) resolve();
        }
      }, 1);
    });
  }

  // 距离判断
  isDistance(args) {
    let distance = this._peripheral.receiveBuffer.distance
    const level = Cast.toNumber(args.LEVEL);
    if (args.OP === ">") {
      return distance > level;
    } else {
      return distance < level;
    }
  }

  // 距离
  distance() {
    let distance = this._peripheral.receiveBuffer.distance;
    return distance;
  }

  // 设置舵机角度
  settingDirectionAngle(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    this._peripheral.updateServoAngle("steering", angle);
    return Promise.resolve();
  }

  // 增加舵机角度
  addDirectionAngle(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    let steeringAngle = this._peripheral.receiveBuffer.steeringAngle;
    if (steeringAngle === undefined) return;
    steeringAngle += angle;
    this._peripheral.updateServoAngle("steering", steeringAngle);
    return Promise.resolve();
  }

  // 设置相机角度X轴
  settingcameraAngleX(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    this._peripheral.updateServoAngle("camera_pan", angle);
    return Promise.resolve();
  }

  // 设置相机角度Y轴
  settingcameraAngleY(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    this._peripheral.updateServoAngle("camera_tilt", angle);
    return Promise.resolve();
  }

  // 摄像头X轴增加
  addcameraAngleX(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    let cameraPanAngle = this._peripheral.receiveBuffer.cameraPanAngle;
    if (cameraPanAngle === undefined) return;
    cameraPanAngle += angle;
    this._peripheral.updateServoAngle("camera_pan", cameraPanAngle);
    return Promise.resolve();
  }

  // 摄像头Y轴增加
  addcameraAngleY(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    let cameraTiltAngle = this._peripheral.receiveBuffer.cameraTiltAngle;
    if (cameraTiltAngle === undefined) return;
    cameraTiltAngle += angle
    this._peripheral.updateServoAngle("camera_tilt", cameraTiltAngle);
    return Promise.resolve();
  }

  // 摄像头显示
  videoToggle(args) {
    const video = Cast.toNumber(args.ONOFF);
    this._peripheral.updateSendBuffer("camera-enable", video);
    if (video === 0) {
      this.runtime.ioDevices.mjpg.stop();
    } else {
      // let url = "http://192.168.4.1:9000/mjpg";
      let url = this._peripheral.getDeviceInfo();
      if (url && url.ip) {
        url = `http://${url.ip}:9000/mjpg`
        this.runtime.ioDevices.mjpg.start(url);
      }
    }
  }

  // 摄像头颜色识别开关
  cameraColorRecognition(args) {
    if (args.COLORLIST === undefined) return;
    let arr = ["关闭", "红色", "橙色", "黄色", "绿色", "蓝色", "紫色",]

    console.log("cameraColorRecognition", args.COLORLIST, arr[args.COLORLIST]);
    const color = Cast.toNumber(args.COLORLIST);
    this._peripheral.updateSendBuffer("color_detection", color);
    return Promise.resolve();
  }

  // 摄像头人脸识别开关
  cameraFaceRecognition(args) {
    const face = Cast.toNumber(args.ONOFF);
    this._peripheral.updateSendBuffer("face_detection", face);
    return Promise.resolve();
  }

  // 摄像头交通标志识别开关
  cameraTrafficSignsRecognition(args) {
    const trafficSigns = Cast.toNumber(args.ONOFF);
    this._peripheral.updateSendBuffer("traffic_sign_detection", trafficSigns);
    return Promise.resolve();
  }

  // 摄像头二维码识别开关
  cameraQRCodeRecognition(args) {
    const QRCode = Cast.toNumber(args.ONOFF);
    this._peripheral.updateSendBuffer("qr_code_detection", QRCode);
    return Promise.resolve();
  }

  // 前台音效
  frontSoundList(args) {
    const sound = Cast.toNumber(args.FRONTSOUND);
    console.log("sound", sound);
    this._peripheral.updateSendBuffer("play_sound", sound);
    // return Promise.resolve();
    return new Promise((resolve, reject) => {
      let hasStarted = false;
      setInterval(() => {
        let soundPlayStatus = this._peripheral.receiveData.soundPlayStatus;
        if (soundPlayStatus === 1) {
          hasStarted = true;
        };
        if (hasStarted && soundPlayStatus != 1) {
          resolve();
        }
      }, 1);
    });
  }

  // 后台音效
  backSoundList(args) {
    const sound = Cast.toNumber(args.BACKSOUND);
    console.log("sound", sound);
    this._peripheral.updateSendBuffer("play_music", sound);
    return Promise.resolve();
  }

  // 增加音效音量
  addBackSoundVolume(args) {
    let volume = Cast.toNumber(args.VALUE);
    let cameraPanAngle = this._peripheral.receiveBuffer.volume;
    if (cameraPanAngle === undefined) return;
    cameraPanAngle += volume;
    if (cameraPanAngle < 0) cameraPanAngle = 0;
    if (cameraPanAngle > 100) cameraPanAngle = 100;
    this._peripheral.updateSendBuffer("music_volume", cameraPanAngle);
  }

  // 后台音效播放控制
  backSoundPlayControl(args) {
    const control = Cast.toNumber(args.SOUNDPLAYCONTROL);
    console.log("control", control);
    this._peripheral.updateSendBuffer("music_control", control);
    return Promise.resolve();
  }

  // 后台音效音量
  backSoundVolume(args) {
    let volume = Cast.toNumber(args.VALUE);
    console.log("volume", volume);
    volume = MathUtil.clamp(volume, 0, 100);
    this._peripheral.updateSendBuffer("music_volume", volume);
    return Promise.resolve();
  }
  // AIKey
  AIKey(args) {
    const value = Cast.toString(args.VALUE);
    console.log("value", value);
    this._peripheral.updateSendBuffer("ai_api_key", value);
    return Promise.resolve();
  }
  // AIAssistantID
  AIAssistantID(args) {
    const value = Cast.toString(args.VALUE);
    this._peripheral.updateSendBuffer("ai_assistant_id", value);
    console.log("value", value);
    return Promise.resolve();
  }
  // aiInit
  aiInit() {
    if (!this._peripheral.isConnected()) return;
    this._peripheral.updateSendBuffer("ai_init", 1);
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let aiState = this._peripheral.receiveBuffer.aiState;
        let errorMessage = this._peripheral.receiveBuffer.errorMessage;
        if (aiState && aiState === "IDLE") {
          resolve();
        } else if (aiState && aiState === "FAILED") {
          let alertData = {
            alertId: "errorMessage",  // alertId 自定义
            alertType: "STANDARD",
            closeButton: false,
            // iconSpinner: false,
            // iconURI: successImage,
            level: "success",  //success, warn, info
            // showDownload: false,
            // showSaveNow: false,
            content: errorMessage,
            maxDisplaySecs: 5,
          };
          this._peripheral.handleAiError(alertData);
          resolve();
        }
      }, 1);
    });
  }

  // 听并等待
  listenAndWait() {
    if (!this._peripheral.isConnected()) return;
    if (this._peripheral.receiveBuffer.aiState !== "IDLE") return;
    this._peripheral.updateSendBuffer("ai_listen", 1);
    this._peripheral.setReceiveBuffer("thinking", "");
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let aiState = this._peripheral.receiveBuffer.aiState;
        let listening = this._peripheral.receiveBuffer.listening;
        console.log("aiState", aiState);
        console.log("listening", listening);
        if (listening && listening !== "" && aiState === "IDLE") {
          resolve();
        }
      }, 1);
    });
  }
  voskListenWait() {
    if (!this._peripheral.isConnected()) return;
    if (this._peripheral.receiveBuffer.isVoskListening) return;
    this._peripheral.updateSendBuffer("vosk_listen", 1);
    this._peripheral.setReceiveBuffer("thinking", "");
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let isVoskListening = this._peripheral.receiveBuffer.isVoskListening;
        // let voskListening = this._peripheral.receiveBuffer.voskListening;
        // console.log("voskStatus", voskStatus);
        // console.log("voskListening", voskListening);
        if (!isVoskListening) {
          resolve();
        }
      }, 1000);
    });
  }
  setVoskLanguage(args) {
    let language = Cast.toString(args.LANGUAGE);
    if (language === "English (US)") {
      language = "en-us";
    }
    console.log("language", language);
    this._peripheral.updateSendBuffer("vosk_set_language", language);
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let voskLanguage = this._peripheral.receiveBuffer.voskLanguage;
        // console.log("voskSetLanguageStatus", aiState);
        if (!voskLanguage) {
          resolve();
        }
      }, 1000);
    });
  }

  voskListenResult() {
    let data = this._peripheral.receiveData.voskListening;
    return data ? data : "";
  }
  voskLanguageStatus() {
    let data = this._peripheral.receiveData.isVoskListening;
    return data ? data : "";
  }

  // 思考内容
  reflections(args) {
    if (!this._peripheral.isConnected()) return;
    if (this._peripheral.receiveBuffer.aiState !== "IDLE") return;
    this._peripheral.setReceiveBuffer("thinking", "");

    const index = Cast.toNumber(args.THINKING);
    const string = Cast.toString(args.THINK);
    if (index === 0) {
      this._peripheral.updateSendBuffer("ai_think", string);
    } else {
      this._peripheral.updateSendBuffer("ai_think_with_image", string);
    }
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let aiState = this._peripheral.receiveBuffer.aiState;
        let thinking = this._peripheral.receiveBuffer.thinking;
        console.log("aiState", aiState);
        console.log("thinking", thinking);
        if (thinking && thinking !== "" && aiState === "IDLE") {
          resolve();
        }
      }, 1000);
    });
  }

  // 说
  say(args) {
    if (!this._peripheral.isConnected()) return;
    if (this._peripheral.receiveBuffer.aiState !== "IDLE") return;
    let content = Cast.toString(args.SAY);
    this._peripheral.updateSendBuffer("ai_say", content);
    let hasTTSStarted = false;
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let aiState = this._peripheral.receiveBuffer.aiState;
        if (!hasTTSStarted && aiState === "TTS") {
          hasTTSStarted = true;
        }
        if (hasTTSStarted && aiState && aiState === "IDLE") {
          resolve();
        }
      }, 1);
    });
  }

  // 本地说
  sayLocal(args) {
    console.log("sayLocal", args);
    let content = Cast.toString(args.SAY);
    if (!this._peripheral.isConnected()) return;
    this._peripheral.updateSendBuffer("piper_say", content);
    let stage = 0;
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let piperSaying = this._peripheral.receiveBuffer.piperSaying;
        if (stage === 0 && piperSaying) {
          stage = 1;
        } else if (stage === 1 && !piperSaying) {
          resolve();
        };
      }, 1);
    });
  };

  // 语言模型
  piperModels(args) {
    let nations = Cast.toString(args.MODEL);
    this._peripheral.updateSendBuffer("piper_set_model", nations);
    return Promise.resolve();
  }



  // AI声音模型
  setVoiceModel(args) {
    let model = Cast.toString(args.VOICE);
    console.log("model", args);
    this._peripheral.updateSendBuffer("ai_say_voice", model);
    return Promise.resolve();
  }
  // AI输入语言
  setInputLanguage(args) {
    let language = Cast.toString(args.LANGUAGE);
    console.log("language", language);
    this._peripheral.updateSendBuffer("ai_listen_language", language);
    return Promise.resolve();
  }

  // 最近听到的语句
  lastHeard() {
    console.log("heard", this._peripheral.receiveData.listening);
    let heard = this._peripheral.receiveData.listening;
    return heard ? heard : "";
  }
  // ai回答
  aiAnswer() {
    let data = this._peripheral.receiveData.thinking;
    return data ? data : "";
  }

  // ai状态
  aiState() {
    let state = this._peripheral.receiveData.aiState;
    return state ? state : "";
  }

  // 听到的内容
  heard() {
    console.log("heard", this._peripheral.receiveData.listening);
    let heard = this._peripheral.receiveData.listening;
    return heard ? heard : "";
  }

  // 思考的答案
  thoughtfulAnswers() {
    let data = this._peripheral.receiveData.thinking;
    return data ? data : "";
  }

  // 设置预设动作
  setPresetAction(args) {
    let action = Cast.toString(args.ACTION);
    this._peripheral.updateSendBuffer("do_action", action);
    return new Promise((resolve, reject) => {
      let hasStarted = false;
      setInterval(() => {
        let actionStatus = this._peripheral.receiveData.actionStatus;
        if (actionStatus) {
          hasStarted = true;
        };
        if (hasStarted && !actionStatus) {
          resolve();
        }
      }, 1);
    });
  }

  // 设置LED开关
  setLedSwitch(args) {
    let ledSwitch = Cast.toNumber(args.ONOFF);
    this._peripheral.updateSendBuffer("led", ledSwitch);
    return Promise.resolve();
  }

  // 等待按钮按下
  waitButtonPress(args) {
    // let button = Cast.toNumber(args.BUTTON);
    // const buttonKey = button === 0 ? 'usrButtonPressed' : 'rstButtonPressed';
    return new Promise((resolve, reject) => {
      setInterval(() => {
        // const buttonPressed = this._peripheral.receiveBuffer[buttonKey];
        const buttonPressed = this._peripheral.receiveBuffer.usrButtonPressed;
        if (buttonPressed !== undefined && buttonPressed) {
          resolve();
        }
      }, 1);
    });
  }

  // 当按钮按下
  whenButtonPress() {
    const buttonPressed = this._peripheral.receiveBuffer.usrButtonPressed;
    return buttonPressed !== undefined ? buttonPressed : false;
  }

  isButtonPress() {
    const buttonPressed = this._peripheral.receiveBuffer.usrButtonPressed;
    return buttonPressed !== undefined ? buttonPressed : false;
  }

  // 画面正反转
  setRotation(args) {
    let rotation = args.ROTATION;
    this.runtime.ioDevices.mjpg.setRotation(rotation);
  }

  // 视频透明度
  setVideoTransparency(args) {
    let transparency = Cast.toNumber(args.TRANSPARENCY);
    transparency = 100 - transparency;
    this.globalVideoTransparency = transparency;
    this.runtime.ioDevices.mjpg.setPreviewGhost(transparency);
  }

  battery() {
    let batteryVoltage = this._peripheral.receiveBuffer.batteryVoltage;
    batteryVoltage = MathUtil.clamp(batteryVoltage, 6.2, 8.2);
    batteryPercentage = (batteryVoltage - 6.2) / (8.2 - 6.2) * 100;
    return batteryPercentage ? batteryPercentage.toFixed(2) + "%" : "";
  }

  // 灰度值
  grayData(args) {
    let data = Cast.toNumber(args.DATAPOSITION);
    const grayData = this._peripheral.receiveData.grayscale3ChannelData;
    if (data === 0) {
      return grayData ? grayData[0] : "";
    } else if (data === 1) {
      return grayData ? grayData[1] : "";
    } else if (data === 2) {
      return grayData ? grayData[2] : "";
    }
  }

  // 线路位置
  linePosition() {
    let data = this._peripheral.receiveData.linePosition;
    return data !== null ? data : "";
  }

  // 是否在线上
  isOnLine() {
    let data = this._peripheral.receiveData.isOnLine;
    return data ? data : false;
  }

  // 是否在悬崖
  isOnCliff() {
    let data = this._peripheral.receiveData.isOnCliff;
    return data ? data : false;
  }

  // 巡线传感器检测
  lineSensor(args) {
    let value = Cast.toNumber(args.DATAPOSITION);
    let data = this._peripheral.receiveData.grayscale3ChannelStatus;
    if (value >= 0 && value < data.length) {
      return data[value] === 1;
    }
    return false;
  }

  cameraColorData(args) {
    let data = Cast.toNumber(args.COLORID);
    const imageData = [this.runtime.ioDevices.mjpg.imageWidth, this.runtime.ioDevices.mjpg.imageHeight];
    const cameraColorData = this._peripheral.receiveData.colorRecognition;
    if (!cameraColorData) return "";
    const newCameraColorPosition = this._peripheral.transformCoordinates(imageData, cameraColorData.x, cameraColorData.y);
    if (data === 0) {
      return cameraColorData ? cameraColorData.n : "";
    } else if (data === 1) {
      return cameraColorData ? newCameraColorPosition[0] : "";
    } else if (data === 2) {
      return cameraColorData ? newCameraColorPosition[1] : "";
    } else if (data === 3) {
      return cameraColorData ? cameraColorData.w : "";
    } else if (data === 4) {
      return cameraColorData ? cameraColorData.h : "";
    }
  };

  cameraFaceData(args) {
    let data = Cast.toNumber(args.COLORID);
    const imageData = [this.runtime.ioDevices.mjpg.imageWidth, this.runtime.ioDevices.mjpg.imageHeight];
    const cameraFaceData = this._peripheral.receiveData.faceRecognition;
    if (!cameraFaceData) return "";
    const newCameraFacePosition = this._peripheral.transformCoordinates(imageData, cameraFaceData.x, cameraFaceData.y);
    if (data === 0) {
      return cameraFaceData ? cameraFaceData.n : "";
    } else if (data === 1) {
      return cameraFaceData ? newCameraFacePosition[0] : "";
    } else if (data === 2) {
      return cameraFaceData ? newCameraFacePosition[1] : "";
    } else if (data === 3) {
      return cameraFaceData ? cameraFaceData.w : "";
    } else if (data === 4) {
      return cameraFaceData ? cameraFaceData.h : "";
    }
  };

  cameraTrafficData(args) {
    let data = Cast.toNumber(args.TRAFFICID);
    const imageData = [this.runtime.ioDevices.mjpg.imageWidth, this.runtime.ioDevices.mjpg.imageHeight];
    const trafficData = this._peripheral.receiveData.trafficRecognition;
    if (!trafficData) return "";
    const newCameraFacePosition = this._peripheral.transformCoordinates(imageData, trafficData.x, trafficData.y);
    if (data === 0) {
      return trafficData ? trafficData.t : "";
    } else if (data === 1) {
      return trafficData ? newCameraFacePosition[0] : "";
    } else if (data === 2) {
      return trafficData ? newCameraFacePosition[1] : "";
    } else if (data === 3) {
      return trafficData ? trafficData.w : "";
    } else if (data === 4) {
      return trafficData ? trafficData.h : "";
    }
  };

  cameraQRCodeData(args) {
    let data = Cast.toNumber(args.QRID);
    const imageData = [this.runtime.ioDevices.mjpg.imageWidth, this.runtime.ioDevices.mjpg.imageHeight];
    const qrData = this._peripheral.receiveData.QRCodeRecognition;
    if (!qrData) return "";
    const newCameraFacePosition = this._peripheral.transformCoordinates(imageData, qrData.x, qrData.y);
    if (data === 0) {
      return qrData ? qrData.d : "";
    } else if (data === 1) {
      return qrData ? newCameraFacePosition[0] : "";
    } else if (data === 2) {
      return qrData ? newCameraFacePosition[1] : "";
    } else if (data === 3) {
      return qrData ? qrData.w : "";
    } else if (data === 4) {
      return qrData ? qrData.h : "";
    }
  };
  dummyFunction() { }
}

module.exports = PiCarXBlocks;
