console.log("galaxyRVR")

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const Cast = require('../../util/cast');
const WS = require('../../io/webSocket');
const Color = require('../../util/color');

const Command = {
    CarMoveControl: 0x01,
    RGBControl: 0x02,
    RudderAngle: 0x03,
    Headlights: 0x04,
}

const Sensor = {
    UltrasonicDistance: 0x81,
    IRObstacle: 0x82,
    BatteryVoltage: 0x83,
}

/**
 * GalaxyRVR的图标
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgd2lkdGg9IjQwcHgiPgogIDxyZWN0IHg9IjI1LjI5IiB5PSIxMC4yNiIgd2lkdGg9IjEuNCIgaGVpZ2h0PSI3LjUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MC4wMSAtMTEuOTcpIHJvdGF0ZSg5MCkiLz4KICA8cmVjdCB4PSIyNS44OCIgeT0iOS40NSIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSI3LjUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzOS4yIC0xMi43OSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICMyODFmMTg7Ii8+CiAgPHJlY3QgeD0iMjguNzYiIHk9Ii0uOTQiIHdpZHRoPSIuMzYiIGhlaWdodD0iMTkuNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM3LjgyIC0yMC4wNSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICMyODFmMTg7Ii8+CiAgPHJlY3QgeD0iMjUuODgiIHk9IjExLjA4IiB3aWR0aD0iLjIzIiBoZWlnaHQ9IjcuNTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQwLjgzIC0xMS4xNikgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICM1NDQxMzM7Ii8+CiAgPHJlY3QgeD0iMjEuOTIiIHk9IjkuMDYiIHdpZHRoPSIxIiBoZWlnaHQ9IjYuOTMiLz4KICA8cmVjdCB4PSIyOS4xNiIgeT0iOS4wNiIgd2lkdGg9IjEiIGhlaWdodD0iNi45MyIvPgogIDxwYXRoIGQ9Ik0xMC4yOSwxOC4wMWguNTl2MS41M2gtLjU5Yy0uMTcsMC0uMzEtLjE0LS4zMS0uMzF2LS45MWMwLS4xNywuMTQtLjMxLC4zMS0uMzFaIiBzdHlsZT0iZmlsbDogI2QxZDFkMTsiLz4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xMS4zMiwxMi4xOWguNDF2LjgxaC0uNDFjLS4xLDAtLjE4LS4wOC0uMTgtLjE4di0uNDZjMC0uMSwuMDgtLjE4LC4xOC0uMThaIiBzdHlsZT0iZmlsbDogIzEwMGYxMTsiLz4KICAgIDxwYXRoIGQ9Ik0xNS4xMywxNS45OXYtNC45OHMuODEtLjE4LC44MS0uOTEtLjkxLS42OC0uOTEtLjY4bC0uNDUsLjMycy0uMTQsLjA5LS41LC4wOWgtLjkxdjUuMDhzLjA1LC4xMywuMjMsLjE4di41OXMwLC4zMiwuMTgsLjMyaDEuNTRaIiBzdHlsZT0iZmlsbDogI2UyZTJlMjsgc3Ryb2tlOiAjOWI5YjliOyBzdHJva2UtbWl0ZXJsaW1pdDogMTA7IHN0cm9rZS13aWR0aDogLjI1cHg7Ii8+CiAgICA8cmVjdCB4PSIxMi45NiIgeT0iOS45MiIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSI0Ljg5IiBzdHlsZT0iZmlsbDogIzI4MWYxODsiLz4KICAgIDxyZWN0IHg9IjExLjY5IiB5PSIxMC44MyIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSIzLjA4IiBzdHlsZT0iZmlsbDogIzU0NDEzMzsiLz4KICAgIDxyZWN0IHg9IjExLjkyIiB5PSIxMS4xOSIgd2lkdGg9IjEuMDQiIGhlaWdodD0iMi4zNSIgc3R5bGU9ImZpbGw6ICMxMDBmMTE7Ii8+CiAgPC9nPgogIDxwYXRoIGQ9Ik0xMC44OCwxOS42NmgyMS41MnYtMi4yMnMuMDMtLjQxLS40Ny0uNTlsLTEuMzYtLjgxcy0uMjctLjA1LS42OC0uMDVIMTMuMTZzLS4yLS4wMS0uNjMsLjI0bC0xLjQ3LC44OXMtLjE4LC4xLS4xOCwuNTd2MS45NloiIHN0eWxlPSJmaWxsOiAjZTJlMmUyOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8cGF0aCBkPSJNMTIuMDUsMjEuMzNsMS45OS0uNzJzLjIyLS4wOSwuMzgsMCwuNTEsLjA2LC42OS0uMDQsNi41My0yLjQsNi41My0yLjRjMCwwLC43LS4yNSwuNzktMS4xMSwwLDAtLjAyLS45MywuNjYtMS4xNSwwLDAsLjgxLS4zNiwxLjI3LC40MSwwLDAsLjA5LC4xOCwuMTQsLjQxLDAsMCwuMDksLjc3LC43NywxLDAsMCwyLjgxLC40NSw1LjA3LDIuMzUsMCwwLDEuNTQsMS4yNywyLjQ0LDIuNzYsMCwwLDMuMjYsNC42NSwzLjMzLDQuODIsLjE0LC4zNi0uMTgsMS4zMS0uOTEsMS4zMSwwLDAtLjU0LDAtLjc3LS4zNiwwLDAtMy43LTUuMTgtNC4yOC01LjkxLTEuMzEtMS42My0zLjEyLTIuMzUtMy44OS0yLjYzLS43Mi0uMjUtMS4xMy0uMzYtMi4yNi0uMzYtLjgyLDAtMi4wNCwuNDEtMi4wNCwuNDFsLTMuMjEsMS4xOC0yLjEzLC44MS0xLjIyLC41NHMtLjgxLC40MS0xLjMxLDBjMCwwLS42OC0uNjgtMS4wOS0uNjMsMCwwLS41NCwuMTQtLjgxLC4yN3MtLjUsMC0uNTQtLjI3YzAsMC0uMDktLjQ1LC40MS0uNjhaIiBzdHlsZT0iZmlsbDogI2UyZTJlMjsgc3Ryb2tlOiAjOWI5YjliOyBzdHJva2UtbWl0ZXJsaW1pdDogMTA7IHN0cm9rZS13aWR0aDogLjI1cHg7Ii8+CiAgPHBhdGggZD0iTTQuNzQsMjguOTZsMi4yMS0uODQsMy42My0xLjQycy43Mi0uMTgsMS0uNTlsMi4zOC0yLjZzLjM0LS4yOSwuNy0uMDJjLjM0LC4yNiw3LjE1LDUuNTIsNy4xNSw1LjUyLDAsMCwxLjQ5LDAsMS4xMy0xLjU4bC04LjI2LTYuMjdzLS43Mi0uNTktMS40LC4yM2wtMy4xLDMuMzNzLS40MSwuNDUtLjk1LC41OWwtNS4xNiwxLjlzLS42MywxLjMxLC42OCwxLjc3WiIgc3R5bGU9ImZpbGw6ICNlMmUyZTI7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxwYXRoIGQ9Ik04LjcsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8cGF0aCBkPSJNMjUsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8cGF0aCBkPSJNMzguMjYsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8Y2lyY2xlIGN4PSIyMy41MSIgY3k9IjE2LjgiIHI9Ii4zOCIgc3R5bGU9ImZpbGw6ICNjY2M7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxjaXJjbGUgY3g9IjIzLjUxIiBjeT0iMTguMzkiIHI9Ii4yOSIgc3R5bGU9ImZpbGw6ICNjY2M7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxjaXJjbGUgY3g9IjUuNCIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIyMS42OSIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIzNC45NiIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIxNC4wOSIgY3k9IjIxLjkyIiByPSIuMzgiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KPC9zdmc+`;


/**
 * 控制卡卡设备的链接和设备控制的类
 */
class GalaxyRVR {
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
    }

    dataConverter() {
        // 获取 sendBuffer 数据
        const sendBuffer = this.sendBuffer;
        console.log("onSend读取到的数据：", sendBuffer);
        var buffer = new ArrayBuffer(200);
        let dataview = new DataView(buffer);
        let index = 0;
        dataview.setUint8(index, this.DATA_START_BIT);

        // 数据长度暂时留空
        index += 1;
        dataview.setUint8(index, 0);

        // 和校验暂时留空
        let checksum = 0;
        index += 1;
        dataview.setUint8(index, checksum);
        index += 1;
        dataview.setUint8(index, Command.RGBControl);
        let r, g, b;
        if (sendBuffer.hasOwnProperty("rgb")) {
            r = sendBuffer.rgb.r;
            g = sendBuffer.rgb.g;
            b = sendBuffer.rgb.b;
        } else {
            r = 0;
            g = 0;
            b = 0;
        }
        index += 1;
        dataview.setUint8(index, r);
        index += 1;
        dataview.setUint8(index, g);
        index += 1;
        dataview.setUint8(index, b);
        // 移动
        if (sendBuffer.hasOwnProperty("leftSpeed") && sendBuffer.hasOwnProperty("rightSpeed")) {
            index += 1;
            dataview.setUint8(index, Command.CarMoveControl);
            index += 1;
            dataview.setInt8(index, sendBuffer.leftSpeed);
            index += 1;
            dataview.setInt8(index, sendBuffer.rightSpeed);
        }
        // 舵机
        if (sendBuffer.hasOwnProperty("servoAngle")) {
            index += 1;
            dataview.setUint8(index, Command.RudderAngle);
            index += 1;
            dataview.setInt8(index, sendBuffer.servoAngle);
        }
        // 前照灯
        if (sendBuffer.hasOwnProperty("headlights")) {
            index += 1;
            dataview.setUint8(index, Command.Headlights);
            index += 1;
            dataview.setUint8(index, sendBuffer.headlights);
        }

        if (index < 1) return;

        index += 1;
        dataview.setUint8(index, this.DATA_END_BIT);
        // 计算数据长度
        let dataLength = index + 1 - 4;
        dataview.setUint8(1, dataLength);
        // 计算和校验
        for (let i = 0; i < dataLength; i++) {
            checksum = checksum ^ dataview.getUint8(i + 3);
        }
        dataview.setUint8(2, checksum);
        let resizedBuffer = new ArrayBuffer(index + 1);
        let resizedDataview = new DataView(resizedBuffer);
        for (let i = 0; i < resizedBuffer.byteLength; i++) {
            resizedDataview.setUint8(i, dataview.getUint8(i));
        }
        // console.log("On Send resizedBuffer:", resizedBuffer);
        return resizedBuffer
    }

    onReceive(buffer) {
        const DATA_START_BIT = 0xA0;
        if (!(buffer instanceof ArrayBuffer)) {
            return;
        }
        let dataview = new DataView(buffer);
        if (dataview.byteLength <= 0) {
            console.log("数据长度错误：", dataview.byteLength);
            return;
        }
        if (dataview.getUint8(0) !== DATA_START_BIT) {
            console.log("起始位错误：目标：", DATA_START_BIT, "实际：", dataview.getUint8(0));
            return;
        }
        let receiveBuffer = {};
        for (let i = 1; i < dataview.byteLength; i++) {
            let entityId = dataview.getUint8(i);
            switch (entityId) {
                case Sensor.UltrasonicDistance:
                    i += 1;
                    let distance = dataview.getUint16(i);
                    i += 1;
                    receiveBuffer["distance"] = distance;
                    // console.log("超声波距离", distance);
                    break;
                case Sensor.IRObstacle:
                    i += 1;
                    let irValue = dataview.getUint8(i);
                    let leftSensor = (irValue >> 0) & 0x01;
                    let rightSensor = (irValue >> 1) & 0x01;
                    receiveBuffer["irObstacle"] = { left: leftSensor, right: rightSensor };

                    break;
                case Sensor.BatteryVoltage:
                    i += 1;
                    let BatteryVoltage = dataview.getUint8(i);
                    receiveBuffer["BatteryVoltage"] = BatteryVoltage;
                    break;
                default: break;
            }
        }
        // console.log("receiveBuffer:", receiveBuffer);
        this.receiveBuffer = receiveBuffer;
    }

    sendDataWS() {
        if (this._ws) {
            let data = this.dataConverter();
            this._ws.setSendPayload(data);
        }
    }

    // 设置移动速度
    setSpeed(speed) {
        this.speed = MathUtil.clamp(speed, 0, 100);
    }

    // 移动
    move(direction, speed) {
        if (speed === undefined) speed = this.speed;
        else speed = MathUtil.clamp(speed, 0, 100);
        if (direction === "forward") {
            this.sendBuffer.leftSpeed = speed;
            this.sendBuffer.rightSpeed = speed;
        } else if (direction === "backward") {
            this.sendBuffer.leftSpeed = -speed;
            this.sendBuffer.rightSpeed = -speed;
        } else if (direction === "turn left") {
            this.sendBuffer.leftSpeed = -speed;
            this.sendBuffer.rightSpeed = speed;
        } else if (direction === "turn right") {
            this.sendBuffer.leftSpeed = speed;
            this.sendBuffer.rightSpeed = -speed;
        }
        this.sendDataWS();
    }

    // 设置移动速度和时间
    setDirectionalMovementTime(data) {
        // 控制左右轮速度
        if (data.leftSpeed != undefined && data.rightSpeed != undefined) {
            this.sendBuffer.leftSpeed = MathUtil.clamp(data.leftSpeed, -100, 100);
            this.sendBuffer.rightSpeed = MathUtil.clamp(data.rightSpeed, -100, 100);
        } else {
            this.sendBuffer.leftSpeed = 0;
            this.sendBuffer.rightSpeed = 0;
        }
        this.sendDataWS();
    }

    // 停止移动
    stopMotor() {
        console.log(this.receiveBuffer)
        this.sendBuffer.leftSpeed = 0;
        this.sendBuffer.rightSpeed = 0;
        this.sendDataWS();
    }

    // 设置舵机角度
    setServoAngle(data) {
        this.sendBuffer.servoAngle = data;
        this.sendDataWS();
    }
    // 增加舵机角度
    addServoAngle(data) {
        if (this.sendBuffer.servoAngle) {
            this.sendBuffer.servoAngle += data;
        }
        this.sendDataWS();
    }
    setColor(r, g, b) {
        let rgb = {}
        if (r === undefined && g === undefined && b === undefined) {
            rgb = { r: this.color.r, g: this.color.g, b: this.color.b };
        } else if (g === undefined || b === undefined) {
            rgb = Color.hexToRgb(r);
        } else {
            rgb = { r: r, g: g, b: b };
        }
        this.color = rgb;
        rgb = {
            r: rgb.r * this.brightness / 100,
            g: rgb.g * this.brightness / 100,
            b: rgb.b * this.brightness / 100,
        }
        this.sendBuffer.rgb = rgb;
        this.sendDataWS();
    }
    // 增加亮度
    increaseBrightness(value) {
        this.brightness += value;
        let r = this.sendBuffer.rgb.r;
        let g = this.sendBuffer.rgb.g;
        let b = this.sendBuffer.rgb.b;
        this.setColor(r, g, b);
    }
    // 设置亮度
    setBrightness(value) {
        this.brightness = value;
        let r = this.sendBuffer.rgb.r;
        let g = this.sendBuffer.rgb.g;
        let b = this.sendBuffer.rgb.b;
        this.setColor(r, g, b);
    }
    // 关闭灯条
    turnOffLightStrip() {
        this.sendBuffer.rgb = { r: 0, g: 0, b: 0 };
        this.sendDataWS();
    }
    // 设置摄像头开关
    setCameraSwitch(value) {
        this.cameraSwitch = value;
    }
    // 设置摄像头灯光开关
    setCameraLightSwitch(data) {
        this.sendBuffer.headlights = data ? 1 : 0;
        this.sendDataWS();
    }

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
        this.stopMotor();
        this.turnOffLightStrip();
    }

    /**
     * 扫描周围的设备
     */
    scan() {
        this._ws = new WS(this._runtime, this._extensionId, this.dataConverter(), this.onReceive)
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
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this._ws) {
            this._ws.disconnect();
        }
    }

    /**
     * 获取设备的连接设备信息
     * @return {boolean} 设备的连接状态
     */
    getDeviceInfo() {
        if (this._ws) {
            return this._ws.getDeviceInfo();
        }
    }
    /**
     * 获取设备的连接状态
     * @return {boolean} 设备的连接状态
     */
    isConnected() {
        let connected = false;
        if (this._ws) {
            connected = this._ws.isConnected();
        }
        return connected;
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
    get irObstacle() {
        return this.receiveBuffer.irObstacle;
    }
    get batteryVoltage() {
        return this.receiveBuffer.BatteryVoltage;
    }
}

/**
 * Scratch 3.0 blocks to interact with a Mammoth galaxyRVR peripheral.
 */
class GalaxyRVRBlocks {

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID() {
        return 'galaxyRVR';
    }

    /**
     * Construct a set of Kaka blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new Kaka peripheral instance
        this._peripheral = new GalaxyRVR(this.runtime,
            GalaxyRVRBlocks.EXTENSION_ID);

        // 是否第一次加载
        this.firstInstall = true;
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
        this.videoToggle({
            ONOFF: this.globalVideoState
        });
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        if (this.firstInstall) {
            this.globalVideoState = true;
            this.globalVideoTransparency = 0;
            this.updateVideoDisplay();
            this.firstInstall = false;
        }
        return {
            id: GalaxyRVRBlocks.EXTENSION_ID,
            name: 'galaxyRVR',
            blockIconURI: iconURI,
            showStatusButton: true,
            blocks: [
                // setSpeed
                {
                    opcode: 'setSpeed',
                    text: formatMessage({
                        id: 'galaxyRVR.setSpeed',
                        default: 'set speed to [VALUE] %',
                        description: 'Setting the motor speed'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        },
                    },
                },
                // move
                {
                    opcode: 'move',
                    text: formatMessage({
                        id: 'galaxyRVR.move',
                        default: '[DIRECTION]',
                        description: 'Move in the specified direction'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'directions',
                            defaultValue: "forward"
                        },
                    },
                },
                // moveFor
                {
                    opcode: 'moveFor',
                    text: formatMessage({
                        id: 'galaxyRVR.moveFor',
                        default: '[DIRECTION] for [DURATION] secs',
                        description: 'Move in the specified direction for a set number of seconds'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DIRECTION: {
                            type: ArgumentType.STRING,
                            menu: 'directions',
                            defaultValue: "forward"
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                },
                // moveAt
                {
                    opcode: 'moveAt',
                    text: formatMessage({
                        id: 'galaxyRVR.moveAt',
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
                // moveAtFor
                {
                    opcode: 'moveAtFor',
                    text: formatMessage({
                        id: 'galaxyRVR.moveAtFor',
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
                // ControlMotors
                {
                    opcode: 'controlMotors',
                    text: formatMessage({
                        id: 'galaxyRVR.wheelSpeed.time',
                        default: 'move at left [NOTE]% right [VALUE] % speed for [DURATION] secs',
                        description: 'Separate control of two sets of motors'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NOTE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
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
                        id: 'galaxyRVR.stopMoving',
                        default: 'stop moving',
                        description: 'stopMoving'
                    }),
                    blockType: BlockType.COMMAND,
                },
                // Wait for the ultrasonic distance to reach
                {
                    opcode: 'whenDistance',
                    text: formatMessage({
                        id: 'galaxyRVR.settingUltrasonic.distance',
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
                        id: 'galaxyRVR.settingUltrasonic.wait',
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
                // // Compare ultrasonic distance
                {
                    opcode: 'isDistance',
                    text: formatMessage({
                        id: 'galaxyRVR.settingUltrasonic.dimension',
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
                        id: 'galaxyRVR.settingUltrasonic.sum',
                        default: 'distance in cm',
                        description: 'distance in cm'
                    }),
                    blockType: BlockType.REPORTER,
                },
                // when pin is blocked
                {
                    opcode: 'whenPinBlocked',
                    text: formatMessage({
                        id: 'galaxyRVR.obstacleAvoidance.blocked',
                        default: 'when [AVOIDANCE] IR is blocked',
                        description: 'when pin is blocked'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        AVOIDANCE: {
                            type: ArgumentType.STRING,
                            menu: 'infraredObstacleAvoidance',
                            defaultValue: 'left'
                        },
                    },
                },
                // Wait until pin IR detects an obstacle
                {
                    opcode: 'waitingAvoidance',
                    text: formatMessage({
                        id: 'galaxyRVR.obstacleAvoidance.waitBlocked',
                        default: 'wait until [AVOIDANCE] IR [ISNOT] blocked',
                        description: 'play a certain note for miliseconds'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        AVOIDANCE: {
                            type: ArgumentType.STRING,
                            menu: 'infraredObstacleAvoidance',
                            defaultValue: 'left'
                        },
                        ISNOT: {
                            type: ArgumentType.STRING,
                            menu: 'isNot',
                            defaultValue: 'is not'
                        },
                    },
                },
                // IR state
                {
                    opcode: 'iRState',
                    text: formatMessage({
                        id: 'galaxyRVR.obstacleAvoidance.IR',
                        default: '[AVOIDANCE] IR status',
                        description: 'is blocked'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AVOIDANCE: {
                            type: ArgumentType.STRING,
                            menu: 'infraredObstacleAvoidance',
                            defaultValue: 'left'
                        },
                    },
                },
                // Setting the servo angle
                {
                    opcode: 'settingServoAngle',
                    text: formatMessage({
                        id: 'galaxyRVR.rudder.angle',
                        default: 'set servo angle to [VALUE] degrees',
                        description: 'Setting the servo angle'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 90
                        },
                    },
                },
                // Increase servo angle
                {
                    opcode: 'increaseServoAngle',
                    text: formatMessage({
                        id: 'galaxyRVR.rudder.addAngle',
                        default: 'increase servo angle by [VALUE] degrees',
                        description: 'increaseServoAngle'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        },
                    },
                },

                //  display color
                {
                    opcode: 'setColor',
                    text: formatMessage({
                        id: 'galaxyRVR.lightColor',
                        default: 'display [COLOR]',
                        description: 'display color'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#FF0000'
                        },
                    },
                },
                // display color time
                {
                    opcode: 'displayColorTime',
                    text: formatMessage({
                        id: 'galaxyRVR.lightColor.time',
                        default: 'display [COLOR] for [DURATION] secs',
                        description: 'display color time'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#FF0000'
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                },
                // display color Secs
                {
                    opcode: 'displayColorSecs',
                    text: formatMessage({
                        id: 'galaxyRVR.lightColor.RGB.time',
                        default: 'display R [COLOR1] G [COLOR2] B[COLOR3] for [DURATION] secs',
                        description: 'displayColorSecs'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        COLOR2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        COLOR3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                },
                // display color 
                {
                    opcode: 'displayColor',
                    text: formatMessage({
                        id: 'galaxyRVR.lightColor.RGB',
                        default: 'display R [COLOR1] G [COLOR2] B [COLOR3] ',
                        description: 'displayColor'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        COLOR2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        COLOR3: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                    },
                },
                // Increase light bar brightness
                {
                    opcode: 'increaseLightBrightness',
                    text: formatMessage({
                        id: 'galaxyRVR.lightIntensity',
                        default: 'increase the brightness by [VALUE] %',
                        description: 'Increase light brightness'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    },
                },
                // Setting Brightness
                {
                    opcode: 'settingBrightness',
                    text: formatMessage({
                        id: 'galaxyRVR.settingLightIntensity',
                        default: 'set brightness to [VALUE] %',
                        description: 'settingBrightness'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 80
                        }
                    },
                },
                // Turn off the light bar
                {
                    opcode: 'turnLight',
                    text: formatMessage({
                        id: 'galaxyRVR.offLightBar',
                        default: 'turn the LED strip [ONOFF]',
                        description: 'turn off the light strip'
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
                // Turn on the camera.
                {
                    opcode: 'videoToggle',
                    text: formatMessage({
                        id: 'galaxyRVR.videoToggle',
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
                {
                    opcode: 'setRotation',
                    text: formatMessage({
                        id: 'galaxyRVR.setRotation',
                        default: 'set camera image orientation to [ROTATION]',
                        description: 'rotation of the camera.'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ROTATION: {
                            type: ArgumentType.string,
                            menu: 'rotations',
                            default: 'normal'
                        }
                    }
                },
                {
                    opcode: 'setVideoTransparency',
                    text: formatMessage({
                        id: 'galaxyRVR.setVideoTransparency',
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
                // Turn on the lights of the ESP32 CAM
                {
                    opcode: 'turnLightsESP32',
                    text: formatMessage({
                        id: 'galaxyRVR.openCameraLED',
                        default: 'turn camera LED [ONOFF]',
                        description: 'Turn on the lights of the ESP32 CAM'
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
                // battery
                {
                    opcode: 'battery',
                    text: formatMessage({
                        id: 'galaxyRVR.battery',
                        default: 'battery level',
                        description: 'battery level'
                    }),
                    blockType: BlockType.REPORTER,
                },
            ],
            menus: {
                distanceOps: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.soundLevelOps.gt',
                                default: '>',
                                description: 'greater than'
                            }),
                            value: '>'
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.soundLevelOps.lt',
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
                                id: 'galaxyRVR.directions.forward',
                                default: 'forward',
                                description: 'forward'
                            }),
                            value: "forward"
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.directions.backward',
                                default: 'backward',
                                description: 'backward'
                            }),
                            value: "backward"
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.directions.turnLeft',
                                default: 'turn left',
                                description: 'turn left'
                            }),
                            value: "turn left"
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.directions.turnRight',
                                default: 'turn right',
                                description: 'turn right'
                            }),
                            value: "turn right"
                        },
                    ]
                },
                onOff: {
                    acceptReporters: true,
                    items: [
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.onOff.on',
                                default: 'ON',
                                description: 'Logic on off, on'
                            }), value: "1"
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.onOff.off',
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
                                id: 'galaxyRVR.avoidanceDirection.left',
                                default: 'left',
                                description: 'left'
                            }),
                            value: 'left'
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.avoidanceDirection.right',
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
                                id: 'galaxyRVR.isNot.is',
                                default: 'is',
                                description: 'is'
                            }),
                            value: 'is'
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.isNot.no',
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
                                id: 'galaxyRVR.rotations.normal',
                                default: 'normal',
                                description: 'rotation normal'
                            }), value: "normal"
                        },
                        {
                            text: formatMessage({
                                id: 'galaxyRVR.rotations.inverted',
                                default: 'inverted',
                                description: 'rotation inverted'
                            }), value: "inverted"
                        },
                    ]
                },
            }
        };
    }

    // 设置速度
    setSpeed(args) {
        let value = Math.round(Cast.toNumber(args.VALUE))
        this._peripheral.setSpeed(value);
        return Promise.resolve();
    }

    move(args) {
        let direction = args.DIRECTION;
        this._peripheral.move(direction);
        return Promise.resolve();
    }

    moveFor(args) {
        let direction = args.DIRECTION;
        let time = Math.round(Cast.toNumber(args.DURATION));
        this._peripheral.move(direction);
        return new Promise(resolve => {
            setTimeout(() => {
                this._peripheral.stopMotor();
                resolve();
            }, time * 1000);
        })
    }

    moveAtFor(args) {
        let speed = Math.round(Cast.toNumber(args.VALUE));
        let time = Math.round(Cast.toNumber(args.DURATION));
        let direction = args.DIRECTION;
        this._peripheral.move(direction, speed);
        return new Promise(resolve => {
            setTimeout(() => {
                this._peripheral.stopMotor();
                resolve();
            }, time * 1000);
        })
    }

    moveAt(args) {
        let speed = Math.round(Cast.toNumber(args.VALUE));
        let direction = args.DIRECTION;
        this._peripheral.move(direction, speed);
        return Promise.resolve();
    }

    controlMotors(args) {
        let data = {
            leftSpeed: Math.round(Cast.toNumber(args.NOTE)),
            rightSpeed: Math.round(Cast.toNumber(args.VALUE)),
        }
        let time = Math.round(Cast.toNumber(args.DURATION));
        this._peripheral.setDirectionalMovementTime(data);
        return new Promise(resolve => {
            setTimeout(() => {
                this._peripheral.stopMotor();
                resolve();
            }, time * 1000);
        })
    }

    stopMoving() {
        console.log("stopMoving");
        console.log(this._peripheral.receiveBuffer)
        this._peripheral.stopMotor();
        return Promise.resolve();
    }

    whenDistance(args) {
        let distance = this._peripheral.distance;
        const level = Cast.toNumber(args.LEVEL);
        if (args.OP === ">") {
            return distance > level;
        } else {
            return distance < level;
        }
    }

    waitUtilDistance(args) {
        return new Promise((resolve, reject) => {
            setInterval(() => {
                let distance = this._peripheral.distance;
                const level = Cast.toNumber(args.LEVEL);
                if (args.OP === ">") {
                    if (distance > level) resolve();
                } else {
                    if (distance < level) resolve();
                }
            }, 1);
        });
    }

    isDistance(args) {
        let distance = this._peripheral.distance;
        const level = Cast.toNumber(args.LEVEL);
        if (args.OP === ">") {
            return distance > level;
        } else {
            return distance < level;
        }
    }

    distance() {
        return this._peripheral.distance
    }

    whenPinBlocked(args) {
        let irObstacle = this._peripheral.irObstacle;
        if (args.AVOIDANCE === "left") {
            return irObstacle.left === 0 ? true : false;
        } else {
            return irObstacle.right === 0 ? true : false;
        }
    }

    waitingAvoidance(args) {
        return new Promise((resolve, reject) => {
            setInterval(() => {
                let irObstacle = this._peripheral.irObstacle;
                if (args.AVOIDANCE === "left") {
                    if (irObstacle.left === 0 && args.ISNOT === "is") {
                        resolve();
                    } else if (irObstacle.left === 1 && args.ISNOT === "is not") {
                        resolve();
                    }
                } else {
                    if (irObstacle.right === 0 && args.ISNOT === "is") {
                        resolve();
                    } else if (irObstacle.right === 1 && args.ISNOT === "is not") {
                        resolve();
                    }
                }
            }, 1);
        });
    }

    iRState(args) {
        let irObstacle = this._peripheral.irObstacle;
        if (args.AVOIDANCE === "left") {
            return irObstacle.left === 0 ? true : false;
        } else {
            return irObstacle.right === 0 ? true : false;
        }
    }

    settingServoAngle(args) {
        let angle = Math.round(Cast.toNumber(args.VALUE));
        this._peripheral.setServoAngle(angle);
        return Promise.resolve();
    }

    increaseServoAngle(args) {
        let angle = Math.round(Cast.toNumber(args.VALUE));
        this._peripheral.addServoAngle(angle);
        return Promise.resolve();
    }

    setColor(args) {
        let color = args.COLOR;
        this._peripheral.setColor(color);
    }

    displayColorTime(args) {
        let color = args.COLOR;
        let time = Cast.toNumber(args.DURATION);
        this._peripheral.setColor(color);
        return new Promise(resolve => {
            setTimeout(() => {
                this._peripheral.turnOffLightStrip();
                resolve();
            }, time * 1000);
        })
    }

    displayColorSecs(args) {
        let r = Cast.toNumber(args.COLOR1);
        let g = Cast.toNumber(args.COLOR2);
        let b = Cast.toNumber(args.COLOR3);
        let time = Cast.toNumber(args.DURATION);
        this._peripheral.setColor(r, g, b);
        return new Promise(resolve => {
            setTimeout(() => {
                this._peripheral.turnOffLightStrip();
                resolve();
            }, time * 1000);
        })
    }

    displayColor(args) {
        console.log(args)
        let r = Cast.toNumber(args.COLOR1);
        let g = Cast.toNumber(args.COLOR2);
        let b = Cast.toNumber(args.COLOR3);
        // let data = {
        //     rgb: { r: Cast.toNumber(args.COLOR1), g: Cast.toNumber(args.COLOR2), b: Cast.toNumber(args.COLOR3) },
        // }
        this._peripheral.setColor(r, g, b);
    }

    increaseLightBrightness(args) {
        console.log(args)
        let value = Cast.toNumber(args.VALUE);
        this._peripheral.increaseBrightness(value);
    }

    settingBrightness(args) {
        console.log(args);
        let value = Cast.toNumber(args.VALUE);
        this._peripheral.setBrightness(value);
    }

    turnLight(args) {
        console.log(args)
        const light = Cast.toNumber(args.ONOFF);
        if (light === 0) {
            this._peripheral.turnOffLightStrip();
        } else {
            this._peripheral.setColor();
        }
    }

    videoToggle(args) {
        console.log(args);
        const video = Cast.toNumber(args.ONOFF);
        if (video === 0) {
            this.runtime.ioDevices.mjpg.stop();
        } else {
            // let url = "http://192.168.4.1:9000/mjpg";
            let url = this._peripheral.getDeviceInfo();
            url = url.video;
            this.runtime.ioDevices.mjpg.start(url);
        }
    }

    setRotation(args) {
        let rotation = args.ROTATION;
        this.runtime.ioDevices.mjpg.setRotation(rotation);
    }

    setVideoTransparency(args) {
        const transparency = Cast.toNumber(args.TRANSPARENCY);
        this.globalVideoTransparency = transparency;
        this.runtime.ioDevices.mjpg.setPreviewGhost(transparency);
    }

    turnLightsESP32(args) {
        console.log(args)
        let data = data = Cast.toNumber(args.ONOFF) !== 0;
        this._peripheral.setCameraLightSwitch(data);
    }

    battery() {
        console.log("battery");
        let batteryVoltage = this._peripheral.batteryVoltage;
        return batteryVoltage ? batteryVoltage + "V" : "";
    }
}

module.exports = GalaxyRVRBlocks;