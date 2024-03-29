import { render, screen , fireEvent, waitFor} from '@testing-library/react';
import App from './App';

global.fetch = jest.fn()

describe('fetchData', () => {
  test('fetches Pokemon data successfully', async () => {
    const mockedResponse = {
      ok: true,
      json: async () => ({
        name: 'Pikachu',
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
        id: '25',
        cries: { latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg" }
      }),
    };
    fetch.mockResolvedValueOnce(mockedResponse);

    const { getByText, getByPlaceholderText } = render(<App />);

    const input = getByPlaceholderText('Input a Pokémon name');
    fireEvent.change(input, { target: { value: 'Pikachu' } });

    const searchButton = getByText('Search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(getByText('Pikachu')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
    });
  });

  test('user inputs a non-existing pokemon', async () => {
    // Mock failed response from the API
    const mockedResponse = {
      ok: false,
    };
    fetch.mockResolvedValueOnce(mockedResponse);
  
    const { getByText, getByPlaceholderText, queryByText } = render(<App />);
  
    // Simulate user input and click on the search button
    const input = getByPlaceholderText('Input a Pokémon name');
    fireEvent.change(input, { target: { value: 'nope' } });
    fireEvent.click(getByText('Search'));
  
    // Wait for the error message to be displayed
    await waitFor(() => {
      // Ensure the error message is displayed
      expect(getByText("Pokémon does not exist.")).toBeInTheDocument();
    });
  
    // Ensure fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/nope');
  });
});

describe('Next Button', () => {
  test('Displays data for the next Pokémon when clicked', async () => {
    // Mock response for the current Pokémon
    const mockedResponseCurrent = {
      ok: true,
      json: async () => ({
        name: 'Pikachu',
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
        id: '25',
        cries: { latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg" }
      }),
    };

    // Mock response for the next Pokémon
    const mockedResponseNext = {
      ok: true,
      json: async () => ({
        name: 'Raichu',
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png" },
        id: '26',
        cries: { latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/26.ogg" }
      }),
    };

    fetch.mockResolvedValueOnce(mockedResponseCurrent);
    fetch.mockResolvedValueOnce(mockedResponseNext); // Mock next Pokémon data

    render(<App />);

    // Simulate user input and click on the search button to fetch initial Pokémon data
    fireEvent.change(screen.getByPlaceholderText('Input a Pokémon name'), { target: { value: 'Pikachu' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Simulate clicking the Next button
    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      // Ensure the displayed Pokémon data is updated to the next Pokémon
      expect(screen.getByText('Raichu')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(2); // Ensure fetch was called twice
      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/26'); // Ensure fetch was called with the correct URL for the next Pokémon
    });
  });
});

describe('Previous Button', () => {
  test('Displays data for the previous Pokémon when clicked', async () => {
    // Mock response for the current Pokémon
    const mockedResponseCurrent = {
      ok: true,
      json: async () => ({
        name: 'Pikachu',
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
        id: '25',
        cries: { latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg" }
      }),
    };

    // Mock response for the previous Pokémon
    const mockedResponsePrevious = {
      ok: true,
      json: async () => ({
        name: 'Arbok',
        sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png" },
        id: '24',
        cries: { latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/24.ogg" }
      }),
    };

    fetch.mockResolvedValueOnce(mockedResponseCurrent);
    fetch.mockResolvedValueOnce(mockedResponsePrevious); // Mock previous Pokémon data

    render(<App />);

    // Simulate user input and click on the search button to fetch initial Pokémon data
    fireEvent.change(screen.getByPlaceholderText('Input a Pokémon name'), { target: { value: 'Pikachu' } });
    fireEvent.click(screen.getByText('Search'));

    await waitFor(() => {
      expect(screen.getByText('Pikachu')).toBeInTheDocument();
    });

    // Simulate clicking the Previous button
    fireEvent.click(screen.getByText('Previous'));

    await waitFor(() => {
      // Ensure the displayed Pokémon data is updated to the previous Pokémon
      expect(screen.getByText('Arbok')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(2); // Ensure fetch was called twice
      expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/24'); // Ensure fetch was called with the correct URL for the previous Pokémon
    });
  });
});
