let pollingInterval: number | null = null;
let isPaused = false;
let listeners: (() => void)[] = [];

export function startPolling(fetchFn: () => void) {
  if (pollingInterval !== null) return; // already running

  isPaused = false;
  fetchFn(); // initial call

  pollingInterval = window.setInterval(() => {
    if (!isPaused) {
      fetchFn();
      notifyListeners();
    }
  }, 2_000);
}

export function pausePolling() {
  isPaused = true;
  if (pollingInterval !== null) {
    window.clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

export function stopPolling() {
  if (pollingInterval !== null) {
    window.clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}
