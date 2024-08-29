const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const POKEMON_COUNT = 1302;

class Pokemon {
    constructor(name, types, sprites, id) {
        this.name = name;
        this.types = types;
        this.sprites = sprites;
        this.id = id; // Utiliza el id para construir la URL de detalles
        this.url = `${API_URL}${id}`; // Construye la URL de detalles usando el id
    }

    getDetails() {
        return fetch(this.url)
            .then(response => {
                if (!response.ok) { 
                    throw new Error("Pokémon no encontrado");
                }
                return response.json();
            })
            .then(data => {
                this.weight = data.weight / 10; // peso en kg
                this.moves = data.moves.slice(0, 5).map(move => move.move.name); // Primeros 5 movimientos
                return this;
            })
            .catch(error => {
                console.error('Error al obtener detalles del Pokémon:', error);
            });
    }
}

document.addEventListener('DOMContentLoaded', () => { //Aquí decimos "Cuando toda la página esté cargada y lista, ejecuta la función que está dentro".
    const pokemonList = document.getElementById('pokemon-list');
    const searchBar = document.getElementById('search-bar');
    let pokemons = [];

    // Obtener lista inicial de pokemones
    const fetchPokemon = (id) => {
        return fetch(`${API_URL}${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Pokemon no encontrado");
                }
                return res.json()
            })
            .then(data => {
                const types = data.types.map(typeInfo => typeInfo.type.name);
                const sprites = data.sprites;
                return new Pokemon(data.name, types, sprites, id); 
            })
            .catch(error => {
                console.error('Error al obtener el Pokémon:', error);
                return null; // Retorna null en caso de error para evitar añadir pokemones inválidos
            });
    };

    const fetchAllPokemons = () => {
        const promises = [];
        for (let i = 1; i <= POKEMON_COUNT; i++) {
            promises.push(fetchPokemon(i));
        }

        return Promise.all(promises);
    };

    fetchAllPokemons().then(results => {
        // Filtrar resultados que no sean null
        pokemons = results.filter(pokemon => pokemon !== null);
        renderPokemons(pokemons);
    });

    // renderizar las cartas de pokemon
    function renderPokemons(pokemons) { //Esta funcion toma todos los pokemones y los muestra en la pagina.
        pokemonList.innerHTML = '';
        pokemons.forEach(pokemon => {
            const card = document.createElement('div');
            card.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

            const cardContent = `
                <div class="card pokemon-card">
                    <div class="card-body text-center">
                        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                        <h5 class="card-title text-center text-capitalize">${pokemon.name}</h5>
                        <p class="card-text text-center">
                            ${pokemon.types.map(type => `<span class="pokemon-type type-${type}">${type}</span>`).join('')}
                        </p>
                        <button class="btn btn-primary w-100" onclick="showDetails('${pokemon.name}')">Ver detalles</button>
                    </div>
                </div>
            `;

            card.innerHTML = cardContent;
            pokemonList.appendChild(card);
        });
    }

    // Filtrar los pokemones por nombre
    searchBar.addEventListener('keyup', () => { //Aquí añadimos un evento que se activa cada vez que el usuario escribe algo en la barra de búsqueda (keyup).
        const searchTerm = searchBar.value.toLowerCase();
        const filteredPokemons = pokemons.filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm));
        renderPokemons(filteredPokemons);
    });

    // Muestra los detalles del pokemon en un modal
    window.showDetails = (name) => {
        const pokemon = pokemons.find(p => p.name === name);
        if (pokemon) {
            pokemon.getDetails().then(() => {
                const modalTitle = document.getElementById('pokemonModalLabel');
                const modalWeight = document.getElementById('pokemon-weight');
                const modalMoves = document.getElementById('pokemon-moves');

                modalTitle.textContent = pokemon.name;
                modalWeight.textContent = pokemon.weight;
                modalMoves.innerHTML = pokemon.moves.map(move => `<li>${move}</li>`).join('');

                const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));
                pokemonModal.show();
            });
        } else {
            console.error('Pokemon no encontrado:', id);
        }
    };
});
