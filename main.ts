import { App } from "$src/components/app";
import { Admin } from "$src/components/admin";

if (window.location.hash === '#admin') {
  Admin.init();
} else {
  App.init();
}

window.addEventListener('hashchange', () => {
  window.location.reload();
});