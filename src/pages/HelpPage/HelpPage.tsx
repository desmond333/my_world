import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Briefcase,
  Cloud,
  FileText,
  HelpCircle,
  LayoutGrid,
  PawPrint,
  Rocket,
  Search,
  Settings,
  Shapes,
  ShoppingBag,
  Sun,
  Users,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getHelpContent, type HelpBlock, type HelpNoteTone, type HelpSection, type HelpSectionKey } from './content'
import { useTranslation } from '../../lib/i18n'
import { AppFooter, AppTopbar } from '../../widgets'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, ScrollArea } from '../../shared/ui'
import './HelpPage.css'

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  layout: LayoutGrid,
  sun: Sun,
  briefcase: Briefcase,
  shapes: Shapes,
  users: Users,
  file: FileText,
  paw: PawPrint,
  store: ShoppingBag,
  cloud: Cloud,
  gear: Settings,
  help: HelpCircle,
}

const NOTE_LABEL: Record<HelpNoteTone, string> = {
  info: 'help.info',
  warn: 'help.warning',
  success: 'help.good',
}

const blockTexts = (block: HelpBlock): string[] => {
  if (block.type === 'text') return [block.value]
  if (block.type === 'list' || block.type === 'steps') return block.items
  if (block.type === 'note') return [block.title, block.value]
  return block.items.map((item) => `${item.keys} ${item.desc}`)
}

export const HelpPage = () => {
  const { t, lang } = useTranslation()
  const sections = useMemo(() => getHelpContent(lang), [lang])

  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<HelpSectionKey>(sections[0]?.id ?? 'start')
  const [openIds, setOpenIds] = useState<HelpSectionKey[]>(() => (sections[0] ? [sections[0].id] : []))

  const normalized = query.trim().toLowerCase()

  const shownSections: HelpSection[] = useMemo(() => {
    if (!normalized) return sections

    return sections
      .map((section) => {
        const subsections = section.subsections
          .map((subsection) => {
            const ownText = `${subsection.title} ${subsection.blocks.flatMap(blockTexts).join(' ')}`
            if (ownText.toLowerCase().includes(normalized)) return subsection

            const blocks = subsection.blocks.filter((block) => blockTexts(block).join(' ').toLowerCase().includes(normalized))

            return { ...subsection, blocks }
          })
          .filter((subsection) => subsection.blocks.length > 0)

        return { ...section, subsections }
      })
      .filter((section) => section.subsections.length > 0)
  }, [sections, normalized])

  const matchesCount = normalized ? shownSections.reduce((sum, section) => sum + section.subsections.length, 0) : sections.length

  const highlightedId: HelpSectionKey | null =
    activeId && shownSections.some((section) => section.id === activeId) ? activeId : (shownSections[0]?.id ?? null)

  const accordionValue = normalized ? shownSections.map((section) => section.id) : openIds

  useEffect(() => {
    const elements = shownSections
      .map((section) => document.querySelector<HTMLElement>(`[data-section="${section.id}"]`))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        const first = visible[0]?.target.getAttribute('data-section')
        if (first) setActiveId(first as HelpSectionKey)
      },
      { rootMargin: '-140px 0px -60% 0px', threshold: 0 },
    )

    elements.forEach((element) => observer.observe(element))

    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const last = shownSections[shownSections.length - 1]?.id
      if (atBottom && last) setActiveId((prev) => (prev === last ? prev : last))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [shownSections])

  const scrollTo = (id: HelpSectionKey) => {
    const el = document.querySelector<HTMLElement>(`[data-section="${id}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  const handleAccordionChange = (value: string[]) => {
    if (normalized) return
    setOpenIds(value as HelpSectionKey[])
  }

  const renderBlock = (block: HelpBlock, key: string) => {
    if (block.type === 'text') {
      return (
        <p key={key} className="help-p">
          {block.value}
        </p>
      )
    }

    if (block.type === 'list') {
      return (
        <ul key={key} className="help-list">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )
    }

    if (block.type === 'steps') {
      return (
        <ol key={key} className="help-steps">
          {block.items.map((item, index) => (
            <li key={index}>
              <span className="help-step-num">{index + 1}</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )
    }

    if (block.type === 'keys') {
      return (
        <ul key={key} className="help-keys">
          {block.items.map((item, index) => (
            <li key={index}>
              <kbd>{item.keys}</kbd>
              <span>{item.desc}</span>
            </li>
          ))}
        </ul>
      )
    }

    return (
      <div key={key} className={`help-note is-${block.tone}`}>
        <strong>{t(NOTE_LABEL[block.tone], NOTE_LABEL[block.tone])}</strong>
        <p>{block.value}</p>
      </div>
    )
  }

  return (
    <main className="page-shell">
      <AppTopbar />

      <div className="help-layout">
        <aside className="help-side">
          <div className="help-side-head">
            <BookOpen size={18} />
            <strong>{t('help.onThisPage')}</strong>
          </div>

          <ScrollArea className="help-side-scroll">
            <nav className="help-side-nav">
              {shownSections.map((section) => {
                const Icon = ICONS[section.icon] ?? HelpCircle
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`help-side-link${highlightedId === section.id ? ' is-active' : ''}`}
                    onClick={() => scrollTo(section.id)}
                  >
                    <Icon size={15} />
                    <span>{section.title}</span>
                  </button>
                )
              })}
            </nav>
          </ScrollArea>

          <div className="help-side-count">{t('help.readTime', undefined, { count: matchesCount })}</div>
        </aside>

        <div className="help-main">
          <header className="help-head">
            <p className="eyebrow">
              <BookOpen size={15} /> {t('help.nav')}
            </p>
            <h1>{t('help.title')}</h1>
            <p className="intro">{t('help.subtitle')}</p>

            <div className="help-search">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('help.search.placeholder')}
                aria-label={t('help.search.placeholder')}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label={t('help.search.clear')}>
                  <X size={15} />
                </button>
              )}
            </div>

            {normalized && (
              <p className="help-search-status">
                {matchesCount > 0 ? t('help.search.results', undefined, { count: matchesCount }) : t('help.search.empty')}
                {matchesCount === 0 && <span className="help-search-hint">{t('help.search.hint')}</span>}
              </p>
            )}
          </header>

          <div className="help-body">
            {shownSections.length === 0 ? (
              <div className="help-empty">
                <Search size={28} />
                <p>{t('help.search.empty')}</p>
                <span>{t('help.search.hint')}</span>
              </div>
            ) : (
              <Accordion type="multiple" value={accordionValue} onValueChange={handleAccordionChange} className="help-body">
                {shownSections.map((section) => {
                  const Icon = ICONS[section.icon] ?? HelpCircle

                  return (
                    <AccordionItem
                      key={section.id}
                      value={section.id}
                      className="help-section"
                      data-section={section.id}
                      id={`help-${section.id}`}
                    >
                      <AccordionTrigger className="help-section-head">
                        <span className="help-section-icon">
                          <Icon size={18} />
                        </span>
                        <span className="help-section-title">{section.title}</span>
                      </AccordionTrigger>

                      <AccordionContent className="help-section-body">
                        <p className="help-intro">{section.intro}</p>

                        {section.subsections.map((subsection) => (
                          <article key={subsection.id} className="help-subsection">
                            <h3>{subsection.title}</h3>
                            {subsection.blocks.map((block, index) => renderBlock(block, `${subsection.id}-${index}`))}
                          </article>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </div>
        </div>
      </div>

      <div className="help-footer">
        <AppFooter leftText={t('footer.device')} />
      </div>
    </main>
  )
}
