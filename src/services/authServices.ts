
// clear the sync storage
export const logoutUser = () => {
  chrome.storage.sync.clear();
};
