const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const { join } = require('path')

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

/**
 * Options
 */
const OUTPUT_TYPE = 'useInline' // 'useInline' or 'inline'
const SRC_DRICTORY = 'src'
const DIST_DIRECTORY = 'dist'
const DIST_EXTENSION = 'html'
const SVG_WRAP_CLASS_NAME = 'svg'
const SYMBOL_ID_PREFIX = 'svg-'
const NAME_PREFIX = '' // id & class
const DATA_NAME = '' // data attribute key
const DATA_VALUE_TYPE = 'class' // data attribute value type. 'class' or 'id'

const name = process.argv[2]

if (!name) {
  throw new Error(`Not svg name argment.`)
}

;(async () => {
  console.log('[optimize-svg-transform] start')

  const _svg = await readFileAsync(join(SRC_DRICTORY, `${name}.svg`))
  const _text = await readFileAsync(join(SRC_DRICTORY, `${name}.svg.txt`))

  const _data = eval(`(${_text.toString()})`).children[0].children

  if (!_data) {
    throw new Error(`Not find data.`)
  }

  const _containerList = []
  const _symbolList = []
  const _svgString = _svg.toString()
  const _viewBoxStringList = _svgString.match(/viewBox="([^"]*)"/)

  if (!_viewBoxStringList || !('1' in _viewBoxStringList)) return resolve()

  const _viewBox = _viewBoxStringList[1]
  const _size = _viewBox.split(' ')
  const _width = _size[2] - _size[0]
  const _height = _size[3] - _size[1]

  const _svgGroups = _svgString.match(/<g id=".+">\n[\s\S]*?\n<\/g>$/gm)

  for (const group of _svgGroups) {
    const _orignalId = group
      .match(/id="((.+?)(-[0-9])?)"/)[1]
      .replace('_x5F_', '_')
      .replace('_x2A_', '*')
      .replace('_x5E_', '^')
      .replace('_x2C_', ',')
      .replace(/_[0-9]+_$/, '')

    const _svgGroupData = _orignalId.split('*')

    const _nameString = _svgGroupData[0]
    let _class = _nameString
    let _type = _nameString
    let _id = _nameString
    let _symbolId = `${SYMBOL_ID_PREFIX}${name}-${_nameString}`
    if (_nameString.indexOf('_') !== -1) {
      _nameList = _nameString.split('_')
      _class = NAME_PREFIX + _nameList[0]
      _index = _nameList[1]
      _id = `${_class}-${_index}`
      _class += ` ${_id}`
      _symbolId = `${SYMBOL_ID_PREFIX}${name}-${_id}`
      switch (DATA_VALUE_TYPE) {
        case 'class': {
          _type = _class
          break
        }
        case 'id': {
          _type = _id
          break
        }
        default: {
          break
        }
      }
    }

    let _isGroupOrigin = true
    let _origin = null
    if (1 in _svgGroupData) {
      let _originStr = _svgGroupData[1]
      _isGroupOrigin = _originStr.indexOf('^') === -1
      if (!_isGroupOrigin) {
        _originStr = _originStr.replace('^', '')
      }
      _origin = _originStr.split(',').map((val) => Number(val) * 0.01)
    }

    const { x, y, w, h } = _data.find((d) => d.name === _orignalId)

    let _x = 0
    let _y = 0

    if (_isGroupOrigin) {
      const _groupOriginRageX = _origin ? _origin[0] : 0.5
      const _groupOriginRageY = _origin ? 1 - _origin[1] : 0.5
      _x = (Number(x) + w * _groupOriginRageX) / _width
      _y = (_height - Number(y) - h * _groupOriginRageY) / _height
    } else {
      _x = _origin[0]
      _y = _origin[1]
    }

    const _transform = `${_x * 100}% ${_y * 100}%`
    const _style = `width:100%;height:100%;position:absolute;top:0;left:0;transform-origin:${_transform};`

    const _groupStr = group.replace(/\sid=".+?"/g, '')

    let _dataset = ''
    if (DATA_NAME && _type) {
      _dataset = ` data-${DATA_NAME}="${_type}"`
    }

    switch (OUTPUT_TYPE) {
      case 'inline': {
        _containerList.push(
          `\n<div class="${_class}" style="${_style}"${_dataset}>\n<svg viewBox="${_viewBox}">${_groupStr}</svg>\n</div>`
        )
        break
      }
      case 'useInline': {
        _containerList.push(
          `\n<div class="${_class}" style="${_style}"${_dataset}><svg style="width:100%;height:100%;"><use xlink:href="#${_symbolId}"></use></svg></div>`
        )
        _symbolList.push(
          `<symbol id="${_symbolId}" viewBox="${_viewBox}">${_groupStr}</symbol>`
        )
        break
      }
      default: {
        break
      }
    }
  }

  const _paddingTop = `${(_height / _width) * 100}%`
  let _htmlString = ''
  const _containerString = _containerList.join('')

  switch (OUTPUT_TYPE) {
    case 'inline': {
      _htmlString = `<div class="${SVG_WRAP_CLASS_NAME}" style="position:relative;padding-top:${_paddingTop};">${_containerString}\n</div>`
      break
    }
    case 'useInline': {
      const _symbolString = _symbolList
        .join('')
        .replace(/\n/gm, ' ')
        .replace(/\t+/g, '')
        .replace(/>\s+</g, '><')
      _htmlString = `<div class="${SVG_WRAP_CLASS_NAME}" style="position:relative;padding-top:${_paddingTop};">${_containerString}\n</div>\n<svg style="display:none;" xmlns="http://www.w3.org/2000/svg">${_symbolString}</svg>`
      break
    }
    default: {
      break
    }
  }

  const _path = join(DIST_DIRECTORY, `${name}.${DIST_EXTENSION}`)
  await writeFileAsync(_path, _htmlString)
  console.log(`[optimize-svg-transform] create ${_path}`)

  console.log('[optimize-svg-transform] end')
})()
