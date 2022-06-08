// select search bar
const searchBar = document.querySelector('.search');

// function to update page with user search value
function handleSearch() {

  // set the typed text to upper case and store as variable
  let searchInput = searchBar.value.toUpperCase();
  console.log(searchInput);
}

searchBar.addEventListener('keyup', () => handleSearch());