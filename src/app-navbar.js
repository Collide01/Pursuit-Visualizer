const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<style>
  nav {
    background-color: black;
    background-repeat: no-repeat;
    background-size: cover;
    height: 5rem;
    color: white;
  }
  span {
    color: white;
  }
  img {
    max-height: 70px;
  }

  @media only screen and (max-width:1023px) {
    nav {
      background-color: black;
      background-repeat: no-repeat;
      background-size: cover;
      height: 3rem;
      color: white;
    }
    #nav-links {
      color: white;
      background-color: black;
    }
    img {
      max-height: 30px;
    }
  }
</style>
<nav class="navbar has-shadow is-black">
    <!-- logo / page name -->
    <div class="navbar-brand">
      <a class="navbar-item" href="index.html">
        <img src="./images/badge.png" alt="site logo" class="px-2">
      </a>
      <app-header data-name="" id="header-name"></app-header>
      <a class="has-text-white-ter navbar-burger" id="burger">
        <span></span>
        <span></span>
        <span></span>
      </a>
    </div>

    <div class="navbar-menu" id="nav-links">
      <div class="navbar-end">
        <a class="navbar-item" href="index.html" id="index">Home</a>
        <a class="navbar-item" href="app.html" id="app">App</a>
        <a class="navbar-item" href="documentation.html" id="documentation">Documentation</a>
      </div>
    </div>
</nav>
`;

class AppNavbar extends HTMLElement{
    constructor(){
      super();
      // 1 - attach a shadow DOM tree to this instance - this creates `.shadowRoot` for us
      this.attachShadow({mode: "open"});

      // 2 - Clone `template` and append it
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      // grab the attribute values, and assign a default value if necessary
      const name = this.getAttribute('data-name') ? this.getAttribute('data-name') : "Unknown";

      this.shadowRoot.querySelector("#header-name").setAttribute('data-name', name);
      this.burger = this.shadowRoot.querySelector("#burger");
      this.navbarMenu = this.shadowRoot.querySelector("#nav-links");

      if (name == "HOME") {
        this.shadowRoot.querySelector("#index").style.color = "yellow";
      }
      else {
        this.shadowRoot.querySelector("#index").style.color = "white";
      }
      if (name == "APP") {
        this.shadowRoot.querySelector("#app").style.color = "yellow";
      }
      else {
        this.shadowRoot.querySelector("#app").style.color = "white";
      }
      if (name == "DOCUMENTATION") {
        this.shadowRoot.querySelector("#documentation").style.color = "yellow";
      }
      else {
        this.shadowRoot.querySelector("#documentation").style.color = "white";
      }
    }

    connectedCallback() {
        if (this.burger) this.burger.onclick = () => this.navbarMenu.classList.toggle("is-active");
    }

    disconnectedCallback() {
        this.burger.onclick = null;
    }
} 
	
  customElements.define('app-navbar', AppNavbar);