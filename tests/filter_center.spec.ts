import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FilterCenterPage from '../src/views/filter-center/index.vue';
import HeadTailFilter from '../src/views/filter-center/components/HeadTailFilter.vue';
import ZodiacFilter from '../src/views/filter-center/components/ZodiacFilter.vue';
import { useRoute, useRouter } from 'vue-router';

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}));

// Mock Vant components
const VantComponents = {
  'van-nav-bar': { template: '<div><slot name="right"></slot></div>' },
  'van-tabs': { 
    template: '<div><slot /></div>',
    props: ['active'],
    emits: ['update:active'] 
  },
  'van-tab': { template: '<div><slot /></div>', props: ['title', 'name'] },
  'van-icon': { template: '<i></i>' },
  'van-button': { template: '<button><slot /></button>' }
};

describe('FilterCenterPage', () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    (useRouter as any).mockReturnValue({
      replace: replaceMock
    });
    replaceMock.mockClear();
  });

  it('should render correctly', () => {
    (useRoute as any).mockReturnValue({ query: {} });

    const wrapper = mount(FilterCenterPage, {
      global: {
        stubs: {
          ...VantComponents,
          HeadTailFilter: true,
          ZodiacFilter: true
        }
      }
    });
    
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findComponent(HeadTailFilter).exists()).toBe(true);
    expect(wrapper.findComponent(ZodiacFilter).exists()).toBe(true);
  });

  it('should set active tab from query', () => {
    (useRoute as any).mockReturnValue({ query: { tab: 'zodiac' } });

    const wrapper = mount(FilterCenterPage, {
      global: {
        stubs: {
          ...VantComponents,
          HeadTailFilter: true,
          ZodiacFilter: true
        }
      }
    });

    // Check vm state
    expect((wrapper.vm as any).activeTab).toBe('zodiac');
  });

  it('should update query when tab changes', async () => {
    (useRoute as any).mockReturnValue({ query: {} });

    const wrapper = mount(FilterCenterPage, {
      global: {
        stubs: {
          ...VantComponents,
          HeadTailFilter: true,
          ZodiacFilter: true
        }
      }
    });

    // Simulate tab change
    (wrapper.vm as any).activeTab = 'zodiac';
    await wrapper.vm.$nextTick();

    expect(replaceMock).toHaveBeenCalledWith(expect.objectContaining({
        query: { tab: 'zodiac' }
    }));
  });
});
