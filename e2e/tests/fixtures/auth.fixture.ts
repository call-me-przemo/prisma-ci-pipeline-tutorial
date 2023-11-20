import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import prisma from '../helpers/prisma'
import { faker } from '@faker-js/faker'
import { LocalStorage } from '../helpers/localStorage'

type UserDetails = {
  username: string
  password: string
}

type AuthFixtures = {
  loginPage: LoginPage
  userCredentials: UserDetails
  account: UserDetails
  storage: LocalStorage
}

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await use(loginPage)
  },
  userCredentials: async ({}, use) => {
    const username = faker.internet.userName()
    const password = faker.internet.password()

    await use({
      username,
      password
    })

    await prisma.user.deleteMany({ where: { username } })
  },
  account: async ({ browser, userCredentials }, use) => {
    const page = await browser.newPage()
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.populateForm(
      userCredentials.username,
      userCredentials.password
    )
    await page.click('#signup')
    await page.waitForLoadState('networkidle')
    await page.close()
    await use(userCredentials)
  },
  storage: async ({ page }, use) => {
    const storage = new LocalStorage(page.context())
    await use(storage)
  }
})

export { expect } from '@playwright/test'
