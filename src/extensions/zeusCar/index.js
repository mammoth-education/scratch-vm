console.log("zeusCar")

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const Cast = require('../../util/cast');
const WS = require('../../io/webSocket');
const Color = require('../../util/color');

const Command = {
  CarMoveCarCentric: 0x01,
  CarMoveFieldCentric: 0x02,
  MotorControl: 0x03,
  RGBControl: 0x04,
  SetCarHeading: 0x05,
  CalibrateCompass: 0x06,
  LineTrackMode: 0x07,
  ObstacleMode: 0x08,
}

const GrayscaleAngle = [-45, 0, 45, 90, "error"];
const GrayscaleOffset = ["left", "center", "right", "error"];

const Sensor = {
  UltrasonicDistance: 0x81,
  IRObstacle: 0x82,
  GrayscaleValue: 0x83,
  GrayscaleState: 0x84,
  CarHeading: 0x85,
  CompassAngle: 0x86,
  CalibrateData: 0x87,
}

/**
 * ZeusCar的图标
 * @type {string}
 */
// eslint-disable-next-line max-len
const iconURI = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iX+WbvuWxgl8xIiBkYXRhLW5hbWU9IuWbvuWxgiAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgd2lkdGg9IjQwcHgiPgogIDxyZWN0IHg9IjI1LjI5IiB5PSIxMC4yNiIgd2lkdGg9IjEuNCIgaGVpZ2h0PSI3LjUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0MC4wMSAtMTEuOTcpIHJvdGF0ZSg5MCkiLz4KICA8cmVjdCB4PSIyNS44OCIgeT0iOS40NSIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSI3LjUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzOS4yIC0xMi43OSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICMyODFmMTg7Ii8+CiAgPHJlY3QgeD0iMjguNzYiIHk9Ii0uOTQiIHdpZHRoPSIuMzYiIGhlaWdodD0iMTkuNjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM3LjgyIC0yMC4wNSkgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICMyODFmMTg7Ii8+CiAgPHJlY3QgeD0iMjUuODgiIHk9IjExLjA4IiB3aWR0aD0iLjIzIiBoZWlnaHQ9IjcuNTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQwLjgzIC0xMS4xNikgcm90YXRlKDkwKSIgc3R5bGU9ImZpbGw6ICM1NDQxMzM7Ii8+CiAgPHJlY3QgeD0iMjEuOTIiIHk9IjkuMDYiIHdpZHRoPSIxIiBoZWlnaHQ9IjYuOTMiLz4KICA8cmVjdCB4PSIyOS4xNiIgeT0iOS4wNiIgd2lkdGg9IjEiIGhlaWdodD0iNi45MyIvPgogIDxwYXRoIGQ9Ik0xMC4yOSwxOC4wMWguNTl2MS41M2gtLjU5Yy0uMTcsMC0uMzEtLjE0LS4zMS0uMzF2LS45MWMwLS4xNywuMTQtLjMxLC4zMS0uMzFaIiBzdHlsZT0iZmlsbDogI2QxZDFkMTsiLz4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xMS4zMiwxMi4xOWguNDF2LjgxaC0uNDFjLS4xLDAtLjE4LS4wOC0uMTgtLjE4di0uNDZjMC0uMSwuMDgtLjE4LC4xOC0uMThaIiBzdHlsZT0iZmlsbDogIzEwMGYxMTsiLz4KICAgIDxwYXRoIGQ9Ik0xNS4xMywxNS45OXYtNC45OHMuODEtLjE4LC44MS0uOTEtLjkxLS42OC0uOTEtLjY4bC0uNDUsLjMycy0uMTQsLjA5LS41LC4wOWgtLjkxdjUuMDhzLjA1LC4xMywuMjMsLjE4di41OXMwLC4zMiwuMTgsLjMyaDEuNTRaIiBzdHlsZT0iZmlsbDogI2UyZTJlMjsgc3Ryb2tlOiAjOWI5YjliOyBzdHJva2UtbWl0ZXJsaW1pdDogMTA7IHN0cm9rZS13aWR0aDogLjI1cHg7Ii8+CiAgICA8cmVjdCB4PSIxMi45NiIgeT0iOS45MiIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSI0Ljg5IiBzdHlsZT0iZmlsbDogIzI4MWYxODsiLz4KICAgIDxyZWN0IHg9IjExLjY5IiB5PSIxMC44MyIgd2lkdGg9Ii4yMyIgaGVpZ2h0PSIzLjA4IiBzdHlsZT0iZmlsbDogIzU0NDEzMzsiLz4KICAgIDxyZWN0IHg9IjExLjkyIiB5PSIxMS4xOSIgd2lkdGg9IjEuMDQiIGhlaWdodD0iMi4zNSIgc3R5bGU9ImZpbGw6ICMxMDBmMTE7Ii8+CiAgPC9nPgogIDxwYXRoIGQ9Ik0xMC44OCwxOS42NmgyMS41MnYtMi4yMnMuMDMtLjQxLS40Ny0uNTlsLTEuMzYtLjgxcy0uMjctLjA1LS42OC0uMDVIMTMuMTZzLS4yLS4wMS0uNjMsLjI0bC0xLjQ3LC44OXMtLjE4LC4xLS4xOCwuNTd2MS45NloiIHN0eWxlPSJmaWxsOiAjZTJlMmUyOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8cGF0aCBkPSJNMTIuMDUsMjEuMzNsMS45OS0uNzJzLjIyLS4wOSwuMzgsMCwuNTEsLjA2LC42OS0uMDQsNi41My0yLjQsNi41My0yLjRjMCwwLC43LS4yNSwuNzktMS4xMSwwLDAtLjAyLS45MywuNjYtMS4xNSwwLDAsLjgxLS4zNiwxLjI3LC40MSwwLDAsLjA5LC4xOCwuMTQsLjQxLDAsMCwuMDksLjc3LC43NywxLDAsMCwyLjgxLC40NSw1LjA3LDIuMzUsMCwwLDEuNTQsMS4yNywyLjQ0LDIuNzYsMCwwLDMuMjYsNC42NSwzLjMzLDQuODIsLjE0LC4zNi0uMTgsMS4zMS0uOTEsMS4zMSwwLDAtLjU0LDAtLjc3LS4zNiwwLDAtMy43LTUuMTgtNC4yOC01LjkxLTEuMzEtMS42My0zLjEyLTIuMzUtMy44OS0yLjYzLS43Mi0uMjUtMS4xMy0uMzYtMi4yNi0uMzYtLjgyLDAtMi4wNCwuNDEtMi4wNCwuNDFsLTMuMjEsMS4xOC0yLjEzLC44MS0xLjIyLC41NHMtLjgxLC40MS0xLjMxLDBjMCwwLS42OC0uNjgtMS4wOS0uNjMsMCwwLS41NCwuMTQtLjgxLC4yN3MtLjUsMC0uNTQtLjI3YzAsMC0uMDktLjQ1LC40MS0uNjhaIiBzdHlsZT0iZmlsbDogI2UyZTJlMjsgc3Ryb2tlOiAjOWI5YjliOyBzdHJva2UtbWl0ZXJsaW1pdDogMTA7IHN0cm9rZS13aWR0aDogLjI1cHg7Ii8+CiAgPHBhdGggZD0iTTQuNzQsMjguOTZsMi4yMS0uODQsMy42My0xLjQycy43Mi0uMTgsMS0uNTlsMi4zOC0yLjZzLjM0LS4yOSwuNy0uMDJjLjM0LC4yNiw3LjE1LDUuNTIsNy4xNSw1LjUyLDAsMCwxLjQ5LDAsMS4xMy0xLjU4bC04LjI2LTYuMjdzLS43Mi0uNTktMS40LC4yM2wtMy4xLDMuMzNzLS40MSwuNDUtLjk1LC41OWwtNS4xNiwxLjlzLS42MywxLjMxLC42OCwxLjc3WiIgc3R5bGU9ImZpbGw6ICNlMmUyZTI7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxwYXRoIGQ9Ik04LjcsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8cGF0aCBkPSJNMjUsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8cGF0aCBkPSJNMzguMjYsMzEuMDFjLS4wOSwuMDktLjE5LC4xOC0uMjksLjI3bC4xMiwuMi0xLjMyLDEuMDEtLjIyLS4zOGMtLjI1LC4wOS0uNTEsLjE2LS43NywuMnYuMjNsLTEuNjUsLjIxdi0uNDVjLS4yNi0uMDUtLjUxLS4xMS0uNzYtLjJsLS4xMiwuMjEtMS41My0uNjQsLjIzLS4zOWMtLjEtLjA5LS4yLS4xNy0uMjktLjI3LS4wOS0uMDktLjE4LS4xOS0uMjctLjI5bC0uMjEsLjEyLTEuMDEtMS4zMiwuMzktLjIzYy0uMDktLjI1LS4xNi0uNS0uMi0uNzZoLS4yNGwtLjIxLTEuNjVoLjQ2Yy4wNS0uMjYsLjExLS41MSwuMi0uNzZsLS4yMS0uMTIsLjY0LTEuNTMsLjM5LC4yM2MuMDktLjEsLjE4LS4yLC4yOC0uMywuMDktLjA5LC4xOC0uMTgsLjI4LS4yNmwtLjEyLS4yMSwxLjMyLTEuMDEsLjIyLC4zOWMuMjUtLjA5LC41MS0uMTYsLjc3LS4yMXYtLjI0bDEuNjUtLjIxdi40NGMuMjYsLjA1LC41MiwuMTEsLjc3LC4ybC4xMi0uMiwxLjUzLC42NC0uMjIsLjM4Yy4xLC4wOSwuMjEsLjE4LC4zLC4yOCwuMDksLjA5LC4xOCwuMTksLjI2LC4yOGwuMi0uMTEsMS4wMSwxLjMyLS4zOCwuMjJjLjA5LC4yNSwuMTYsLjUxLC4yMSwuNzdoLjIzbC4yMSwxLjY1aC0uNDRjLS4wNSwuMjYtLjEyLC41Mi0uMjEsLjc3bC4yLC4xMS0uNjQsMS41NC0uMzgtLjIyYy0uMDksLjEtLjE3LC4yLS4yNywuMjloMFptLTIuNzUtNC44OWMuMzEsLjExLC41OCwuMzIsLjc4LC41OGwxLjE2LS4zMWMtLjEzLS4yNS0uMy0uNDgtLjUxLS42OS0uNC0uNC0uOS0uNjYtMS40Mi0uNzdsLS4wMiwxLjE5Wm0yLjI1LDEuMzJsLTEuMTUsLjMxYzAsLjI1LS4wNywuNDgtLjE3LC42OWwuNzgsLjkzYy4zNi0uNSwuNTUtMS4wOCwuNTUtMS42NywwLS4wOSwwLS4xNy0uMDEtLjI2aDBabS0xLjM0LDIuNjdsLS43NS0uOWMtLjIzLC4xMS0uNDgsLjE3LS43MywuMTctLjEyLDAtLjI0LS4wMS0uMzUtLjA0bC0uNjgsLjk4Yy4zNCwuMTMsLjY5LC4yLDEuMDUsLjIsLjUxLDAsMS4wMi0uMTQsMS40Ny0uNDFoMFptLTMuNDQtLjM4bC42Ni0uOTVjLS4yNC0uMjktLjM5LS42Ny0uMzktMS4wOCwwLDAsMC0uMDIsMC0uMDNsLTEuMS0uMzljLS4wMiwuMTQtLjAzLC4yNy0uMDMsLjQxLDAsLjcyLC4yOCwxLjQ1LC44MywyLC4wMSwuMDEsLjAyLC4wMiwuMDMsLjAzaDBabS0uNDYtMy40N2wxLjExLC4zOWMuMi0uMjUsLjQ4LS40NCwuNzktLjU1bC4wMi0xLjE4Yy0uNTUsLjEtMS4wNywuMzYtMS40OSwuNzgtLjE3LC4xNy0uMzIsLjM2LS40MywuNTZoMFptMi40MiwuNTdjLS40OCwwLS44NywuMzktLjg3LC44N3MuMzksLjg3LC44NywuODcsLjg3LS4zOSwuODctLjg3LS4zOS0uODctLjg3LS44N2gwWm0wLDAiLz4KICA8Y2lyY2xlIGN4PSIyMy41MSIgY3k9IjE2LjgiIHI9Ii4zOCIgc3R5bGU9ImZpbGw6ICNjY2M7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxjaXJjbGUgY3g9IjIzLjUxIiBjeT0iMTguMzkiIHI9Ii4yOSIgc3R5bGU9ImZpbGw6ICNjY2M7IHN0cm9rZTogIzliOWI5Yjsgc3Ryb2tlLW1pdGVybGltaXQ6IDEwOyBzdHJva2Utd2lkdGg6IC4yNXB4OyIvPgogIDxjaXJjbGUgY3g9IjUuNCIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIyMS42OSIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIzNC45NiIgY3k9IjI3LjcxIiByPSIuMjkiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KICA8Y2lyY2xlIGN4PSIxNC4wOSIgY3k9IjIxLjkyIiByPSIuMzgiIHN0eWxlPSJmaWxsOiAjY2NjOyBzdHJva2U6ICM5YjliOWI7IHN0cm9rZS1taXRlcmxpbWl0OiAxMDsgc3Ryb2tlLXdpZHRoOiAuMjVweDsiLz4KPC9zdmc+`;


/**
 * 控制卡卡设备的链接和设备控制的类
 */
class ZeusCar {
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
    this.calibrationState = false;
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
    // RGB
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
    if (sendBuffer.hasOwnProperty("calibration")) {
      if (sendBuffer.calibration) {
        index += 1;
        dataview.setUint8(index, Command.CalibrateCompass);
      }
    }
    // 前照灯
    if (sendBuffer.hasOwnProperty("headlights")) {
      index += 1;
      dataview.setUint8(index, Command.Headlights);
      index += 1;
      dataview.setUint8(index, sendBuffer.headlights);
    }
    if (sendBuffer.hasOwnProperty("move")) {
      index += 1;
      dataview.setUint8(index, Command.CarMoveFieldCentric);
      index += 1;
      dataview.setInt16(index, sendBuffer.move.angle);
      index += 1;
      index += 1;
      dataview.setInt8(index, sendBuffer.move.radius);
      index += 1;
      dataview.setInt16(index, sendBuffer.move.currentAngle);
      index += 1;
    }
    if (sendBuffer.hasOwnProperty("motorControl")) {
      index += 1;
      dataview.setUint8(index, Command.CarMoveFieldCentric);
      index += 1;
      dataview.setUint8(index, sendBuffer.motorControl.leftFront);
      index += 1;
      dataview.setUint8(index, sendBuffer.motorControl.leftRear);
      index += 1;
      dataview.setUint8(index, sendBuffer.motorControl.rightFront);
      index += 1;
      dataview.setUint8(index, sendBuffer.motorControl.rightRear);
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
        case Sensor.GrayscaleValue:
          i += 1;
          let grayscaleValue = dataview.getUint8(i);
          let grayscaleValueArray = [];
          for (let j = 0; j < 8; j++) {
            let bit = (grayscaleValue >> j) & 0x01;
            grayscaleValueArray.push(bit);
          }
          receiveBuffer["grayscaleValue"] = grayscaleValueArray;
          break;
        case Sensor.GrayscaleState:
          i += 1;
          let grayscaleState = dataview.getUint8(i);
          let angle = (grayscaleState >> 0) & 0x07;
          let offset = (grayscaleState >> 3) & 0x03;
          receiveBuffer["grayscaleState"] = { angle: GrayscaleAngle[angle], offset: GrayscaleOffset[offset] };
          break;
        case Sensor.CarHeading:
          i += 1;
          let carHeading = dataview.getInt16(i);
          i += 1;
          receiveBuffer["carHeading"] = carHeading;
          break;
        case Sensor.CompassAngle:
          i += 1;
          let carAngle = dataview.getInt16(i);
          i += 1;
          receiveBuffer["carAngle"] = carAngle;
          break;
        case Sensor.CalibrateData:
          i += 1;
          let calibrateData = dataview.getUint8(i);
          receiveBuffer["compassCalibration"] = calibrateData;
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
    this.sendDataWS();
  }
  // 转弯
  makeTurn(angle, direction) {
    let move = { angle: 0, radius: 0, currentAngle: 0 };
    if (direction === "left") {
      if (angle > 0) {
        move.currentAngle = -angle; // 正数转为负数
      } else if (angle < 0) {
        move.currentAngle = Math.abs(angle); // 负数转为正数
      } else {
        move.currentAngle = 0;
      }
    } else {
      move.currentAngle = angle;
    }
    this.sendBuffer.move = move;
    this.sendDataWS();
  }

  move(angle) {
    if (this.sendBuffer.move) {
      this.sendBuffer.move.radius = this.speed;
      this.sendBuffer.move.angle = angle;
    } else {
      let move = { angle: angle, radius: this.speed, currentAngle: 0 };
      this.sendBuffer.move = move;
    }
    this.sendDataWS();
  }

  motorControl(motorSpeed) {
    this.sendBuffer.motorControl = motorSpeed;
    this.sendDataWS();
  }

  // 停止移动
  stopMotor() {
    if (this.sendBuffer.move) {
      this.sendBuffer.move.radius = 0;
    } else {
      let move = { angle: 0, radius: 0, currentAngle: 0 };
      this.sendBuffer.move = move;
    }
    if (this.sendBuffer.motorControl) {
      let motorControl = { leftFront: 0, rightFront: 0, rightRear: 0, leftRear: 0 };
      this.sendBuffer.motorControl = motorControl;
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
  // 校准
  calibration(data) {
    this.sendBuffer.calibration = data;
    this.sendDataWS();
    setTimeout(() => {
      if (this.receiveBuffer.compassCalibration === 1) {
        this.sendBuffer.calibration = false;
        this.sendDataWS();
      }
    }, 1000)
  }

  /**
   * 获取设备的名称
   * @return {string} 设备名称.
   */
  getReceiveBuffer() {
    return this.isConnected() ? this.receiveBuffer : {};
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
    // console.log('send======', this.sendBuffer)
    if (!this.isConnected()) return Promise.resolve();
    if (this._ws) {

    }
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
  get carAngle() {
    return this.receiveBuffer.carAngle;
  }
  get carHeading() {
    return this.receiveBuffer.carHeading;
  }
}

/**
 * Scratch 3.0 blocks to interact with a Mammoth zeusCar peripheral.
 */
class ZeusCarBlocks {

  /**
   * @return {string} - the ID of this extension.
   */
  static get EXTENSION_ID() {
    return 'zeusCar';
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
    this._peripheral = new ZeusCar(this.runtime,
      ZeusCarBlocks.EXTENSION_ID);

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
      id: ZeusCarBlocks.EXTENSION_ID,
      name: 'zeusCar',
      blockIconURI: iconURI,
      showStatusButton: true,
      blocks: [
        // setSpeed
        {
          opcode: 'setSpeed',
          text: formatMessage({
            id: 'zeusCar.setSpeed',
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
        // rotateTo
        {
          opcode: 'rotateTo',
          text: formatMessage({
            id: 'zeusCar.rotateTo',
            default: 'turn to 🧭 [ANGLE] degrees ',
            description: 'rotate to a specific angle on the compass'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: {
              type: ArgumentType.ANGLE,
              defaultValue: 80
            },
          },
        },
        // leftDegrees
        {
          opcode: 'leftDegrees',
          text: formatMessage({
            id: 'zeusCar.leftDegrees',
            default: 'turn ↺ [ANGLE] degrees',
            description: 'Turn left degrees'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: {
              type: ArgumentType.ANGLE,
              defaultValue: 0
            },
          },
        },
        // rightDegrees
        {
          opcode: 'rightDegrees',
          text: formatMessage({
            id: 'zeusCar.rightDegrees',
            default: 'turn ↻ [ANGLE] degrees',
            description: 'Turn right degrees'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: {
              type: ArgumentType.ANGLE,
              defaultValue: 0
            },
          },
        },
        // moveRotateFor
        {
          opcode: 'moveRotateFor',
          text: formatMessage({
            id: 'zeusCar.moveRotateFor',
            default: 'move at [ANGLE] degrees for [TIME] secs',
            description: 'Rotate to the angle in the specified seconds'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: {
              type: ArgumentType.ANGLE,
              defaultValue: 0
            },
            TIME: {
              type: ArgumentType.NUMBER,
              defaultValue: 1
            }
          },
        },
        // moveRotate
        {
          opcode: 'moveRotate',
          text: formatMessage({
            id: 'zeusCar.moveRotate',
            default: 'move at [ANGLE] degrees',
            description: 'Move to the specified angle'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: {
              type: ArgumentType.ANGLE,
              defaultValue: 0
            }
          },
        },
        // faceAngle
        {
          opcode: 'faceAngle',
          text: formatMessage({
            id: 'zeusCar.faceAngle',
            default: 'facing [ANGLE] degrees',
            description: 'Face the compass angle'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            ANGLE: {
              type: ArgumentType.ANGLE,
              defaultValue: 0
            }
          },
        },
        // motorSpeedFor
        {
          opcode: 'motorSpeedFor',
          text: formatMessage({
            id: 'zeusCar.motorSpeedFor',
            default: 'move at LF [MOTOR1] RF[MOTOR2] RR [MOTOR3] LR [MOTOR4] % speed for [TIME] secs',
            description: 'Setting the motor travel speed time'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            MOTOR1: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            MOTOR2: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            MOTOR3: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            MOTOR4: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            TIME: {
              type: ArgumentType.NUMBER,
              defaultValue: 1
            }
          },
        },
        // motorSpeed
        {
          opcode: 'motorSpeed',
          text: formatMessage({
            id: 'zeusCar.motorSpeed',
            default: 'move at LF [MOTOR1] RF[MOTOR2] RR [MOTOR3] LR [MOTOR4] % speed',
            description: 'Setting the motor travel speed'
          }),
          blockType: BlockType.COMMAND,
          arguments: {
            MOTOR1: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            MOTOR2: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            MOTOR3: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            },
            MOTOR4: {
              type: ArgumentType.NUMBER,
              defaultValue: 50
            }
          },
        },

        // stopMoving
        {
          opcode: 'stopMoving',
          text: formatMessage({
            id: 'zeusCar.stopMoving',
            default: 'stop moving',
            description: 'stopMoving'
          }),
          blockType: BlockType.COMMAND,
        },
        // Wait for the ultrasonic distance to reach
        {
          opcode: 'whenDistance',
          text: formatMessage({
            id: 'zeusCar.settingUltrasonic.distance',
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
            id: 'zeusCar.settingUltrasonic.wait',
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
            id: 'zeusCar.settingUltrasonic.dimension',
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
            id: 'zeusCar.settingUltrasonic.sum',
            default: 'distance in cm',
            description: 'distance in cm'
          }),
          blockType: BlockType.REPORTER,
        },
        // when pin is blocked
        {
          opcode: 'whenPinBlocked',
          text: formatMessage({
            id: 'zeusCar.obstacleAvoidance.blocked',
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
            id: 'zeusCar.obstacleAvoidance.waitBlocked',
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
            id: 'zeusCar.obstacleAvoidance.IR',
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


        // existLine
        {
          opcode: 'existLine',
          text: formatMessage({
            id: 'zeusCar.existLine',
            default: 'when on line',
            description: 'when on line'
          }),
          blockType: BlockType.HAT,
        },
        // outLine
        {
          opcode: 'outLine',
          text: formatMessage({
            id: 'zeusCar.outLine',
            default: 'when out of line ',
            description: 'when out of line '
          }),
          blockType: BlockType.HAT,
        },
        // WaitForLine
        {
          opcode: 'waitLineFor',
          text: formatMessage({
            id: 'zeusCar.waitLineFor',
            default: 'wait until detects a line',
            description: 'wait until detects a line'
          }),
          blockType: BlockType.COMMAND,
        },
        // detected line
        {
          opcode: 'detectedLine',
          text: formatMessage({
            id: 'zeusCar.detectedLine',
            default: 'detects a line',
            description: 'detects a line'
          }),
          blockType: BlockType.COMMAND,
        },
        // GrayscaleSensor
        {
          opcode: 'grayscaleSensor',
          text: formatMessage({
            id: 'zeusCar.grayscaleSensor',
            default: '[VALUE] grayscale sensor status',
            description: 'grayscaleSensor'
          }),
          blockType: BlockType.REPORTER,
          arguments: {
            VALUE: {
              type: ArgumentType.NUMBER,
              defaultValue: 1
            },
          },
        },
        // LineAngles
        {
          opcode: 'lineAngles',
          text: formatMessage({
            id: 'zeusCar.lineAngles',
            default: 'line angle',
            description: 'line angle'
          }),
          blockType: BlockType.REPORTER,
        },
        // line offset
        {
          opcode: 'lineOffset',
          text: formatMessage({
            id: 'zeusCar.lineOffset',
            default: 'lineOffset',
            description: 'lineOffset'
          }),
          blockType: BlockType.REPORTER,
        },
        // compass degrees
        {
          opcode: 'compassDegrees',
          text: formatMessage({
            id: 'zeusCar.compassDegrees',
            default: 'compass degrees',
            description: 'compass degrees'
          }),
          blockType: BlockType.REPORTER,
        },




        //  display color
        {
          opcode: 'setColor',
          text: formatMessage({
            id: 'zeusCar.lightColor',
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
            id: 'zeusCar.lightColor.time',
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
            id: 'zeusCar.lightColor.RGB.time',
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
            id: 'zeusCar.lightColor.RGB',
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
            id: 'zeusCar.lightIntensity',
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
            id: 'zeusCar.settingLightIntensity',
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
            id: 'zeusCar.offLightBar',
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
            id: 'zeusCar.videoToggle',
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
            id: 'zeusCar.setRotation',
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
            id: 'zeusCar.setVideoTransparency',
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
            id: 'zeusCar.openCameraLED',
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
            id: 'zeusCar.battery',
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
                id: 'zeusCar.soundLevelOps.gt',
                default: '>',
                description: 'greater than'
              }),
              value: '>'
            },
            {
              text: formatMessage({
                id: 'zeusCar.soundLevelOps.lt',
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
                id: 'zeusCar.directions.forward',
                default: 'forward',
                description: 'forward'
              }),
              value: "forward"
            },
            {
              text: formatMessage({
                id: 'zeusCar.directions.backward',
                default: 'backward',
                description: 'backward'
              }),
              value: "backward"
            },
            {
              text: formatMessage({
                id: 'zeusCar.directions.turnLeft',
                default: 'turn left',
                description: 'turn left'
              }),
              value: "turn left"
            },
            {
              text: formatMessage({
                id: 'zeusCar.directions.turnRight',
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
                id: 'zeusCar.onOff.on',
                default: 'ON',
                description: 'Logic on off, on'
              }), value: "1"
            },
            {
              text: formatMessage({
                id: 'zeusCar.onOff.off',
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
                id: 'zeusCar.avoidanceDirection.left',
                default: 'left',
                description: 'left'
              }),
              value: 'left'
            },
            {
              text: formatMessage({
                id: 'zeusCar.avoidanceDirection.right',
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
                id: 'zeusCar.isNot.is',
                default: 'is',
                description: 'is'
              }),
              value: 'is'
            },
            {
              text: formatMessage({
                id: 'zeusCar.isNot.no',
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
                id: 'zeusCar.rotations.normal',
                default: 'normal',
                description: 'rotation normal'
              }), value: "normal"
            },
            {
              text: formatMessage({
                id: 'zeusCar.rotations.inverted',
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
    let value = Math.round(Cast.toNumber(args.VALUE));
    this._peripheral.setSpeed(value);
    return Promise.resolve();
  }

  // 设置旋转到罗盘角度
  rotateTo(args) {
    console.log(args);
    return new Promise((resolve, reject) => {
      let angle = Math.round(Cast.toNumber(args.ANGLE));
      let carAngle = this._peripheral.receiveBuffer.carAngle;
      angle += carAngle;
      this._peripheral.makeTurn(angle);
      resolve();
    });
  }
  // 左转角度
  leftDegrees(args) {
    let angle = Math.round(Cast.toNumber(args.ANGLE))
    this._peripheral.makeTurn(angle, "left");
    return Promise.resolve();
  }
  // 右转角度
  rightDegrees(args) {
    let angle = Math.round(Cast.toNumber(args.ANGLE))
    this._peripheral.makeTurn(angle, "right");
    return Promise.resolve();
  }

  moveRotateFor(args) {
    let angle = Cast.toNumber(args.ANGLE);
    let time = Cast.toNumber(args.TIME);
    this._peripheral.move(angle);
    return new Promise(resolve => {
      setTimeout(() => {
        this._peripheral.stopMotor();
        resolve();
      }, time * 1000);
    })
  }
  // 移动角度
  moveRotate(args) {
    console.log(args);
    let angle = Cast.toNumber(args.ANGLE);
    this._peripheral.move(angle);
  }
  // 面向罗盘角度
  faceAngle(args) {
    let angle = Math.round(Cast.toNumber(args.ANGLE));
    let carAngle = this._peripheral.receiveBuffer.carAngle;
    angle += carAngle;
    this._peripheral.makeTurn(angle);
  }
  // 电机移动速度时间
  motorSpeedFor(args) {
    console.log(args);
    let leftFront = Cast.toNumber(args.MOTOR1);
    let rightFront = Cast.toNumber(args.MOTOR2);
    let rightRear = Cast.toNumber(args.MOTOR3);
    let leftRear = Cast.toNumber(args.MOTOR4);
    let time = Cast.toNumber(args.TIME);
    let motorSpeed = { leftFront: leftFront, rightFront: rightFront, rightRear: rightRear, leftRear: leftRear };
    this._peripheral.motorControl(motorSpeed);
    return new Promise(resolve => {
      setTimeout(() => {
        this._peripheral.stopMotor();
        resolve();
      }, time * 1000);
    })
  }
  // 电机移动速度
  motorSpeed(args) {
    console.log(args);
    let leftFront = Cast.toNumber(args.MOTOR1);
    let rightFront = Cast.toNumber(args.MOTOR2);
    let rightRear = Cast.toNumber(args.MOTOR3);
    let leftRear = Cast.toNumber(args.MOTOR4);
    let motorSpeed = { leftFront: leftFront, rightFront: rightFront, rightRear: rightRear, leftRear: leftRear };
    this._peripheral.motorControl(motorSpeed);
  }

  stopMoving() {
    console.log("stopMoving");
    console.log(this._peripheral.receiveBuffer)
    this._peripheral.stopMotor();
    return Promise.resolve();
  }

  // 当距离
  whenDistance(args) {
    let distance = this._peripheral.distance;
    const level = Cast.toNumber(args.LEVEL);
    if (args.OP === ">") {
      return distance > level;
    } else {
      return distance < level;
    }
  }

  // 等待距离
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

  // 距离判断
  isDistance(args) {
    let distance = this._peripheral.distance;
    const level = Cast.toNumber(args.LEVEL);
    if (args.OP === ">") {
      return distance > level;
    } else {
      return distance < level;
    }
  }

  // 获取距离
  distance() {
    return this._peripheral.distance
  }

  // 当IR被遮挡
  whenPinBlocked(args) {
    let irObstacle = this._peripheral.irObstacle;
    if (args.AVOIDANCE === "left") {
      return irObstacle.left === 0 ? true : false;
    } else {
      return irObstacle.right === 0 ? true : false;
    }
  }

  // 等待 IR 遮挡
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

  // IR 状态
  iRState(args) {
    let irObstacle = this._peripheral.irObstacle;
    if (args.AVOIDANCE === "left") {
      return irObstacle.left === 0 ? true : false;
    } else {
      return irObstacle.right === 0 ? true : false;
    }
  }

  // 在线上
  existLine() {
    let grayscaleValue = this._peripheral.receiveBuffer.grayscaleValue;
    let lineAngles = this._peripheral.receiveBuffer.grayscaleState.angle;
    let lineOffset = this._peripheral.receiveBuffer.grayscaleState.offset;
    if (lineAngles !== "error" && lineOffset !== "error") {
      return true;
    } else {
      return false;
    }
    // return grayscaleValue.some(element => element !== 0);
  }
  // 出线
  outLine() {
    let grayscaleValue = this._peripheral.receiveBuffer.grayscaleValue;
    let lineAngles = this._peripheral.receiveBuffer.grayscaleState.angle;
    let lineOffset = this._peripheral.receiveBuffer.grayscaleState.offset;
    if (lineAngles == "error" && lineOffset == "error") {
      return true;
    } else {
      return false;
    }
    // return grayscaleValue.every(value => value === 0);
  }
  // 等待有线
  waitLineFor() {
    console.log("waitLineFor");
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let grayscaleValue = this._peripheral.receiveBuffer.grayscaleValue;
        let lineAngles = this._peripheral.receiveBuffer.grayscaleState.angle;
        let lineOffset = this._peripheral.receiveBuffer.grayscaleState.offset;
        if (lineAngles !== "error" && lineOffset !== "error") {
          resolve();
        }
        // if (grayscaleValue.some(element => element !== 0)) {
        //   resolve();
        // }
      }, 1);
    });
  }
  // 检测到线
  detectedLine() {
    let grayscaleValue = this._peripheral.receiveBuffer.grayscaleValue;
    // return grayscaleValue.some(element => element !== 0);
    let lineAngles = this._peripheral.receiveBuffer.grayscaleState.angle;
    let lineOffset = this._peripheral.receiveBuffer.grayscaleState.offset;
    if (lineAngles !== "error" && lineOffset !== "error") {
      return true;
    } else {
      return false;
    }
  }
  // 灰度传感器
  grayscaleSensor(args) {
    let value = Cast.toNumber(args.VALUE);
    let grayscaleValue = this._peripheral.receiveBuffer.grayscaleValue;
    if (value >= 1 && value <= 8) {
      return grayscaleValue[value - 1];
    } else {
      throw new Error("Index should be between 1 and 8.");
    }
  }
  // 线的角度
  lineAngles() {
    console.log("lineAngles");
    let lineAngles = this._peripheral.receiveBuffer.grayscaleState.angle;
    if (lineAngles) {
      return lineAngles;
    } else {
      return 0;
    }
  }
  // 线的偏移
  lineOffset() {
    console.log("lineOffset");
    let lineOffset = this._peripheral.receiveBuffer.grayscaleState.offset;
    return lineOffset;
  }
  // 指南针朝向度
  compassDegrees() {
    console.log("compassDegrees");
    let compassDegrees = this._peripheral.receiveBuffer.carAngle;
    return compassDegrees;
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

  // 增加亮度
  increaseLightBrightness(args) {
    console.log(args)
    let value = Cast.toNumber(args.VALUE);
    this._peripheral.increaseBrightness(value);
  }

  // 设置亮度
  settingBrightness(args) {
    console.log(args);
    let value = Cast.toNumber(args.VALUE);
    this._peripheral.setBrightness(value);
  }

  // 灯条开关
  turnLight(args) {
    console.log(args)
    const light = Cast.toNumber(args.ONOFF);
    if (light === 0) {
      this._peripheral.turnOffLightStrip();
    } else {
      this._peripheral.setColor();
    }
  }

  // 视频开关
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

  // 设置画面旋转
  setRotation(args) {
    let rotation = args.ROTATION;
    this.runtime.ioDevices.mjpg.setRotation(rotation);
  }

  // 设置视频透明度
  setVideoTransparency(args) {
    const transparency = Cast.toNumber(args.TRANSPARENCY);
    this.globalVideoTransparency = transparency;
    this.runtime.ioDevices.mjpg.setPreviewGhost(transparency);
  }

  // 打开灯光
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

module.exports = ZeusCarBlocks;
