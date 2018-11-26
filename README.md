Optimize SVG transform

# Use Scripts
[Adobe-Export-Scripts](https://github.com/bronzehedwick/Adobe-Export-Scripts)
`Adobe-Export-Scripts-master > Illustrator > Export Layout.jsx`

# Flow

1. Edit SVG file for Adobe Illustrator.
2. Export SVG position and size data, and save SVG.
3. Run this script.

## 1. Edit SVG file for Adobe Illustrator.
Grouped just under one layer.

**Example**
```
Layer 1
  |- <Line>
  |- <Rect>
  |- <Path>
```
To Group

```
Layer 1
  |- <Group>
  |- <Group>
  |- <Group>
```

And change group name. If it is the same name, add _ and specify a sequential number.

**Example**
```
Layer 1
  |- line
  |- circle_1
  |- circle_2
  |- rect_1
  |- rect_2
```

Can change the `transform-origin` by setting after `*`. If not set it will become the center of the group.

### Rules
- Specified in order of `x`, `y` with percentage at the upper left origin. Example: `50,50`.
- To specify it from the parent SVG, add ^ to the prefix. Example: `^50,50`.

**Example**
```
Layer 1
  |- line
  |- circle_1*0,100
  |- circle_2*20,80
  |- rect_1*^0,100
  |- rect_2*^50,50
```

| group name |   target   |  x  |  y  |
| ---------- | ---------- | --- | --- |
| line       | self group | 50  | 50  |
| circle_1   | self group | 0   | 100 |
| circle_2   | self group | 20  | 80  |
| rect_1     | parent SVG | 0   | 100 |
| rect_2     | parent SVG | 50  | 50  |

## 2. Export SVG position and size data, and save SVG.
Run Adobe Illustrator script `Export Layout.jsx`, and save SVG.

## 3. Run this script.
Move svg file and text file to `src` directory.

```
src
  |- [name].svg
  |- [name].txt
```

Run optimize-svg-transform script.

```bash
$ npm run optimize -- [name]
```

Output to `dist` directory.

```
dist
  |- [name].html
```


# Options

## OUTPUT_TYPE
value: string `useInline` or `inline`  
dafault: `useInline`

## SRC_DRICTORY
value: string  
dafault: `src`

## DIST_DIRECTORY
value: string  
dafault: `dist`

## DIST_EXTENSION
value: string  
dafault: `html`

## SVG_WRAP_CLASS_NAME
value: string  
dafault: `svg`

## SYMBOL_ID_PREFIX
value: string  
dafault: `svg-`

## NAME_PREFIX
value: string  
dafault: empty  
id name and class name.

## DATA_NAME
value: string  
dafault: empty  
data attribute key.

## DATA_VALUE_TYPE
value: string `class` or `id`  
dafault: `class`
data attribute value type.
