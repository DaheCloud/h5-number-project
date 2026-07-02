import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterCenterPage from '../src/views/filter-center/index.vue'
import HeadTailFilter from '../src/views/filter-center/components/HeadTailFilter.vue'
import ZodiacFilter from '../src/views/filter-center/components/ZodiacFilter.vue'
import ConditionFilter from '../src/views/filter-center/components/ConditionFilter.vue'
import { useRoute, useRouter } from 'vue-router'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

describe('FilterCenterPage', () => {
  const replaceMock = vi.fn()

  beforeEach(() => {
    (useRouter as any).mockReturnValue({ replace: replaceMock })
    replaceMock.mockClear()
  })

  it('should render correctly', () => {
    (useRoute as any).mockReturnValue({ query: {} })

    const wrapper = mount(FilterCenterPage, {
      global: {
        stubs: {
          HeadTailFilter: true,
          ZodiacFilter: true,
          ConditionFilter: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent(HeadTailFilter).exists()).toBe(true)
  })

  it('should set active tab from query', () => {
    (useRoute as any).mockReturnValue({ query: { tab: 'zodiac' } })

    const wrapper = mount(FilterCenterPage, {
      global: {
        stubs: {
          HeadTailFilter: true,
          ZodiacFilter: true,
          ConditionFilter: true
        }
      }
    })

    expect((wrapper.vm as any).activeTab).toBe('zodiac')
  })

  it('should update query when tab changes', async () => {
    (useRoute as any).mockReturnValue({ query: {} })

    const wrapper = mount(FilterCenterPage, {
      global: {
        stubs: {
          HeadTailFilter: true,
          ZodiacFilter: true,
          ConditionFilter: true
        }
      }
    })

    ;(wrapper.vm as any).activeTab = 'zodiac'
    await wrapper.vm.$nextTick()

    expect(replaceMock).toHaveBeenCalledWith(expect.objectContaining({
      query: { tab: 'zodiac' }
    }))
  })
})
