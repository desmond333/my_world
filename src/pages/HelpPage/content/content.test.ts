import { describe, expect, it } from 'vitest'
import { getHelpContent } from './index'
import { helpEn } from './en'
import { helpRu } from './ru'
import type { HelpSection } from './types'

const collect = (sections: HelpSection[]) => ({
  sections: sections.map((section) => section.id),
  subsections: sections.flatMap((section) => section.subsections.map((subsection) => `${section.id}/${subsection.id}`)),
  ids: sections.flatMap((section) => [section.id, ...section.subsections.map((item) => item.id)]),
})

describe('help content', () => {
  it('returns the language matching the request', () => {
    expect(getHelpContent('ru')).toBe(helpRu)
    expect(getHelpContent('en')).toBe(helpEn)
  })

  it('keeps the section structure identical across languages', () => {
    const ru = collect(helpRu)
    const en = collect(helpEn)

    expect(en.sections).toEqual(ru.sections)
    expect(en.subsections).toEqual(ru.subsections)
  })

  it('has no empty sections or subsections', () => {
    for (const sections of [helpRu, helpEn]) {
      for (const section of sections) {
        expect(section.title.trim(), section.id).not.toBe('')
        expect(section.intro.trim(), section.id).not.toBe('')
        expect(section.subsections.length, section.id).toBeGreaterThan(0)

        for (const subsection of section.subsections) {
          expect(subsection.title.trim(), subsection.id).not.toBe('')
          expect(subsection.blocks.length, subsection.id).toBeGreaterThan(0)
        }
      }
    }
  })

  it('uses unique ids across sections and subsections', () => {
    for (const sections of [helpRu, helpEn]) {
      const ids = collect(sections).ids
      expect(new Set(ids).size, ids.join(', ')).toBe(ids.length)
    }
  })

  it('has no empty text inside blocks', () => {
    for (const sections of [helpRu, helpEn]) {
      for (const section of sections) {
        for (const subsection of section.subsections) {
          for (const block of subsection.blocks) {
            if (block.type === 'text') expect(block.value.trim(), subsection.id).not.toBe('')
            if (block.type === 'list' || block.type === 'steps') expect(block.items.length, subsection.id).toBeGreaterThan(0)
            if (block.type === 'note') {
              expect(block.title.trim(), subsection.id).not.toBe('')
              expect(block.value.trim(), subsection.id).not.toBe('')
            }
            if (block.type === 'keys') {
              expect(block.items.length, subsection.id).toBeGreaterThan(0)
              for (const item of block.items) {
                expect(item.keys.trim(), subsection.id).not.toBe('')
                expect(item.desc.trim(), subsection.id).not.toBe('')
              }
            }
          }
        }
      }
    }
  })
})
