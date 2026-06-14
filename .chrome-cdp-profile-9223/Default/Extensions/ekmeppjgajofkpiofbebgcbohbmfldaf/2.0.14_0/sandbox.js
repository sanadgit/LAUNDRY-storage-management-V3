window.addEventListener('message', (event) => {
  switch (event.data.cmd) {
    case 'eval-function':
      eval(event.data.data.cb)
      break;
    default:
      // do nothing
  }
});