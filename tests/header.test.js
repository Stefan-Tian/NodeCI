const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("should have correct text in the header", async () => {
  const text = await page.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("should start oauth flow when clicking log in button", async () => {
  // select the classes
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch("/accounts.google.com");
});

test("should show logout button when signed in", async () => {
  await page.login();
  const text = await page.getContentsOf("a[href='/auth/logout']");

  expect(text).toEqual("Logout");
});
