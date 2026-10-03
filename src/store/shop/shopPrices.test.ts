import { describe, expect, it } from 'vitest'
import { PART_PRICES } from './shopStore'
import { SHOP_PART_PRICES } from '../../../worker/src/lib/economy'

describe('shop prices', () => {
  it('keeps client and server price maps in sync', () => {
    expect(PART_PRICES).toEqual(SHOP_PART_PRICES)
  })
})
