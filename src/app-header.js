const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<style>
  span {
    font-family: ace-attorney;
    font-size: 2.5rem;
  }
  @media only screen and (max-width:1023px) {
    span {
      font-family: ace-attorney;
      font-size: 1.5rem;
    }
  }
</style>
<span class="has-text-white-ter navbar-item" id="name"></span>
`;

class AppHeader extends HTMLElement{
    constructor(){
      super();
      // 1 - attach a shadow DOM tree to this instance - this creates `.shadowRoot` for us
      this.attachShadow({mode: "open"});

      // 2 - Clone `template` and append it
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      // grab the attribute values, and assign a default value if necessary
      const name = this.getAttribute('data-name') ? this.getAttribute('data-name') : "Unknown";

      this.shadowRoot.querySelector("#name").innerHTML = `${name}`;
    }
  } 
	
  customElements.define('app-header', AppHeader);