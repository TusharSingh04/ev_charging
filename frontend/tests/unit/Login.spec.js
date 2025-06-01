import { mount } from '@vue/test-utils'
import Login from '@/components/Login.vue'
import { createRouter, createWebHistory } from 'vue-router'

describe('Login.vue', () => {
  let wrapper
  let router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/login', component: Login },
        { path: '/register', component: Login }
      ]
    })

    wrapper = mount(Login, {
      global: {
        plugins: [router]
      }
    })
  })

  it('renders login form by default', () => {
    expect(wrapper.find('form.login-form').exists()).toBe(true)
    expect(wrapper.find('form.register-form').exists()).toBe(false)
  })

  it('validates email format', async () => {
    const emailInput = wrapper.find('#email')
    await emailInput.setValue('invalid-email')
    await wrapper.find('form.login-form').trigger('submit')
    
    expect(wrapper.find('.validation-error').text())
      .toContain('Please enter a valid email address')
  })

  it('validates password length', async () => {
    const passwordInput = wrapper.find('#password')
    await passwordInput.setValue('12345')
    await wrapper.find('form.login-form').trigger('submit')
    
    expect(wrapper.find('.validation-error').text())
      .toContain('Password must be at least 6 characters long')
  })

  it('toggles between login and register forms', async () => {
    await wrapper.find('.toggle-form-text a').trigger('click')
    expect(wrapper.find('form.register-form').exists()).toBe(true)
    expect(wrapper.find('form.login-form').exists()).toBe(false)
  })
}) 