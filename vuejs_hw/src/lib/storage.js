const STORAGE_NAME = "auo-object";

function getObjects() {
  return JSON.parse(localStorage.getItem(STORAGE_NAME));
}

function saveObjects(objects) {
  localStorage.setItem(STORAGE_NAME, JSON.stringify(objects));
}

export { getObjects, saveObjects };
