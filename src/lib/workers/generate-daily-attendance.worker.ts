onmessage = () => {
  console.log('Hello World 👋');
  postMessage('Hello from the worker!');
};

export { };