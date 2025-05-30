console.log("PiCarX")

const ArgumentType = require('../../extension-support/argument-type');
const ScratchBlocksConstants = require('../../engine/scratch-blocks-constants');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const Cast = require('../../util/cast');
const WS = require('../../io/webSocket');
const Color = require('../../util/color');
const SuccessImage = require('./assets/icon--success.svg');

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
// const iconURI = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgd2lkdGg9IjQwcHgiPgogIDxyZWN0IHg9IjI1LjI5IiB5PSIxMC4yNiIgd2lkdGg9IjEuNCIgaGVpZ2h0PSI3LjUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MC4wMSAtMTEuOTcpIHJvdGF0ZSg5MCkiLz4KICA8cmVjdCB4PSIyNS44OCIgeT0iOS40NSIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSI3LjUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzOS4yIC0xMi43OSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICMyODFmMTg7Ii8+CiAgPHJlY3QgeD0iMjguNzYiIHk9Ii0uOTQiIHdpZHRoPSIuMzYiIGhlaWdodD0iMTkuNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM3LjgyIC0yMC4wNSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICMyODFmMTg7Ii8+CiAgPHJlY3QgeD0iMjUuODgiIHk9IjExLjA4IiB3aWR0aD0iLjIzIiBoZWlnaHQ9IjcuNTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQwLjgzIC0xMS4xNikgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICM1NDQxMzM7Ii8+CiAgPHJlY3QgeD0iMjEuOTIiIHk9IjkuMDYiIHdpZHRoPSIxIiBoZWlnaHQ9IjYuOTMiLz4KICA8cmVjdCB4PSIyOS4xNiIgeT0iOS4wNiIgd2lkdGg9IjEiIGhlaWdodD0iNi45MyIvPgogIDxwYXRoIGQ9Ik0xMC4yOSwxOC4wMWguNTl2MS41M2gtLjU5Yy0uMTcsMC0uMzEtLjE0LS4zMS0uMzF2LS45MWMwLS4xNywuMTQtLjMxLC4zMS0uMzFaIiBzdHlsZT0iZmlsbDogI2QxZDFkMTsiLz4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xMS4zMiwxMi4xOWguNDF2LjgxaC0uNDFjLS4xLDAtLjE4LS4wOC0uMTgtLjE4di0uNDZjMC0uMSwuMDgtLjE4LC4xOC0uMThaIiBzdHlsZT0iZmlsbDogIzEwMGYxMTsiLz4KICAgIDxwYXRoIGQ9Ik0xNS4xMywxNS45OXYtNC45OHMuODEtLjE4LC44MS0uOTEtLjkxLS42OC0uOTEtLjY4bC0uNDUsLjMycy0uMTQsLjA5LS41LC4wOWgtLjkxdjUuMDhzLjA1LC4xMywuMjMsLjE4di41OXMwLC4zMiwuMTgsLjMyaDEuNTRaIiBzdHlsZT0iZmlsbDogI2UyZTJlMjsgc3Ryb2tlOiAjOWI5YjliOyBzdHJva2UtbWl0ZXJsaW1pdDogMTA7IHN0cm9rZS13aWR0aDogLjI1cHg7Ii8+CiAgICA8cmVjdCB4PSIxMi45NiIgeT0iOS45MiIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSI0Ljg5IiBzdHlsZT0iZmlsbDogIzI4MWYxODsiLz4KICAgIDxyZWN0IHg9IjExLjY5IiB5PSIxMC44MyIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSIzLjA4IiBzdHlsZT0iZmlsbDogIzU0NDEzMzsiLz4KICAgIDxyZWN0IHg9IjExLjkyIiB5PSIxMS4xOSIgd2lkdGg9IjEuMDQiIGhlaWdodD0iMi4zNSIgc3R5bGU9ImZpbGw6ICMxMDBmMTE7Ii8+CiAgPC9nPgogIDxwYXRoIGQ9Ik0xMC44OCwxOS42NmgyMS41MnYtMi4yMnMuMDMtLjQxLS40Ny0uNTlsLTEuMzYtLjgxcy0uMjctLjA1LS42OC0uMDVIMTMuMTZzLS4yLS4wMS0uNjMsLjI0bC0xLjQ3LC44OXMtLjE4LC4xLS4xOCwuNTd2MS45NloiIHN0eWxlPSJmaWxsOiAjZTJlMmUyOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8cGF0aCBkPSJNMTIuMDUsMjEuMzNsMS45OS0uNzJzLjIyLS4wOSwuMzgsMCwuNTEsLjA2LC42OS0uMDQsNi41My0yLjQsNi41My0yLjRjMCwwLC43LS4yNSwuNzktMS4xMSwwLDAtLjAyLS45MywuNjYtMS4xNSwwLDAsLjgxLS4zNiwxLjI3LC40MSwwLDAsLjA5LC4xOCwuMTQsLjQxLDAsMCwuMDksLjc3LC43NywxLDAsMCwyLjgxLC40NSw1LjA3LDIuMzUsMCwwLDEuNTQsMS4yNywyLjQ0LDIuNzYsMCwwLDMuMjYsNC42NSwzLjMzLDQuODIsLjE0LC4zNi0uMTgsMS4zMS0uOTEsMS4zMSwwLDAtLjU0LDAtLjc3LS4zNiwwLDAtMy43LTUuMTgtNC4yOC01LjkxLTEuMzEtMS42My0zLjEyLTIuMzUtMy44OS0yLjYzLS43Mi0uMjUtMS4xMy0uMzYtMi4yNi0uMzYtLjgyLDAtMi4wNCwuNDEtMi4wNCwuNDFsLTMuMjEsMS4xOC0yLjEzLC44MS0xLjIyLC41NHMtLjgxLC40MS0xLjMxLDBjMCwwLS42OC0uNjgtMS4wOS0uNjMsMCwwLS41NCwuMTQtLjgxLC4yN3MtLjUsMC0uNTQtLjI3YzAsMC0uMDktLjQ1LC40MS0uNjhaIiBzdHlsZT0iZmlsbDogI2UyZTJlMjsgc3Ryb2tlOiAjOWI5YjliOyBzdHJva2UtbWl0ZXJsaW1pdDogMTA7IHN0cm9rZS13aWR0aDogLjI1cHg7Ii8+CiAgPHBhdGggZD0iTTQuNzQsMjguOTZsMi4yMS0uODQsMy42My0xLjQycy43Mi0uMTgsMS0uNTlsMi4zOC0yLjZzLjM0LS4yOSwuNy0uMDJjLjM0LC4yNiw3LjE1LDUuNTIsNy4xNSw1LjUyLDAsMCwxLjQ5LDAsMS4xMy0xLjU4bC04LjI2LTYuMjdzLS43Mi0uNTktMS40LC4yM2wtMy4xLDMuMzNzLS40MSwuNDUtLjk1LC41OWwtNS4xNiwxLjlzLS42MywxLjMxLC42OCwxLjc3WiIgc3R5bGU9ImZpbGw6ICNlMmUyZTI7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxwYXRoIGQ9Ik04LjcsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8cGF0aCBkPSJNMjUsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8cGF0aCBkPSJNMzguMjYsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8Y2lyY2xlIGN4PSIyMy41MSIgY3k9IjE2LjgiIHI9Ii4zOCIgc3R5bGU9ImZpbGw6ICNjY2M7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxjaXJjbGUgY3g9IjIzLjUxIiBjeT0iMTguMzkiIHI9Ii4yOSIgc3R5bGU9ImZpbGw6ICNjY2M7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxjaXJjbGUgY3g9IjUuNCIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIyMS42OSIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIzNC45NiIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIxNC4wOSIgY3k9IjIxLjkyIiByPSIuMzgiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KPC9zdmc+`;
const iconURI = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuWbvuWxgl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iOTQuNXB4IiBoZWlnaHQ9Ijc3LjlweCIgdmlld0JveD0iMCAwIDk0LjUgNzcuOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgOTQuNSA3Ny45OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0UyRTJFMjtzdHJva2U6IzlCOUI5QjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3Qxe2ZpbGw6I0YyRjJGMjtzdHJva2U6I0I5QjlCOTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3Qye2ZpbGw6I0NDQ0NDQztzdHJva2U6IzlCOUI5QjtzdHJva2Utd2lkdGg6MC41O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCS5zdDN7ZmlsbDojOUI5QjlCO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjI1O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCS5zdDR7ZmlsbDojRTJFMkUyO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjI1O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCS5zdDV7ZmlsbDojNDNBRUI2O30KCS5zdDZ7ZmlsbDojNzhDRUREO30KCS5zdDd7ZmlsbDojOTREQUU2O30KCS5zdDh7ZmlsbDojQzlFOEVEO30KCS5zdDl7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjI1O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KPC9zdHlsZT4KPHJlY3QgeD0iNTEuMiIgeT0iMTAuNiIgY2xhc3M9InN0MCIgd2lkdGg9IjIuNSIgaGVpZ2h0PSIyMS4xIi8+CjxyZWN0IHg9IjY1IiB5PSI5LjkiIGNsYXNzPSJzdDAiIHdpZHRoPSIyLjUiIGhlaWdodD0iMjEuMSIvPgo8cmVjdCB4PSI1NSIgeT0iNy42IiBjbGFzcz0ic3QxIiB3aWR0aD0iMi41IiBoZWlnaHQ9IjI2LjEiLz4KPHJlY3QgeD0iNDAuOSIgeT0iNi43IiBjbGFzcz0ic3QxIiB3aWR0aD0iMi41IiBoZWlnaHQ9IjI2LjEiLz4KPGc+Cgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNzguMSwxNC40SDQ3LjhjLTAuOCwwLTEuOS0wLjMtMi42LTAuNmwtMTIuNS03Yy0wLjYtMC40LTAuNS0wLjYsMC4zLTAuNmgzMC4zYzAuOCwwLDEuOSwwLjMsMi42LDAuNgoJCWwxMi40LDYuOUM3OSwxNC4xLDc4LjksMTQuNCw3OC4xLDE0LjR6Ii8+Cgk8Zz4KCQk8cG9seWdvbiBwb2ludHM9IjQ3LjUsOC44IDU4LjMsOC44IDUzLjcsNi4zIDQzLDYuMyAJCSIvPgoJCTxwb2x5Z29uIHBvaW50cz0iNTEuMSwxMS4zIDQ3LjMsOS4yIDM3LjUsOS4yIDQxLjMsMTEuMyAJCSIvPgoJCTxwb2x5Z29uIHBvaW50cz0iNjMuOCwxMS4zIDczLjYsMTEuMyA2OS44LDkuMiA2MCw5LjIgCQkiLz4KCQk8cG9seWdvbiBwb2ludHM9IjYzLjYsMTEuNyA1Mi44LDExLjcgNTcuNCwxNC4zIDY4LjEsMTQuMyAJCSIvPgoJCTxwb2x5Z29uIHBvaW50cz0iNDguMyw5LjIgNTIuMSwxMS4zIDYyLjgsMTEuMyA1OSw5LjIgCQkiLz4KCQk8cGF0aCBkPSJNNTkuMiw4LjhINjlsLTMuNC0xLjljLTAuNi0wLjMtMS43LTAuNi0yLjUtMC42aC04LjRMNTkuMiw4Ljh6Ii8+CgkJPHBhdGggZD0iTTY0LjUsMTEuN2w0LjUsMi41aDguNGMwLjgsMCwwLjktMC4zLDAuMy0wLjZsLTMuNC0xLjlINjQuNXoiLz4KCQk8cGF0aCBkPSJNNTEuOSwxMS43SDQybDMuNCwxLjljMC42LDAuMywxLjcsMC42LDIuNSwwLjZoOC40TDUxLjksMTEuN3oiLz4KCQk8cGF0aCBkPSJNNDYuNiw4LjhMNDIsNi4zaC04LjRjLTAuOCwwLTAuOSwwLjMtMC4zLDAuNmwzLjQsMS45SDQ2LjZ6Ii8+Cgk8L2c+CjwvZz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTc1LjgsNDUuOUgyMi42di03LjVjMC00LjUsMy42LTguMSw4LjEtOC4xaDM2LjljNC41LDAsOC4xLDMuNiw4LjEsOC4xTDc1LjgsNDUuOUw3NS44LDQ1Ljl6Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zMS4xLDQzLjlsMTcuNy03LjVjMCwwLTAuNS0xLjQsMS4xLTQuMmMwLDAsMC44LTEuMywzLjgtMS4yYzIuNywwLjUsMy4xLDIuNywzLjIsMy4zYzAsMC0wLjIsMSwxLjUsMS42CgljMCwwLDI0LjMsMjAsMjQuNSwyMC41YzAuMywwLjksMS4xLDYuMi00LjUsNWMwLDAtMTcuNi0xOC40LTI0LjctMTkuMWMtMiwwLTMuMSwwLjQtMy4xLDAuNGwtNy45LDIuOWwtNS4zLDJsLTMsMS4zCgljMCwwLTMuNywyLjUtNi4yLDIuMWMtMi0wLjMtMy0zLjQtMy0zLjdjMCwwLTAuMi0xLjEsMS0xLjdMMzEuMSw0My45eiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTUuOSw2NC4yYy01LjYtMS4yLTMtNy4zLTMtNy4zbDE2LjItMTMuM2MyLjYtMS41LDQtMC4zLDQtMC4zbDIwLjQsMTUuNWMwLjksMy45LTQuNSw0LjktNC41LDQuOQoJUzMzLjQsNTEuNiwzMi42LDUxYy0wLjktMC43LTIuMSwwLTIuMSwwTDE1LjksNjQuMnoiLz4KPHBhdGggY2xhc3M9InN0MiIgZD0iTTMwLjYsNDcuNmMwLTAuNSwwLjQtMC45LDAuOS0wLjlzMC45LDAuNCwwLjksMC45cy0wLjQsMC45LTAuOSwwLjlTMzAuNiw0OC4yLDMwLjYsNDcuNnoiLz4KPHBhdGggY2xhc3M9InN0MiIgZD0iTTUyLjUsMzguMWMwLTAuNSwwLjQtMC45LDAuOS0wLjlzMC45LDAuNCwwLjksMC45UzUzLjksMzksNTMuNCwzOVM1Mi41LDM4LjYsNTIuNSwzOC4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzguMiwzMS42YzAuNi0wLjIsMS4yLTAuNCwxLjktMC43Yy0wLjQtMi43LTAuMy00LjktMC4xLTYuM2MwLjQtMy4zLDAuOS03LDMuNC04LjhjMC41LTAuNCwxLjItMC43LDEuMi0xLjIKCWMwLTAuOC0xLjYtMS42LTMtMS41Yy0xLjgsMC4yLTIuOCwxLjktMywyLjFjLTAuMiwwLjMtMC4zLDAuNi0wLjQsMC43Yy0xLjksNC44LTUuMywxMy4zLTIuNiwxNS40QzM2LDMxLjYsMzYuOCwzMS45LDM4LjIsMzEuNnoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTI0LjksMjcuN2MwLjYsMC4xLDEuMiwwLjIsMS44LDAuNGMtMC42LTIuMy0wLjYtNC4zLTAuNC01LjZjMC4yLTIuMiwwLjYtNi44LDMuNC04LjhjMC41LTAuNCwxLjItMC43LDEuMi0xLjIKCWMwLTAuOC0xLjYtMS42LTMtMS41Yy0xLjksMC4yLTIuOSwxLjktMywyLjFjLTAuNCwwLjgtMC41LDEuNi0wLjUsMmMtMC4xLDMuNCwwLjUsNS44LDAuNiw4LjNDMjUuMSwyNC40LDI1LjEsMjUuOCwyNC45LDI3Ljd6Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNC40LDE2LjVjMC4yLDIuNywwLjIsNS41LDAuMiw4LjVjMCwxLjYtMC4xLDMuMS0wLjEsNC41YzEuOSwwLjUsMy45LDEsNi4xLDEuNGMxLjksMC40LDMuNiwwLjYsNS4zLDAuOAoJYzAuMSwwLDAuMSwwLDAuMiwwYzAuMiwwLDAuNCwwLDAuNCwwQzM3LDMxLjYsMzYuOCwyNiwzNywyM2MwLjEtMS45LDAuNS0zLjQsMC43LTQuNGMtMS4zLTAuOC0zLjQtMS44LTYuMS0yLjMKCUMyOC41LDE1LjgsMjUuOSwxNi4yLDI0LjQsMTYuNXoiLz4KPGc+Cgk8ZWxsaXBzZSBjbGFzcz0ic3QzIiBjeD0iMzAuMiIgY3k9IjIzLjUiIHJ4PSIzLjIiIHJ5PSI0LjEiLz4KCTxlbGxpcHNlIGNsYXNzPSJzdDQiIGN4PSIzMCIgY3k9IjIzLjUiIHJ4PSIzIiByeT0iNC4xIi8+Cgk8ZWxsaXBzZSBjbGFzcz0ic3QzIiBjeD0iMzAiIGN5PSIyMy41IiByeD0iMi42IiByeT0iMy41Ii8+Cgk8Zz4KCQk8ZWxsaXBzZSBjbGFzcz0ic3Q1IiBjeD0iMzAuMiIgY3k9IjIzLjUiIHJ4PSIyLjEiIHJ5PSIzLjQiLz4KCQk8ZWxsaXBzZSBjbGFzcz0ic3Q2IiBjeD0iMzAuNCIgY3k9IjIzLjUiIHJ4PSIyLjEiIHJ5PSIzLjQiLz4KCQk8ZWxsaXBzZSBjbGFzcz0ic3Q3IiBjeD0iMjkuOSIgY3k9IjI0IiByeD0iMS4zIiByeT0iMi4yIi8+CgkJPGVsbGlwc2UgY2xhc3M9InN0OCIgY3g9IjI5LjciIGN5PSIyNC4zIiByeD0iMC42IiByeT0iMSIvPgoJPC9nPgoJPGVsbGlwc2UgY2xhc3M9InN0OSIgY3g9IjMwLjMiIGN5PSIyMy41IiByeD0iMi4zIiByeT0iMy41Ii8+CjwvZz4KPHBhdGggZD0iTTcuOSw1Mi4xYy00LjIsNC4yLTQuMiwxMS4xLDAsMTUuM3MxMS4xLDQuMiwxNS4zLDBzNC4yLTExLjEsMC0xNS4zUzEyLjEsNDcuOSw3LjksNTIuMXogTTEzLjgsNTZsLTItMi4xCgljMS4xLTAuNywyLjQtMS4xLDMuOC0xLjFjMC43LDAsMS40LDAuMSwyLjEsMC4zbC0xLjUsMi42QzE1LjQsNTUuNSwxNC41LDU1LjcsMTMuOCw1NkwxMy44LDU2eiBNMTQsNTguMmMwLjgtMC44LDIuMi0wLjgsMywwCglzMC44LDIuMiwwLDNzLTIuMiwwLjgtMywwUzEzLjIsNTkuMSwxNCw1OC4yeiBNMTUuNyw2Ni43TDE1LjcsNjYuN0wxNS43LDY2LjdoLTAuMWMtMS45LDAtMy43LTAuOC00LjktMmMtMC4yLTAuMi0wLjUtMC41LTAuNy0wLjgKCWwyLjYtMS4zbDAsMGMwLjcsMC43LDEuNiwxLjEsMi42LDEuMkwxNS43LDY2LjdMMTUuNyw2Ni43eiBNMTEuNCw2MC4ybC0yLjYsMS4zYy0wLjEtMC42LTAuMi0xLjEtMC4yLTEuN2MwLTEuNSwwLjUtMi44LDEuMi00CglsMiwyLjFDMTEuNSw1OC42LDExLjMsNTkuNCwxMS40LDYwLjJ6IE0yMC41LDY0LjdjLTAuNiwwLjYtMS40LDEuMS0yLjIsMS41bC0wLjUtMi45YzAuMi0wLjIsMC41LTAuMywwLjctMC42YzAuNC0wLjQsMC44LTEsMS0xLjYKCWwyLjksMC4zQzIyLDYyLjcsMjEuNCw2My44LDIwLjUsNjQuN3ogTTIyLjUsNTguN2wtMy0wLjNjLTAuMi0wLjUtMC41LTEuMS0wLjktMS41bDEuNS0yLjVjMC4yLDAuMSwwLjMsMC4zLDAuNSwwLjQKCUMyMS41LDU1LjgsMjIuMiw1Ny4yLDIyLjUsNTguN3oiLz4KPHBhdGggZD0iTTQxLjYsNTIuMWMtNC4yLDQuMi00LjIsMTEuMSwwLDE1LjNzMTEuMSw0LjIsMTUuMywwczQuMi0xMS4xLDAtMTUuM1M0NS44LDQ3LjksNDEuNiw1Mi4xeiBNNDcuNSw1NmwtMi0yLjEKCWMxLjEtMC43LDIuNC0xLjEsMy44LTEuMWMwLjcsMCwxLjQsMC4xLDIuMSwwLjNsLTEuNSwyLjZDNDksNTUuNSw0OC4yLDU1LjcsNDcuNSw1Nkw0Ny41LDU2eiBNNDcuNyw1OC4yYzAuOC0wLjgsMi4yLTAuOCwzLDAKCXMwLjgsMi4yLDAsM3MtMi4yLDAuOC0zLDBTNDYuOSw1OS4xLDQ3LjcsNTguMnogTTQ5LjQsNjYuN0w0OS40LDY2LjdMNDkuNCw2Ni43TDQ5LjQsNjYuN2MtMiwwLTMuOC0wLjgtNS0yCgljLTAuMi0wLjItMC41LTAuNS0wLjctMC44bDIuNi0xLjNsMCwwYzAuNywwLjcsMS42LDEuMSwyLjYsMS4yTDQ5LjQsNjYuN0w0OS40LDY2Ljd6IE00NS4xLDYwLjJsLTIuNiwxLjNjLTAuMS0wLjYtMC4yLTEuMS0wLjItMS43CgljMC0xLjUsMC41LTIuOCwxLjItNGwyLDIuMUM0NS4yLDU4LjYsNDUsNTkuNCw0NS4xLDYwLjJ6IE01NC4yLDY0LjdjLTAuNiwwLjYtMS40LDEuMS0yLjIsMS41bC0wLjUtMi45YzAuMi0wLjIsMC41LTAuMywwLjctMC42CgljMC40LTAuNCwwLjgtMSwxLTEuNmwyLjksMC4zQzU1LjcsNjIuNyw1NS4xLDYzLjgsNTQuMiw2NC43eiBNNTYuMSw1OC43bC0zLTAuM2MtMC4yLTAuNS0wLjUtMS4xLTAuOS0xLjVsMS41LTIuNQoJYzAuMiwwLjEsMC4zLDAuMywwLjUsMC40QzU1LjIsNTUuOCw1NS45LDU3LjIsNTYuMSw1OC43eiIvPgo8cGF0aCBkPSJNNzEuMSw1NC4xQzY4LDU5LjIsNjkuNiw2NS45LDc0LjcsNjlzMTEuOCwxLjUsMTQuOS0zLjZzMS41LTExLjgtMy42LTE0LjlDODAuOSw0Ny4zLDc0LjIsNDksNzEuMSw1NC4xeiBNNzcuOCw1Ni40CglsLTIuNS0xLjZjMC45LTEsMi4xLTEuNywzLjQtMmMwLjctMC4yLDEuNC0wLjIsMi4xLTAuMmwtMC44LDNDNzkuMiw1NS42LDc4LjQsNTUuOSw3Ny44LDU2LjRMNzcuOCw1Ni40eiBNNzguNSw1OC42CgljMC42LTEsMS45LTEuMywzLTAuN2MxLDAuNiwxLjMsMS45LDAuNywzYy0wLjYsMS0xLjksMS4zLTMsMC43Uzc3LjksNTkuNiw3OC41LDU4LjZ6IE04Mi4xLDY2LjRMODIuMSw2Ni40TDgyLjEsNjYuNEw4Mi4xLDY2LjQKCWMtMiwwLjUtMy45LDAuMS01LjQtMC44Yy0wLjMtMC4yLTAuNi0wLjQtMC44LTAuNmwyLjItMS44YzAsMCwwLDAsMC4xLDBjMC45LDAuNSwxLjgsMC43LDIuOCwwLjZMODIuMSw2Ni40TDgyLjEsNjYuNHogTTc2LjUsNjEuMQoJbC0yLjMsMS44Yy0wLjMtMC41LTAuNS0xLjEtMC42LTEuNmMtMC4zLTEuNC0wLjItMi45LDAuMy00LjFsMi41LDEuNkM3Ni4xLDU5LjUsNzYuMiw2MC4zLDc2LjUsNjEuMXogTTg2LjMsNjMuMwoJYy0wLjUsMC44LTEuMSwxLjQtMS44LDJsLTEuMS0yLjdjMC4yLTAuMiwwLjQtMC40LDAuNS0wLjdjMC4zLTAuNSwwLjUtMS4xLDAuNi0xLjhsMi45LTAuNEM4Ny40LDYxLDg3LDYyLjIsODYuMyw2My4zeiBNODYuOCw1NwoJbC0zLDAuNGMtMC4zLTAuNS0wLjctMC45LTEuMi0xLjNsMC44LTIuOGMwLjIsMC4xLDAuNCwwLjIsMC42LDAuM0M4NS4zLDU0LjUsODYuMyw1NS42LDg2LjgsNTd6Ii8+Cjwvc3ZnPgo=`;


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
    this.cameraSwitch = false;
    this.brightness = 80;
    this.color = { r: 204, g: 0, b: 0 };
    this.DATA_START_BIT = 0xA0;
    this.DATA_END_BIT = 0xA1;
    this.intervalID = null;
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
      grayscale_value: "grayscale3Channel",
      grayscale_status: "grayscale3ChannelStatus",
      battery_voltage: "BatteryVoltage",
      color_detection: "colorRecognition",
      face_detection: "faceRecognition",
      traffic_sign_detection: "trafficRecognition",
      qr_code_detection: "QRCodeRecognition",
      sound_status: "soundPlayStatus",
      music_status: "soundPlayBackgroundStatus",
      music_length: "musicDuration",
      music_position: "musicProgress",
      steering_offset: "steeringCalibration",
      camera_pan_offset: "cameraCalibrationX",
      camera_tilt_offset: "cameraCalibrationY",
      motor_reverse: "motorCalibration",
      ai_listen_result: "listening",
      ai_think_result: "thinking",
      ai_status: "aiState",
      ai_error: "aiError",
      user_button_pressed: "usrButtonPressed",
      reset_button_pressed: "rstButtonPressed",
      piper_saying: "piperSaying",
      piper_model: "piperModel",
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
    this.receiveBuffer = receiveBuffer;
    // console.log("grayscale3Channel:", grayscale3Channel)
  }

  // 发送数据，webSocket发送数据都需要经过这个函数，否则保持上一次的值
  sendDataWS() {
    if (this._ws) {
      let data = this.dataConverter();
      this._ws.setSendPayload(data);
      // setTimeout(() => {
      //   this._ws.setSendPayload(this.sendBuffer);
      // }, 20)
      // 每次发完数据则重置发送状态

      // setTimeout(() => {
      //   this._ws.setSendDataState(false);
      // }, DATA_SEND_INTERVAL);
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
   * @param {number} id 设备的id
   */
  connect(id) {
    if (this._ws) {
      let ip = this.getDeviceInfo();
      ip = `ws://${ip.ip}:30102`
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
    // if (!this.isConnected()) return Promise.resolve();
    // if (this._ws) {
    //     this._ws.start();
    // }
  }

  get distance() {
    return this.receiveBuffer.distance;
  }
  get grayscale3Channel() {
    return this.receiveBuffer.grayscale3Channel;
  }
  get batteryVoltage() {
    return this.receiveBuffer.BatteryVoltage;
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
    // 实例化时会运行下面代码导致设置this.sendBuffer
    // this.videoToggle({
    //   ONOFF: this.globalVideoState
    // });
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
      name: 'piCarX',
      blockIconURI: iconURI,
      showStatusButton: true,
      blocks: [
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
        // Setting the direction motor angle
        {
          opcode: 'settingDirectionAngle',
          text: formatMessage({
            id: 'piCarX.rudder.angle',
            default: 'set direction angle to [VALUE] degrees',
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
        // Setting the camera direction motor angle X
        {
          opcode: 'settingcameraAngleX',
          text: formatMessage({
            id: 'piCarX.cameraRudder.angle.X',
            default: 'set camera angle to [VALUE] degrees X',
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
            default: 'set camera angle to [VALUE] degrees Y',
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
        // Camera Color Recognition
        {
          opcode: 'cameraColorRecognition',
          text: formatMessage({
            id: 'piCarX.cameraColorRecognition',
            default: 'camera color recognition [COLOR]',
            description: 'Camera Color Recognition.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            COLOR: {
              type: ArgumentType.STRING,
              menu: 'color',
              defaultValue: "0"
            }
          }
        },
        // camera face recognition
        {
          opcode: 'cameraFaceRecognition',
          text: formatMessage({
            id: 'piCarX.cameraFaceRecognition',
            default: 'camera color recognition [ONOFF]',
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
        // camera Traffic Signs Recognition
        {
          opcode: 'cameraTrafficSignsRecognition',
          text: formatMessage({
            id: 'piCarX.cameraTrafficSignsRecognition',
            default: 'camera traffic signs recognition [ONOFF]',
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
        // camera QR Code Recognition
        {
          opcode: 'cameraQRCodeRecognition',
          text: formatMessage({
            id: 'piCarX.cameraQRCodeRecognition',
            default: 'camera QR code recognition [ONOFF]',
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
        // 前台音效
        {
          opcode: 'frontSoundList',
          text: formatMessage({
            id: 'piCarX.frontSoundList',
            default: 'frontSound [FRONTSOUND]',
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
        // 后台音效
        {
          opcode: 'backSoundList',
          text: formatMessage({
            id: 'piCarX.backSoundList',
            default: 'play background [BACKSOUND] music',
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
        // 后台音量
        {
          opcode: 'backSoundVolume',
          text: formatMessage({
            id: 'piCarX.backSoundVolume',
            default: 'backSound volume [VALUE] %',
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
        // 后台音效播放
        {
          opcode: 'backSoundPlayControl',
          text: formatMessage({
            id: 'piCarX.backSoundPlayControl',
            default: 'backSound [SOUNDPLAYCONTROL]',
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
        // AIKey
        // {
        //   opcode: 'AIKey',
        //   text: formatMessage({
        //     id: 'piCarX.AIKey',
        //     default: 'AIKey [VALUE]',
        //     description: 'AIKey.'
        //   }),
        //   blockType: BlockType.COMMAND,
        //   arguments: {
        //     VALUE: {
        //       type: ArgumentType.STRING,
        //       defaultValue: " "
        //     },
        //   },
        // },
        // AIAssistantID
        {
          opcode: 'AIAssistantID',
          text: formatMessage({
            id: 'piCarX.AIAssistantID',
            default: 'AIAssistantID [VALUE]',
            description: 'AIAssistantID.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            VALUE: {
              type: ArgumentType.STRING,
              defaultValue: " "
            },
          },
        },
        // AI 初始化
        {
          opcode: 'aiInit',
          text: formatMessage({
            id: 'piCarX.aiInit',
            default: 'aiInit',
            description: 'aiInit'
          }),
          blockType: BlockType.COMMAND,
        },
        // 听并等待
        {
          opcode: 'listenAndWait',
          text: formatMessage({
            id: 'piCarX.listenAndWait',
            default: 'listenAndWait',
            description: 'listenAndWait'
          }),
          blockType: BlockType.COMMAND,
        },
        // 思考内容
        {
          opcode: 'reflections',
          text: formatMessage({
            id: 'piCarX.reflections',
            default: '[THINKING] [THINK]',
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
        // 说
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
        // 本地说
        {
          opcode: 'sayLocal',
          text: formatMessage({
            id: 'piCarX.sayLocal',
            default: 'say [SAY]',
            description: 'sayLocal'
          }),
          arguments: {
            SAY: {
              type: ArgumentType.STRING,
              defaultValue: " "
            }
          }
        },
        // 语言模型
        {
          opcode: 'piperModels',
          text: formatMessage({
            id: 'piCarX.piperModels',
            default: 'set model [MODEL]',
            description: 'piperModels'
          }),
          arguments: {
            MODEL: {
              type: ArgumentType.STRING,
              menu: "piperModels"
            },
            // NATIONS: {
            //   type: ArgumentType.STRING,
            //   menu: 'sayNations',
            // },

            // CHARACTER: {
            //   type: ArgumentType.STRING,
            //   menu: 'aiCharacter',
            // },
            // VOICELEVEL: {
            //   type: ArgumentType.STRING,
            //   menu: 'aiVoiceLevel',
            // },
          }
        },
        // AI的状态
        {
          opcode: 'aiState',
          text: formatMessage({
            id: 'piCarX.aiState',
            default: 'aiState',
            description: 'aiState'
          }),
          blockType: BlockType.REPORTER,
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
        {
          opcode: 'setInputLanguage',
          text: formatMessage({
            id: 'piCarX.setInputLanguage',
            default: 'set input language to [LANGUAGE]',
            description: 'input language.'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            LANGUAGE: {
              type: ArgumentType.STRING,
              menu: 'aiSayLanguage',
            }
          }
        },
        // 听到的内容
        {
          opcode: 'heard',
          text: formatMessage({
            id: 'piCarX.heard',
            default: 'heard',
            description: 'heard'
          }),
          blockType: BlockType.REPORTER,
        },
        // 思考的答案
        {
          opcode: 'thoughtfulAnswers',
          text: formatMessage({
            id: 'piCarX.thoughtfulAnswers',
            default: 'thoughtfulAnswers',
            description: 'thoughtfulAnswers'
          }),
          blockType: BlockType.REPORTER,
        },
        // 设置预设动作
        {
          opcode: 'setPresetAction',
          text: formatMessage({
            id: 'piCarX.setPresetAction',
            default: 'set preset action to [ACTION]',
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
        // 控制Led
        {
          opcode: 'setLedSwitch',
          text: formatMessage({
            id: 'piCarX.setLedSwitch',
            default: 'set led to [ONOFF]',
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
        // 等待按钮按下
        {
          opcode: 'waitButtonPress',
          text: formatMessage({
            id: 'piCarX.waitButtonPress',
            default: 'wait for [BUTTON] button press',
            description: 'wait for button press'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            BUTTON: {
              type: ArgumentType.STRING,
              menu: 'buttonPressed',
              defaultValue: "0"
            }
          }
        },
        // 当按钮按下
        {
          opcode: 'whenButtonPress',
          text: formatMessage({
            id: 'piCarX.whenButtonPress',
            default: 'when [BUTTON] button press',
            description: 'when button press'
          }),
          blockType: BlockType.HAT,
          arguments: {
            BUTTON: {
              type: ArgumentType.STRING,
              menu: 'buttonPressed',
              defaultValue: "0"
            }
          }
        },
        // 按钮按下
        {
          opcode: 'isButtonPress',
          text: formatMessage({
            id: 'piCarX.isButtonPress',
            default: '[BUTTON] is button press',
            description: 'is button press '
          }),
          blockType: BlockType.BOOLEAN,
          arguments: {
            BUTTON: {
              type: ArgumentType.STRING,
              menu: 'buttonPressed',
              defaultValue: "0"
            }
          }

        },
        // 设置摄像头画面
        {
          opcode: 'setRotation',
          text: formatMessage({
            id: 'piCarX.setRotation',
            default: 'set camera image orientation to [ROTATION]',
            description: 'rotation of the camera.'
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
            default: 'set video transparency to [TRANSPARENCY] %',
            description: 'Controls transparency of the video preview layer'
          }),
          arguments: {
            TRANSPARENCY: {
              type: ArgumentType.NUMBER,
              defaultValue: 0
            }
          }
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
        // 3路灰度模块
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
        //  摄像头颜色识别数据
        {
          opcode: 'cameraColorData',
          text: formatMessage({
            id: 'piCarX.cameraColorData',
            default: 'camera color [COLORID]',
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
        // 摄像头人脸识别数据
        {
          opcode: 'cameraFaceData',
          text: formatMessage({
            id: 'piCarX.cameraFaceData',
            default: 'camera face [COLORID]',
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

        // 摄像头交通标志识别数据
        {
          opcode: 'cameraTrafficData',
          text: formatMessage({
            id: 'piCarX.cameraTrafficData',
            default: 'camera traffic',
            description: 'camera traffic'
          }),
          blockType: BlockType.REPORTER,
        },
        // 摄像头二维码识别数据
        {
          opcode: 'cameraQRCodeData',
          text: formatMessage({
            id: 'piCarX.cameraQRCodeData',
            default: 'camera QRCode',
            description: 'camera QRCode'
          }),
          blockType: BlockType.REPORTER,
        }
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
            // {
            //   text: formatMessage({
            //     id: 'piCarX.directions.turnLeft',
            //     default: 'turn left',
            //     description: 'turn left'
            //   }),
            //   value: "turn left"
            // },
            // {
            //   text: formatMessage({
            //     id: 'piCarX.directions.turnRight',
            //     default: 'turn right',
            //     description: 'turn right'
            //   }),
            //   value: "turn right"
            // },
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
            {
              text: formatMessage({
                id: 'piCarX.frontSound.three',
                default: 'horn2',
                description: 'frontSoundList'
              }), value: "2"
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
                default: 'numbuer',
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
                default: 'aaaa',
                description: 'frontSoundList'
              }),
              value: "0"
            },
            {
              text: formatMessage({
                id: 'piCarX.imageThinking',
                default: 'bbbb',
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
            // {
            //   text: formatMessage({
            //     id: 'piCarX.aiBallad',
            //     default: 'ballad',
            //     description: 'ballad'
            //   }), value: "ballad"
            // },
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
        // 人物菜单，根据国家动态生成
        // aiCharacter: {
        //   acceptReporters: true,
        //   items: (args) => {
        //     console.log(args);
        //     const nation = args.NATIONS;
        //     const characters = this.PIPER_MODELS[nation] || {};
        //     return Object.keys(characters).map(character => ({
        //       text: formatMessage({
        //         id: `piCarX.aiAction.${ character } `,
        //         default: character,
        //         description: 'aiAction'
        //       }),
        //       value: character
        //     }));
        //   }
        // },

        // 发音等级菜单，根据人物动态生成
        // aiVoiceLevel: {
        //   acceptReporters: true,
        //   items: (args) => {
        //     const nation = args.NATIONS;
        //     const character = args.AICHARACTER;
        //     const levels = this.PIPER_MODELS[nation]?.[character] || {};
        //     return Object.keys(levels).map(level => ({
        //       text: formatMessage({
        //         id: `piCarX.aiAction.${ level } `,
        //         default: level,
        //         description: 'aiAction'
        //       }),
        //       value: level
        //     }));
        //   }
        // }
      },
      customFieldTypes: {
        aaa: {
          output: "string",
          implementation: () => { console.error("Work!") }
        },
        dynamic_menu: {
          output: "string",
          outputShape: ScratchBlocksConstants.OUTPUT_SHAPE_ROUND,
          implementation: () => { console.error("Work!") }
        }
      }
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
    let distance = this._peripheral.distance / 10;
    distance = Math.round(distance * 10) / 10;
    const level = Cast.toNumber(args.LEVEL);
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
        let distance = this._peripheral.distance / 10;
        distance = Math.round(distance * 10) / 10;
        const level = Cast.toNumber(args.LEVEL);
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
    // let distance = this._peripheral.distance / 10;
    // distance = Math.round(distance * 10) / 10;
    let distance = this._peripheral.distance
    const level = Cast.toNumber(args.LEVEL);
    if (args.OP === ">") {
      return distance > level;
    } else {
      return distance < level;
    }
  }

  // 距离
  distance() {
    // let distance = this._peripheral.distance / 10;
    let distance = this._peripheral.distance;
    return distance;
    // distance = Math.round(distance * 10) / 10;
    // if (distance === 6552.6) {
    //   return null;
    // } else {
    //   return distance;
    // }
  }

  // 设置舵机角度
  settingDirectionAngle(args) {
    let angle = Math.round(Cast.toNumber(args.VALUE));
    this._peripheral.updateServoAngle("steering", angle);
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
    const color = Cast.toNumber(args.COLOR);
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
    return Promise.resolve();
  }

  // 后台音效
  backSoundList(args) {
    const sound = Cast.toNumber(args.BACKSOUND);
    console.log("sound", sound);
    this._peripheral.updateSendBuffer("play_music", sound + 1);
    return Promise.resolve();
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
        let aiError = this._peripheral.receiveBuffer.aiError;
        if (aiState && aiState === "IDLE") {
          resolve();
        } else if (aiState && aiState === "FAILED") {
          let alertData = {
            alertId: "aiError",  // alertId 自定义
            alertType: "STANDARD",
            closeButton: false,
            // iconSpinner: false,
            // iconURI: successImage,
            level: "success",  //success, warn, info
            // showDownload: false,
            // showSaveNow: false,
            content: aiError,
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
      }, 1);
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
    return Promise.resolve();
  }

  // 设置LED开关
  setLedSwitch(args) {
    let ledSwitch = Cast.toNumber(args.ONOFF);
    this._peripheral.updateSendBuffer("led", ledSwitch);
    return Promise.resolve();
  }

  // 等待按钮按下
  waitButtonPress(args) {
    let button = Cast.toNumber(args.BUTTON);
    const buttonKey = button === 0 ? 'usrButtonPressed' : 'rstButtonPressed';
    return new Promise((resolve, reject) => {
      setInterval(() => {
        const buttonPressed = this._peripheral.receiveBuffer[buttonKey];
        if (buttonPressed !== undefined && buttonPressed) {
          resolve();
        }
      }, 1);
    });
  }

  // 当按钮按下
  whenButtonPress(args) {
    let button = Cast.toNumber(args.BUTTON);
    const buttonKey = button === 0 ? 'usrButtonPressed' : 'rstButtonPressed';
    const buttonPressed = this._peripheral.receiveBuffer[buttonKey];
    return buttonPressed !== undefined ? buttonPressed : false;
  }

  isButtonPress(args) {
    let button = Cast.toNumber(args.BUTTON);
    let buttonPressed;
    if (button === 0) {
      buttonPressed = this._peripheral.receiveBuffer.usrButtonPressed;
      return buttonPressed !== undefined ? buttonPressed : false;
    } else {
      buttonPressed = this._peripheral.receiveBuffer.rstButtonPressed;
      return buttonPressed !== undefined ? buttonPressed : false;
    }
  }

  // 画面正反转
  setRotation(args) {
    let rotation = args.ROTATION;
    this.runtime.ioDevices.mjpg.setRotation(rotation);
  }

  // 视频透明度
  setVideoTransparency(args) {
    const transparency = Cast.toNumber(args.TRANSPARENCY);
    this.globalVideoTransparency = transparency;
    this.runtime.ioDevices.mjpg.setPreviewGhost(transparency);
  }

  battery() {
    let batteryVoltage = this._peripheral.batteryVoltage;
    batteryVoltage = MathUtil.clamp(batteryVoltage, 6.2, 8.2);
    batteryPercentage = (batteryVoltage - 6.2) / (8.2 - 6.2) * 100;
    return batteryPercentage ? batteryPercentage.toFixed(2) + "%" : "";
  }

  grayData(args) {
    let data = Cast.toNumber(args.DATAPOSITION);
    const grayData = this._peripheral.receiveData.grayscale3Channel;
    if (data === 0) {
      return grayData ? grayData[0] : "";
    } else if (data === 1) {
      return grayData ? grayData[1] : "";
    } else if (data === 2) {
      return grayData ? grayData[2] : "";
    }
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

  cameraTrafficData() {
    let cameraTrafficData = this._peripheral.receiveData.trafficRecognition;
    const cameraTraffiList = ['none', 'stop', 'right', 'left', 'forward'];
    return cameraTrafficData ? cameraTrafficData.t : "";
    // if (cameraTrafficData >= 0 && cameraTrafficData < cameraTraffiList.length) {
    //   return cameraTraffiList[cameraTrafficData];
    // } else {
    //   return "";
    // }
  };

  cameraQRCodeData() {
    let cameraQRCodeData = this._peripheral.receiveData.QRCodeRecognition;
    // return cameraQRCodeData ? JSON.stringify(cameraQRCodeData) : "";
    return cameraQRCodeData ? cameraQRCodeData.d : "";
  };
}

module.exports = PiCarXBlocks;
