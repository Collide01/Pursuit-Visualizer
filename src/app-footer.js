const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
<style>
  footer {
    position: relative;
    bottom: 0;
    color: white;
  }
</style>
<footer class="has-background-dark pt-0 pb-0 is-size-3-desktop">
    <div class="content has-text-centered">
        <span></span>
    </div>  
</footer>
`;

class AppFooter extends HTMLElement{
    constructor(){
      super();
      // 1 - attach a shadow DOM tree to this instance - this creates `.shadowRoot` for us
      this.attachShadow({mode: "open"});

      // 2 - Clone `template` and append it
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      // grab the attribute values, and assign a default value if necessary
      const year = this.getAttribute('data-year') ? this.getAttribute('data-year') : "1995";
      const text = this.getAttribute('data-text') ? this.getAttribute('data-text') : "Nobody";

      this.shadowRoot.querySelector("span").innerHTML = `&copy; Copyright ${year}, ${text}`;
    }
  } 
	
  customElements.define('app-footer', AppFooter);