import * as v from 'valibot'
import { MINUTES_IN_DAY } from '../types'

export const loginSchema = v.object({
  email: v.pipe(v.string(), v.maxLength(255), v.email()),
  password: v.pipe(v.string(), v.minLength(1), v.maxLength(128)),
})

export const registerSchema = v.object({
  email: v.pipe(v.string(), v.maxLength(255), v.email()),
  password: v.pipe(v.string(), v.minLength(6), v.maxLength(128)),
  referralCode: v.optional(v.pipe(v.string(), v.maxLength(32))),
})

export const createNoteSchema = v.object({
  kind: v.optional(v.picklist(['note', 'dream'])),
  title: v.optional(v.pipe(v.string(), v.maxLength(500))),
  body: v.optional(v.pipe(v.string(), v.maxLength(500000))),
  parentId: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(128)))),
  icon: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(32)))),
})

export const updateNoteSchema = v.object({
  kind: v.optional(v.picklist(['note', 'dream'])),
  title: v.optional(v.pipe(v.string(), v.maxLength(500))),
  body: v.optional(v.pipe(v.string(), v.maxLength(500000))),
  parentId: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(128)))),
  icon: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(32)))),
})

export const createProductivityItemSchema = v.object({
  kind: v.optional(v.pipe(v.string(), v.maxLength(32))),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  date: v.optional(v.pipe(v.string(), v.maxLength(32))),
  repeat: v.optional(v.pipe(v.string(), v.maxLength(32))),
  done: v.optional(v.boolean()),
  priority: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(16)))),
  note: v.optional(v.pipe(v.string(), v.maxLength(5000))),
})

export const updateProductivityItemSchema = v.object({
  title: v.optional(v.pipe(v.string(), v.maxLength(500))),
  date: v.optional(v.pipe(v.string(), v.maxLength(32))),
  repeat: v.optional(v.pipe(v.string(), v.maxLength(32))),
  done: v.optional(v.boolean()),
  priority: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(16)))),
  note: v.optional(v.pipe(v.string(), v.maxLength(5000))),
})

export const friendRequestSchema = v.object({
  email: v.optional(v.pipe(v.string(), v.maxLength(255))),
  friendId: v.optional(v.pipe(v.string(), v.maxLength(128))),
})

export const assignFriendTaskSchema = v.object({
  friendId: v.pipe(v.string(), v.maxLength(128)),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
  date: v.optional(v.pipe(v.string(), v.maxLength(32))),
  priority: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(16)))),
  note: v.optional(v.pipe(v.string(), v.maxLength(5000))),
})

const startMinRule = v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(MINUTES_IN_DAY - 1))
const endMinRule = v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MINUTES_IN_DAY))

export const createAvailabilityWindowSchema = v.object({
  scope: v.optional(v.picklist(['weekly', 'date'])),
  dayOfWeek: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(6)))),
  date: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(32)))),
  startMin: startMinRule,
  endMin: endMinRule,
  note: v.optional(v.pipe(v.string(), v.maxLength(500))),
})

export const updateAvailabilityWindowSchema = v.object({
  scope: v.optional(v.picklist(['weekly', 'date'])),
  dayOfWeek: v.optional(v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(6)))),
  date: v.optional(v.nullable(v.pipe(v.string(), v.maxLength(32)))),
  startMin: v.optional(startMinRule),
  endMin: v.optional(endMinRule),
  note: v.optional(v.pipe(v.string(), v.maxLength(500))),
})
