const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    // target is customPage
    return new Proxy(customPage, {
      get: function(target, property) {
        return target[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory(); // it's returning a promise

    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitFor("a[href='/auth/logout']"); // wait for it to appear then continue
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    // the function in evaluate will be turned to a string
    // we need to reference the path variable as the second
    // argument in the evaluate function
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    // promise will wait for them all to resolve
    return Promise.all(
      actions.map(({ method, path, data }) => {
        // this means page
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;
