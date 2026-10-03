import { useState } from 'react'
import { Check, Coins, Crown, Zap, Star, Bell, Heart, Info, AlertTriangle } from 'lucide-react'
import {
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tooltip,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
} from '../../shared/ui'
import './DevComponentsPage.css'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="dev-section">
    <h2 className="dev-section-title">{title}</h2>
    <div className="dev-section-body">{children}</div>
  </section>
)

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="dev-row">
    <span className="dev-row-label">{label}</span>
    <div className="dev-row-items">{children}</div>
  </div>
)

export const DevComponentsPage = () => {
  const [switchA, setSwitchA] = useState(false)
  const [switchB, setSwitchB] = useState(true)
  const [switchC, setSwitchC] = useState(false)
  const [tab, setTab] = useState('badge')
  const [selectVal, setSelectVal] = useState('')
  const [inputVal, setInputVal] = useState('')

  return (
    <div className="dev-page">
      <header className="dev-header">
        <h1 className="dev-header-title">Design System</h1>
        <p className="dev-header-sub">Витрина компонентов · только в DEV-режиме</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Компонент">
          <TabsTrigger value="badge">Badge</TabsTrigger>
          <TabsTrigger value="button">Button</TabsTrigger>
          <TabsTrigger value="tabs">Tabs</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="overlay">Overlay</TabsTrigger>
          <TabsTrigger value="accordion">Accordion</TabsTrigger>
        </TabsList>

        <TabsContent value="badge">
          <Section title="Badge — варианты">
            <Row label="Variants">
              <Badge variant="default">default</Badge>
              <Badge variant="accent">accent</Badge>
              <Badge variant="coral">coral</Badge>
              <Badge variant="muted">muted</Badge>
              <Badge variant="success">success</Badge>
              <Badge variant="outline">outline</Badge>
              <Badge variant="warning">warning</Badge>
              <Badge variant="vip">vip</Badge>
              <Badge variant="price">price</Badge>
              <Badge variant="count">42</Badge>
            </Row>
            <Row label="Sizes">
              <Badge size="sm">small</Badge>
              <Badge size="md">medium</Badge>
              <Badge size="lg">large</Badge>
            </Row>
            <Row label="With icon">
              <Badge variant="success" icon={<Check size={12} />}>
                Куплено
              </Badge>
              <Badge variant="price" icon={<Coins size={12} />}>
                250 🪙
              </Badge>
              <Badge variant="vip" icon={<Crown size={12} />}>
                ADMIN
              </Badge>
              <Badge variant="warning" icon={<AlertTriangle size={12} />}>
                Внимание
              </Badge>
            </Row>
            <Row label="Interactive">
              <Badge variant="accent" interactive>
                Нажми
              </Badge>
              <Badge variant="outline" interactive icon={<Star size={11} />}>
                Избранное
              </Badge>
            </Row>
          </Section>
        </TabsContent>

        <TabsContent value="button">
          <Section title="Button — варианты">
            <Row label="Variants">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="danger">Danger</Button>
            </Row>
            <Row label="Sizes">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row label="With icon">
              <Button leftIcon={<Zap size={14} />}>С иконкой</Button>
              <Button variant="outline" leftIcon={<Heart size={14} />}>
                Нравится
              </Button>
            </Row>
            <Row label="States">
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
              <Button isLoading>Loading</Button>
            </Row>
          </Section>
        </TabsContent>

        <TabsContent value="tabs">
          <Section title="Tabs">
            <Tabs defaultValue="one">
              <TabsList>
                <TabsTrigger value="one">Первый</TabsTrigger>
                <TabsTrigger value="two">
                  Второй{' '}
                  <Badge variant="count" size="sm" className="dev-tab-badge">
                    3
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="three">Третий</TabsTrigger>
              </TabsList>
              <TabsContent value="one">
                <div className="dev-tab-content">Контент первого таба</div>
              </TabsContent>
              <TabsContent value="two">
                <div className="dev-tab-content">Контент второго таба</div>
              </TabsContent>
              <TabsContent value="three">
                <div className="dev-tab-content">Контент третьего таба</div>
              </TabsContent>
            </Tabs>
          </Section>
        </TabsContent>

        <TabsContent value="form">
          <Section title="Switch">
            <Row label="States">
              <Switch checked={switchA} onCheckedChange={setSwitchA} label="Выкл" />
              <Switch checked={switchB} onCheckedChange={setSwitchB} label="Вкл" />
              <Switch checked={switchC} onCheckedChange={setSwitchC} label="Disabled" disabled />
            </Row>
          </Section>
          <Section title="Input">
            <Row label="Text">
              <Input placeholder="Введи что-нибудь..." value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
            </Row>
          </Section>
          <Section title="Select">
            <Row label="Options">
              <Select value={selectVal} onValueChange={setSelectVal}>
                <SelectTrigger className="dev-select">
                  <SelectValue placeholder="Выбери..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Вариант А</SelectItem>
                  <SelectItem value="b">Вариант Б</SelectItem>
                  <SelectItem value="c">Вариант В</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </Section>
        </TabsContent>

        <TabsContent value="overlay">
          <Section title="Tooltip">
            <Row label="Default">
              <Tooltip content="Это тултип с подсказкой">
                <Button variant="outline">
                  <Info size={14} /> Наведи
                </Button>
              </Tooltip>
              <Tooltip content="Нет новых уведомлений">
                <Button variant="ghost">
                  <Bell size={14} /> Уведомления
                </Button>
              </Tooltip>
            </Row>
          </Section>
        </TabsContent>

        <TabsContent value="accordion">
          <Section title="Accordion">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Что такое дизайн-система?</AccordionTrigger>
                <AccordionContent>
                  Набор переиспользуемых компонентов и токенов, которые обеспечивают визуальную согласованность продукта.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Почему Radix UI?</AccordionTrigger>
                <AccordionContent>
                  Headless-примитивы с поддержкой ARIA, клавиатурной навигации и фокус-менеджмента из коробки.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Как добавить новый компонент?</AccordionTrigger>
                <AccordionContent>
                  Создать в <code>src/shared/ui/</code>, добавить в <code>index.ts</code> и представить здесь в витрине.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
