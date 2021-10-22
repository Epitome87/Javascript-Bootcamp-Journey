const createAutoComplete = ({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) => {
  root.innerHTML = `
    <label><b>Search</b><label>
    <input class="input" />
    <div class="dropdown">
        <div class="dropdown-menu">
            <div class="dropdown-content results"></div>
        </div>
    </div>
`;

  const input = root.querySelector('input');
  const dropdown = root.querySelector('.dropdown');
  const resultsWrapper = root.querySelector('.results');

  const onInput = async (event) => {
    const items = await fetchData(event.target.value);

    if (!items.length) {
      dropdown.classList.remove('is-active');
      return;
    }

    // Clearout the results (in case previous search results present)
    resultsWrapper.innerHTML = ``;

    // Open up the dropdown menu
    dropdown.classList.add('is-active');

    for (let item of items) {
      const option = document.createElement('a');

      option.classList.add('dropdown-item');
      option.innerHTML = renderOption(item);
      option.addEventListener('click', () => {
        // Update value of input search
        input.value = inputValue(item);

        // Close dropdown
        dropdown.classList.remove('is-active');

        onOptionSelect(item);
      });

      resultsWrapper.appendChild(option);
    }
  };

  // Hook our onInput event to the input element's "input" event
  // We wrap it around our debounce function to limit updates!
  input.addEventListener('input', debounce(onInput, 500));

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove('is-active');
    }
  });
};
