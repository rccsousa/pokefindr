import './App.css';

import React, { useState} from 'react';

// make output prettier.
function capitalize(str) {
  // Check if string is empty
  if (str.length === 0) return str;

  // Capitalize first letter and concatenate with the rest of the string
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isPokemonCached(cache,param) {
  return cache.hasOwnProperty(param);
}

function getPokemonFromCache(cache, param) {
  if (isPokemonCached(cache, param)) {
    return cache[param]
  } else {
    return false 
  }
}



function App() {

  // handle pkmn data
  const [pokemonData, setPokemonData] = useState('');
  // handle search box
  const [inputText, setInputText] = useState('');


  // notification handler
  const [notification, setNotification] = useState('');
  // caching attempt
  const pokemonCache = {}

    // fetchdata function to search for pokemon
  const fetchData = async (searchValue , searchType) => {
      // Check if the input text is empty
      if (!inputText) {
        return; // If empty, do nothing
      }

      let Url = '';
      if (searchType === 'name') {
        Url = `https://pokeapi.co/api/v2/pokemon/${inputText.toLowerCase()}`;        
      }

      else if (searchType === 'id') {
        Url = `https://pokeapi.co/api/v2/pokemon/${searchValue}`
      }

      try {
        // Fetch Pokémon data based on the input text (Pokémon name)
        const response = await fetch(Url);
        if (response.ok) {
          // If response is successful, parse the data
          const data = await response.json();
          // Update the state with the fetched Pokémon data
          setPokemonData({
            name: capitalize(data.name),
            sprite: data.sprites.front_default,
            id: data.id,
            cry: data.cries.latest
          });

          // caching attempt
          pokemonCache[searchValue] = {
            name: capitalize(data.name),
            sprite: data.sprites.front_default,
            id: data.id,
            cry: data.cries.latest
          }

        } else {
          // If Pokémon with the provided name does not exist, update state accordingly
          setNotification(`${searchValue} does not exist.`)
          
        }

        

      } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
      }
    };

  
  // event handlers

  // handle changes to input box
  const handleInputChange =  (event) => {
    setInputText(event.target.value);
  };

  // handle changes to search buttons
  const handleSearchClick = () => {
    setNotification('');
    
  
    // Check if Pokémon data is cached
    const cachedPokemon = getPokemonFromCache(pokemonCache, inputText);
    if (cachedPokemon) {
      // If cached, update the component state with cached data
      setPokemonData(cachedPokemon);
    } else {
      // If not cached, fetch Pokémon data from the API
      fetchData(inputText, 'name');
    }
  };

  const handleNextClick = () => {
    setNotification('');
    
    if (pokemonData.id < 1025) {
    const nextID = parseInt(pokemonData.id) +1
    const cachedPokemon = getPokemonFromCache(pokemonCache, nextID.toString())

      if (cachedPokemon) {
        setPokemonData(cachedPokemon)
      }

      else { fetchData(nextID, 'id');}
    }

    else if (pokemonData.id === 1025) {
      setNotification(`${pokemonData.name} is the last known Pokémon `)
    };   
  };

  const handlePreviousClick = () => {
    setNotification('');
    
    if (pokemonData.id === 1) {
    setNotification("There are no previous Pokémon")
    }

    else {
      
      const previousID = parseInt(pokemonData.id) - 1
      const cachedPokemon = getPokemonFromCache(pokemonCache, previousID.toString())

      if (cachedPokemon) {
        setPokemonData(cachedPokemon)
      } else { fetchData(previousID, 'id');}
    }
  }


  const handlePlayCry = () => {
    if (pokemonData.cry) {
      const audio = new Audio(pokemonData.cry);
      audio.play();
    }

  }


  return (
    <div className="App">
      <div>
      <input
      type='text'
      value = {inputText}
      onChange={handleInputChange}
      placeholder='hey-ya!'
      />
      <button onClick={handleSearchClick}>Search</button>
      </div>
      <div>
        <h2>{pokemonData.name}</h2>
        {pokemonData.sprite && <img src={pokemonData.sprite} alt="Pokemon Sprite" /> }
        <h1>{pokemonData.id}</h1>
        <button onClick={handlePreviousClick}>View previous</button>
        <button onClick={handleNextClick}>View next</button>
        <button onClick={handlePlayCry}>Play cry</button>
        
        <p>{notification}</p>

      </div>

    </div>
  );
}

export default App;
