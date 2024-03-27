import './App.css';

import React, { useState } from 'react';
import { Button, TextField, Box } from '@mui/material';

// TODO: Refactor cache handling
// TODO: Refactor notification handler
// TODO: improve comments

// Function to capitalize the first letter of a string
function capitalize(str) {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to check if a Pokémon is cached
function isPokemonCached(cache, param) {
  return cache.hasOwnProperty(param);
}

// Function to retrieve Pokémon data from the cache
function getPokemonFromCache(cache, param) {
  if (isPokemonCached(cache, param)) {
    return cache[param];
  } else {
    return false;
  }
}

// Main App component
function App() {
  // State variables
  const [pokemonData, setPokemonData] = useState('');
  const [inputText, setInputText] = useState('');
  const [notification, setNotification] = useState('');
  const pokemonCache = {};

  // Function to fetch Pokémon data from the API
  const fetchData = async (searchValue, searchType) => {
    if (!inputText) {
      return;
    }

    let Url = '';
    if (searchType === 'name') {
      Url = `https://pokeapi.co/api/v2/pokemon/${inputText.toLowerCase()}`;
    } else if (searchType === 'id') {
      Url = `https://pokeapi.co/api/v2/pokemon/${searchValue}`;
    }

    try {
      const response = await fetch(Url);
      if (response.ok) {
        const data = await response.json();
        setPokemonData({
          name: capitalize(data.name),
          sprite: data.sprites.front_default,
          id: data.id,
          cry: data.cries.latest
        });

        // Caching the fetched Pokémon data
        pokemonCache[searchValue] = {
          name: capitalize(data.name),
          sprite: data.sprites.front_default,
          id: data.id,
          cry: data.cries.latest
        };
      } else {
        setNotification(`${searchValue} does not exist.`);
        setPokemonData({
          name: 'Pokémon does not exist.',
          sprite: null
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Event handlers
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSearchClick = () => {
    setNotification('');
    const cachedPokemon = getPokemonFromCache(pokemonCache, inputText);
    if (cachedPokemon) {
      setPokemonData(cachedPokemon);
    } else {
      fetchData(inputText, 'name');
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleNextClick = () => {
    setNotification('');
    if (pokemonData.id < 1025) {
      const nextID = parseInt(pokemonData.id) + 1;
      const cachedPokemon = getPokemonFromCache(pokemonCache, nextID.toString());
      if (cachedPokemon) {
        setPokemonData(cachedPokemon);
      } else {
        fetchData(nextID, 'id');
      }
    } else if (pokemonData.id === 1025) {
      setNotification(`${pokemonData.name} is the last known Pokémon `);
    }
  };

  const handlePreviousClick = () => {
    setNotification('');
    if (pokemonData.id === 1) {
      setNotification("There are no previous Pokémon");
    } else {
      const previousID = parseInt(pokemonData.id) - 1;
      const cachedPokemon = getPokemonFromCache(pokemonCache, previousID.toString());
      if (cachedPokemon) {
        setPokemonData(cachedPokemon);
      } else {
        fetchData(previousID, 'id');
      }
    }
  };

  const handlePlayCry = () => {
    if (pokemonData.cry) {
      const audio = new Audio(pokemonData.cry);
      audio.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    }
  };

  return (
    <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Box border='1px solid #ccc' padding="16px">
          <Box display='flex' alignItems="center" justifyContent="center" marginBottom="16px">
            {/* Input field for searching Pokémon */}
            <TextField
              variant='outlined'
              style={{ height: '40px', marginRight: '8px' }}
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleEnterKeyPress}
              placeholder='Input a Pokémon name'
            />
            {/* Search button */}
            <Button variant="contained" onClick={handleSearchClick} style={{ height: '40px' }}>Search</Button>
          </Box>
          {/* Display Pokémon data */}
          <div>
            <Box padding="16px" marginBottom="16px">
              <h2>{pokemonData.name}</h2>
              {pokemonData.sprite && <img src={pokemonData.sprite} alt="Pokemon Sprite" style={{ width: '200px' }} />}
              <p>{notification}</p>
            </Box>
          </div>
          {/* Buttons for playing cry and navigating through Pokémon */}
          <Box display='flex' alignItems="center" justifyContent="center" marginTop="16px">
            <Button variant="contained" onClick={handlePlayCry} onTouchStart={handlePlayCry} style={{ marginRight: '8px' }}>Play Cry</Button>
            <Button variant="contained" onClick={handlePreviousClick} style={{ marginRight: '8px' }}>Previous</Button>
            <Button variant="contained" onClick={handleNextClick}>Next</Button>
          </Box>
        </Box>
      </div>
    </div>
  );
}

export default App;
