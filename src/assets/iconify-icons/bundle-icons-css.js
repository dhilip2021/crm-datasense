import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Iconify utilities
import {
  cleanupSVG,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO
} from '@iconify/tools'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

// Helpers
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sources = {
  json: [
    {
      filename: join(__dirname, '../../../../node_modules/@iconify/json/json/ri.json')
    },
    {
      filename: join(__dirname, '../../../../node_modules/@iconify/json/json/line-md.json'),
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ],
  icons: [
    'bx-basket',
    'bi-airplane-engines',
    'tabler-anchor',
    'uit-adobe-alt',
    'twemoji-auto-rickshaw'
  ],
  svg: []
}

const target = join(__dirname, 'generated-icons.css')

;(async function () {
  try {
    await fs.mkdir(dirname(target), { recursive: true })
  } catch {}

  const allIcons = []

  // Add icons from sources.icons to sources.json
  if (sources.icons) {
    const sourcesJSON = sources.json ?? (sources.json = [])
    const organized = organizeIconsList(sources.icons)

    for (const prefix in organized) {
      const filename = join(__dirname, `../../../../node_modules/@iconify/json/json/${prefix}.json`)

      sourcesJSON.push({
        filename,
        icons: organized[prefix]
      })
    }
  }

  // Load JSON icons
  if (sources.json) {
    for (const item of sources.json) {
      const filename = typeof item === 'string' ? item : item.filename
      const raw = await fs.readFile(filename, 'utf8')
      const content = JSON.parse(raw)

      if (typeof item !== 'string' && item.icons?.length) {
        const filtered = getIcons(content, item.icons)

        if (!filtered) throw new Error(`Missing icons in ${filename}`)
        allIcons.push(filtered)
      } else {
        allIcons.push(content)
      }
    }
  }

  // Load SVG icons
  if (sources.svg) {
    for (const source of sources.svg) {
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix
      })

      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return
        const svg = iconSet.toSVG(name)

        if (!svg) return iconSet.remove(name)

        try {
          await cleanupSVG(svg)

          if (source.monotone) {
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              }
            })
          }

          await runSVGO(svg)
        } catch (err) {
          console.error(`Error parsing ${name}:`, err)
          iconSet.remove(name)
          
          return
        }

        iconSet.fromSVG(name, svg)
      })

      allIcons.push(iconSet.export())
    }
  }

  // Generate CSS
  const css = allIcons
    .map(set => getIconsCSS(set, Object.keys(set.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n')

  await fs.writeFile(target, css, 'utf8')
  console.log(`✅ Icon CSS saved to ${target}`)
})().catch(console.error)

// Helper
function organizeIconsList(icons) {
  const sorted = {}

  icons.forEach(icon => {
    const { prefix, name } = stringToIcon(icon) || {}

    if (!prefix || !name) return
    if (!sorted[prefix]) sorted[prefix] = []
    if (!sorted[prefix].includes(name)) sorted[prefix].push(name)
  })

  return sorted
}
