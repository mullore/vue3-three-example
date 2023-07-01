import { App, createApp } from 'vue';
import './style.css';
import app from './App.vue';
import router from './router';
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

// createApp(App).mount('#app')
let root: App;

function render(props: any) {
  const { container } = props;
  root = createApp(app);
  const c = container ? container.querySelector('#app') : document.getElementById('app');
  root.use(router).mount(c);
}

qiankunWindow.customxxx = 'ssss';

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('我正在作为子应用运行');
}

renderWithQiankun({
  mount(props) {
    render(props);
  },
  bootstrap() {
    console.log('bootstrap');
  },
  unmount() {
    root.unmount();
  },
  update(props: any) {
    console.log(props);
  },
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
}

// createApp(App).mount('#app')
